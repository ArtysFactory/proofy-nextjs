import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';
import { anchorToBlockchain, simulateAnchor } from '@/lib/blockchain';
import { 
  getSignatureNotificationHTML, 
  getAnchoringNotificationHTML,
  type SignatureNotificationParams,
  type AnchoringNotificationParams
} from '@/lib/email/templates/notification';

// ============================================
// PROOFY - Sign Invitation API
// With automatic blockchain anchoring & notifications
// ============================================

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const jwtSecret = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';
    const secretKey = new TextEncoder().encode(jwtSecret);

    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

// Send email via MailerSend
async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) {
    console.log('[Notification] DEV MODE - Would send email to:', to);
    return true;
  }

  try {
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: {
          email: 'noreply@unlmtdproof.com',
          name: 'UnlmtdProof'
        },
        to: [{ email: to }],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Notification] Email send failed:', errorText);
      return false;
    }

    console.log('[Notification] Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('[Notification] Email error:', error);
    return false;
  }
}

// GET /api/sign/[token] - Get invitation details (public, no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length !== 64) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const sql = neon(databaseUrl);

    // Get invitation with creation and inviter details
    const invitation = await sql`
      SELECT 
        di.id,
        di.invitee_email,
        di.role_type,
        di.role_label,
        di.percentage,
        di.status,
        di.created_at,
        di.viewed_at,
        di.signed_at,
        di.expires_at,
        di.rejection_reason,
        c.id as creation_id,
        c.title as creation_title,
        c.project_type,
        c.file_hash,
        c.made_by,
        c.created_at as creation_date,
        u.first_name as inviter_first_name,
        u.last_name as inviter_last_name,
        u.email as inviter_email
      FROM deposit_invitations di
      LEFT JOIN creations c ON di.creation_id = c.id
      LEFT JOIN users u ON di.inviter_id = u.id
      WHERE di.token = ${token}
    `;

    if (!invitation[0]) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 });
    }

    const inv = invitation[0];

    // Check if expired - compare timestamps to avoid timezone issues
    const now = Date.now();
    const expiresAt = new Date(inv.expires_at).getTime();
    const isExpired = now > expiresAt;

    // Debug log for expiration issues
    console.log('[Sign API] Invitation check:', {
      token: token.substring(0, 8) + '...',
      status: inv.status,
      expiresAt: inv.expires_at,
      expiresAtTimestamp: expiresAt,
      nowTimestamp: now,
      isExpired,
      diffMs: expiresAt - now,
      diffDays: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
    });

    if (isExpired && (inv.status === 'pending' || inv.status === 'viewed')) {
      // Auto-update status to expired
      await sql`
        UPDATE deposit_invitations
        SET status = 'expired'
        WHERE token = ${token}
      `;
      inv.status = 'expired';
    }

    // Mark as viewed if first time
    if (!inv.viewed_at && inv.status === 'pending') {
      await sql`
        UPDATE deposit_invitations
        SET viewed_at = NOW()
        WHERE token = ${token}
      `;

      // Log the view
      await sql`
        INSERT INTO signature_history (
          invitation_id,
          action,
          ip_address,
          user_agent,
          created_at
        )
        VALUES (
          ${inv.id},
          'viewed',
          ${request.headers.get('x-forwarded-for') || 'unknown'},
          ${request.headers.get('user-agent') || 'unknown'},
          NOW()
        )
      `;
    }

    // Calculate time remaining
    const timeRemaining = expiresAt - now;
    const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));

    // Get all signatories for this creation
    let allSignatories: any[] = [];
    if (inv.creation_id) {
      const signatories = await sql`
        SELECT 
          invitee_email,
          role_label,
          role_type,
          percentage,
          status,
          signed_at
        FROM deposit_invitations
        WHERE creation_id = ${inv.creation_id}
        ORDER BY created_at ASC
      `;
      allSignatories = signatories.map((s: any) => ({
        email: s.invitee_email,
        role: s.role_label || s.role_type,
        percentage: s.percentage,
        status: s.status === 'accepted' ? 'signed' : s.status,
        signedAt: s.signed_at,
      }));
    }

    // Normalize status for frontend (accepted -> signed)
    const normalizedStatus = inv.status === 'accepted' ? 'signed' : inv.status;

    return NextResponse.json({
      invitation: {
        id: inv.id,
        email: inv.invitee_email,
        role: inv.role_label || inv.role_type,
        percentage: parseFloat(inv.percentage),
        status: normalizedStatus,
        createdAt: inv.created_at,
        expiresAt: inv.expires_at,
        daysRemaining,
        isExpired,
        rejectionReason: inv.rejection_reason,
      },
      creation: inv.creation_id ? {
        id: inv.creation_id,
        title: inv.creation_title,
        projectType: inv.project_type,
        fileHash: inv.file_hash,
        madeBy: inv.made_by,
        createdAt: inv.creation_date,
      } : null,
      depositor: {
        name: `${inv.inviter_first_name || ''} ${inv.inviter_last_name || ''}`.trim() || inv.inviter_email,
        email: inv.inviter_email,
      },
      allSignatories,
      requiresAccount: true,
    });

  } catch (error: any) {
    console.error('[Sign API] Get invitation error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}

// POST /api/sign/[token] - Accept or reject invitation (requires auth)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // User must be authenticated to sign
    const payload = await verifyToken(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Vous devez créer un compte ou vous connecter pour signer', requiresAuth: true },
        { status: 401 }
      );
    }

    if (!token || token.length !== 64) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { action, reason: rejectionReason } = body;

    // Support both 'sign'/'accept' and 'reject'
    const normalizedAction = action === 'sign' ? 'accept' : action;
    if (!normalizedAction || !['accept', 'reject'].includes(normalizedAction)) {
      return NextResponse.json({ error: 'Action invalide (sign/reject)' }, { status: 400 });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const sql = neon(databaseUrl);

    // Get invitation with creation and depositor info
    const invitation = await sql`
      SELECT 
        di.*,
        c.title as creation_title,
        c.file_hash,
        c.public_id,
        c.project_type,
        c.cosignature_count,
        c.cosignature_signed_count,
        u.email as depositor_email,
        u.first_name as depositor_first_name,
        u.last_name as depositor_last_name
      FROM deposit_invitations di
      LEFT JOIN creations c ON di.creation_id = c.id
      LEFT JOIN users u ON di.inviter_id = u.id
      WHERE di.token = ${token}
    `;

    if (!invitation[0]) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 });
    }

    const inv = invitation[0];

    // Check status
    if (inv.status !== 'pending' && inv.status !== 'viewed') {
      return NextResponse.json(
        { error: `Cette invitation a déjà été ${inv.status === 'accepted' ? 'acceptée' : inv.status === 'rejected' ? 'refusée' : 'traitée'}` },
        { status: 400 }
      );
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(inv.expires_at);
    if (now > expiresAt) {
      await sql`UPDATE deposit_invitations SET status = 'expired' WHERE token = ${token}`;
      return NextResponse.json({ error: 'Cette invitation a expiré' }, { status: 400 });
    }

    // Verify email matches
    const user = await sql`SELECT id, email, first_name, last_name FROM users WHERE id = ${payload.userId}`;
    if (!user[0] || user[0].email.toLowerCase() !== inv.invitee_email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cette invitation n\'est pas destinée à votre compte. Connectez-vous avec l\'email: ' + inv.invitee_email },
        { status: 403 }
      );
    }

    const newStatus = normalizedAction === 'accept' ? 'accepted' : 'rejected';
    const signerName = `${user[0].first_name || ''} ${user[0].last_name || ''}`.trim() || user[0].email;
    const depositorName = `${inv.depositor_first_name || ''} ${inv.depositor_last_name || ''}`.trim() || inv.depositor_email;

    // Update invitation
    await sql`
      UPDATE deposit_invitations
      SET 
        status = ${newStatus},
        invitee_user_id = ${payload.userId},
        signed_at = NOW(),
        rejection_reason = ${normalizedAction === 'reject' ? rejectionReason : null}
      WHERE token = ${token}
    `;

    // Log the action
    await sql`
      INSERT INTO signature_history (
        invitation_id,
        action,
        actor_user_id,
        actor_email,
        ip_address,
        user_agent,
        metadata,
        created_at
      )
      VALUES (
        ${inv.id},
        ${newStatus},
        ${payload.userId},
        ${user[0].email},
        ${request.headers.get('x-forwarded-for') || 'unknown'},
        ${request.headers.get('user-agent') || 'unknown'},
        ${normalizedAction === 'reject' ? JSON.stringify({ reason: rejectionReason }) : null},
        NOW()
      )
    `;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unlmtdproof.com';
    let blockchainResult = null;
    let allSignedMessage = '';

    // Update creation signature count
    if (inv.creation_id) {
      if (normalizedAction === 'accept') {
        console.log(`[Sign API] Updating signature count for creation ${inv.creation_id}`);
        console.log(`[Sign API] Current counts from invitation: cosignature_count=${inv.cosignature_count}, cosignature_signed_count=${inv.cosignature_signed_count}`);
        
        const updated = await sql`
          UPDATE creations
          SET cosignature_signed_count = cosignature_signed_count + 1,
              cosignature_status = CASE 
                WHEN cosignature_signed_count + 1 >= cosignature_count THEN 'all_signed'
                ELSE 'partially_signed'
              END,
              updated_at = NOW()
          WHERE id = ${inv.creation_id}
          RETURNING cosignature_count, cosignature_signed_count, cosignature_status, file_hash, public_id, project_type, status
        `;

        console.log(`[Sign API] Updated creation:`, JSON.stringify(updated[0]));
        
        const totalSigners = parseInt(inv.cosignature_count) || 1;
        const signedCount = (parseInt(inv.cosignature_signed_count) || 0) + 1;
        
        console.log(`[Sign API] totalSigners=${totalSigners}, signedCount=${signedCount}, cosignature_status=${updated[0]?.cosignature_status}`);

        // Send notification to depositor
        const notificationParams: SignatureNotificationParams = {
          to: inv.depositor_email,
          depositorName,
          signerName,
          signerEmail: user[0].email,
          signerRole: inv.role_label || inv.role_type || 'Co-signataire',
          creationTitle: inv.creation_title,
          action: 'signed',
          dashboardUrl: `${baseUrl}/fr/dashboard`,
          totalSigners,
          signedCount,
          locale: 'fr'
        };

        const emailSubject = `Nouvelle signature pour "${inv.creation_title}"`;
        await sendNotificationEmail(
          inv.depositor_email,
          emailSubject,
          getSignatureNotificationHTML(notificationParams)
        );

        // Check if all signed - trigger blockchain anchoring
        if (updated[0]?.cosignature_status === 'all_signed') {
          console.log(`[Sign API] All parties signed for creation ${inv.creation_id}. Triggering blockchain anchoring...`);

          const fileHash = updated[0].file_hash || inv.file_hash;
          const publicId = updated[0].public_id || inv.public_id;
          const projectType = updated[0].project_type || inv.project_type || 'music';

          // Try real blockchain anchoring, fallback to simulation
          const privateKey = process.env.POLYGON_PRIVATE_KEY;
          const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';

          if (privateKey) {
            blockchainResult = await anchorToBlockchain(fileHash, publicId, projectType, privateKey, rpcUrl);
          } else {
            console.log('[Sign API] No POLYGON_PRIVATE_KEY - using simulation mode');
            blockchainResult = await simulateAnchor(fileHash, publicId, projectType);
          }

          if (blockchainResult.success) {
            // Update creation with blockchain info
            await sql`
              UPDATE creations
              SET 
                tx_hash = ${blockchainResult.txHash},
                block_number = ${blockchainResult.blockNumber || null},
                anchored_at = NOW(),
                status = 'anchored',
                updated_at = NOW()
              WHERE id = ${inv.creation_id}
            `;

            // Insert transaction record
            await sql`
              INSERT INTO transactions (
                creation_id,
                tx_hash,
                chain,
                block_number,
                status,
                created_at
              )
              VALUES (
                ${inv.creation_id},
                ${blockchainResult.txHash},
                'polygon',
                ${blockchainResult.blockNumber || null},
                'confirmed',
                NOW()
              )
            `;

            // Send anchoring notification to depositor
            const anchorParams: AnchoringNotificationParams = {
              to: inv.depositor_email,
              depositorName,
              creationTitle: inv.creation_title,
              txHash: blockchainResult.txHash || '',
              explorerUrl: blockchainResult.explorerUrl || `https://polygonscan.com/tx/${blockchainResult.txHash}`,
              proofUrl: `${baseUrl}/fr/proof/${publicId}`,
              locale: 'fr'
            };

            await sendNotificationEmail(
              inv.depositor_email,
              `Ancrage blockchain confirmé pour "${inv.creation_title}"`,
              getAnchoringNotificationHTML(anchorParams)
            );

            allSignedMessage = blockchainResult.simulated 
              ? ' Votre dépôt a été simulé sur la blockchain (mode test).'
              : ' Votre dépôt a été ancré sur la blockchain Polygon !';

            console.log(`[Sign API] Blockchain anchoring successful: ${blockchainResult.txHash}`);
          } else {
            console.error('[Sign API] Blockchain anchoring failed:', blockchainResult.error);
            allSignedMessage = ' Tous les co-signataires ont signé. L\'ancrage blockchain sera effectué prochainement.';
          }
        }
      } else {
        // Rejection - mark creation as rejected
        await sql`
          UPDATE creations
          SET cosignature_status = 'rejected',
              updated_at = NOW()
          WHERE id = ${inv.creation_id}
        `;

        const totalSigners = parseInt(inv.cosignature_count) || 1;
        const signedCount = parseInt(inv.cosignature_signed_count) || 0;

        // Send rejection notification to depositor
        const notificationParams: SignatureNotificationParams = {
          to: inv.depositor_email,
          depositorName,
          signerName,
          signerEmail: user[0].email,
          signerRole: inv.role_label || inv.role_type || 'Co-signataire',
          creationTitle: inv.creation_title,
          action: 'rejected',
          rejectionReason: rejectionReason || undefined,
          dashboardUrl: `${baseUrl}/fr/dashboard`,
          totalSigners,
          signedCount,
          locale: 'fr'
        };

        const emailSubject = `Signature refusée pour "${inv.creation_title}"`;
        await sendNotificationEmail(
          inv.depositor_email,
          emailSubject,
          getSignatureNotificationHTML(notificationParams)
        );
      }
    }

    return NextResponse.json({
      success: true,
      action: newStatus,
      message: normalizedAction === 'accept' 
        ? `Vous avez accepté l'invitation. Merci pour votre signature !${allSignedMessage}`
        : 'Vous avez refusé l\'invitation. L\'initiateur a été notifié.',
      blockchain: blockchainResult ? {
        success: blockchainResult.success,
        txHash: blockchainResult.txHash,
        explorerUrl: blockchainResult.explorerUrl,
        simulated: blockchainResult.simulated
      } : null
    });

  } catch (error: any) {
    console.error('[Sign API] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}

export const runtime = 'edge';
