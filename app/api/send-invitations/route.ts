// ===========================================
// PROOFY - Send Co-signature Invitations API
// POST /api/send-invitations
// Sends invitation emails to co-signatories
// ===========================================

import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';
import { generateInvitationEmail, getInvitationEmailSubject, InvitationEmailParams, SupportedLocale } from '@/lib/email/templates';

export const runtime = 'edge';

// Verify JWT token using jose (Edge compatible)
async function verifyToken(request: Request): Promise<{ userId: string; email: string } | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';
    const secretKey = new TextEncoder().encode(jwtSecret);

    const { payload } = await jwtVerify(token, secretKey);
    return { userId: payload.userId as string, email: payload.email as string };
  } catch (error) {
    return null;
  }
}

// Generate secure token for invitation using Web Crypto API (Edge compatible)
function generateInvitationToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Send email via MailerSend with professional template
async function sendInvitationEmail(params: InvitationEmailParams & { projectType?: string; locale?: SupportedLocale }): Promise<boolean> {
  const mailersendApiKey = process.env.MAILERSEND_API_KEY;
  const locale = params.locale || 'fr';
  
  console.log('[MailerSend] Preparing email for:', params.to);
  console.log('[MailerSend] API Key configured:', !!mailersendApiKey, mailersendApiKey ? `(${mailersendApiKey.substring(0, 10)}...)` : '');
  
  // Generate the HTML email using the professional template (with locale)
  const htmlContent = generateInvitationEmail(params, locale);
  const subject = getInvitationEmailSubject(params.creationTitle, locale);
  
  console.log('[MailerSend] Subject:', subject);
  
  if (!mailersendApiKey) {
    console.log('[MailerSend] DEV MODE - No API key, skipping actual send');
    return true;
  }

  try {
    console.log('[MailerSend] Sending via API...');
    
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailersendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: 'noreply@unlmtdproof.com',
          name: 'UnlmtdProof'
        },
        to: [{ email: params.to }],
        subject: subject,
        html: htmlContent,
      }),
    });

    console.log('[MailerSend] Response status:', response.status);
    
    if (response.ok) {
      console.log('[MailerSend] Email sent successfully to:', params.to);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('[MailerSend] Error:', response.status, JSON.stringify(errorData));
      return false;
    }
  } catch (error) {
    console.error('[MailerSend] Failed to send email:', error);
    return false;
  }
}

export async function POST(request: Request) {
  console.log('[Send Invitations] POST request received');
  
  try {
    const user = await verifyToken(request);
    if (!user) {
      console.log('[Send Invitations] Unauthorized - no valid token');
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.log('[Send Invitations] User verified:', user.userId, user.email);

    const body = await request.json();
    const { creationId, invitations } = body;
    console.log('[Send Invitations] Request data:', { creationId, invitationsCount: invitations?.length, invitations });

    if (!creationId || !invitations || !Array.isArray(invitations) || invitations.length === 0) {
      console.log('[Send Invitations] Invalid data - missing creationId or invitations');
      return Response.json({ error: 'Données invalides' }, { status: 400 });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return Response.json({ error: 'Database non configurée' }, { status: 500 });
    }

    const sql = neon(databaseUrl);

    // Verify the creation belongs to the user
    const creation = await sql`
      SELECT c.id, c.title, c.status, 
             COALESCE(u.first_name || ' ' || u.last_name, u.email) as depositor_name, 
             u.email as depositor_email
      FROM creations c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${creationId} AND c.user_id = ${parseInt(user.userId)}
    `;

    if (creation.length === 0) {
      return Response.json({ error: 'Création non trouvée' }, { status: 404 });
    }

    const creationData = creation[0];
    const depositorEmail = creationData.depositor_email?.toLowerCase();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unlmtdproof.com';
    
    console.log('[Send Invitations] Creation found:', { 
      id: creationData.id, 
      title: creationData.title, 
      depositorEmail,
      baseUrl 
    });

    // Create invitations and send emails
    const results = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    for (const inv of invitations) {
      const { email, role, percentage, rightsType } = inv;
      
      if (!email || !role || percentage === undefined) {
        results.push({ email, success: false, error: 'Données manquantes' });
        continue;
      }

      // Skip the depositor - they don't need to sign their own deposit
      if (email.toLowerCase() === depositorEmail) {
        console.log('[Send Invitations] Skipping depositor:', email);
        results.push({ email, success: true, skipped: true, reason: 'Déposant (pas besoin de signature)' });
        continue;
      }
      
      console.log('[Send Invitations] Processing invitation for:', email, role, percentage);

      const token = generateInvitationToken();

      // Insert invitation into database
      try {
        await sql`
          INSERT INTO deposit_invitations (
            creation_id, inviter_id, invitee_email, role_type, role_label, percentage, token, status, expires_at
          ) VALUES (
            ${creationId}, ${parseInt(user.userId)}, ${email.toLowerCase()}, ${rightsType || 'copyright'}, ${role}, ${percentage}, 
            ${token}, 'pending', ${expiresAt.toISOString()}
          )
        `;

        // Send email
        const signUrl = `${baseUrl}/sign/${token}`;
        console.log('[Send Invitations] Sending email to:', email, 'signUrl:', signUrl);
        
        const emailSent = await sendInvitationEmail({
          to: email,
          depositorName: creationData.depositor_name || creationData.depositor_email,
          creationTitle: creationData.title,
          role,
          percentage,
          signUrl,
          expiresAt,
        });
        
        console.log('[Send Invitations] Email result for', email, ':', emailSent);
        results.push({ email, success: true, emailSent });
      } catch (dbError: any) {
        console.error('DB error for', email, dbError);
        results.push({ email, success: false, error: dbError.message });
      }
    }

    // Update creation status and co-signature tracking
    // Only count invitations that were actually sent (not skipped depositor)
    const actualInvitationsSent = results.filter(r => r.success && !r.skipped).length;
    console.log('[Send Invitations] Results:', JSON.stringify(results));
    console.log('[Send Invitations] Actual invitations sent (excluding depositor):', actualInvitationsSent);
    await sql`
      UPDATE creations 
      SET 
        status = 'pending_signatures', 
        cosignature_required = true,
        cosignature_count = ${actualInvitationsSent},
        cosignature_signed_count = 0,
        cosignature_expires_at = ${expiresAt.toISOString()},
        updated_at = NOW()
      WHERE id = ${creationId}
    `;

    return Response.json({
      success: true,
      message: `${results.filter(r => r.success).length}/${invitations.length} invitations envoyées`,
      results,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error: any) {
    console.error('Send invitations error:', error);
    return Response.json({ 
      error: 'Erreur lors de l\'envoi des invitations',
      details: error.message 
    }, { status: 500 });
  }
}
