// ===========================================
// PROOFY - Send Co-signature Invitations API
// POST /api/send-invitations
// Sends invitation emails to co-signatories
// ===========================================

import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';

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

// Send email via MailerSend
async function sendInvitationEmail(params: {
  to: string;
  depositorName: string;
  creationTitle: string;
  role: string;
  percentage: number;
  signUrl: string;
  expiresAt: Date;
}): Promise<boolean> {
  const mailersendApiKey = process.env.MAILERSEND_API_KEY;
  
  if (!mailersendApiKey) {
    console.log('📧 [DEV MODE] Email would be sent to:', params.to);
    console.log('   Subject: Invitation à co-signer un dépôt sur UnlmtdProof');
    console.log('   Content: You have been invited by', params.depositorName, 'to sign', params.creationTitle);
    console.log('   Sign URL:', params.signUrl);
    return true; // Simulate success for development
  }

  try {
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
        subject: `Invitation à co-signer "${params.creationTitle}" sur UnlmtdProof`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitation à co-signer</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #0a0a0a;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #bff227; font-size: 28px; margin: 0;">UnlmtdProof</h1>
                <p style="color: #666; font-size: 14px; margin: 8px 0 0 0;">Preuve d'antériorité blockchain</p>
              </div>
              
              <!-- Main Card -->
              <div style="background-color: #1a1a1a; border-radius: 16px; padding: 32px; border: 1px solid #333;">
                <h2 style="color: #fff; font-size: 22px; margin: 0 0 16px 0;">
                  Vous êtes invité(e) à co-signer un dépôt
                </h2>
                
                <p style="color: #999; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  <strong style="color: #fff;">${params.depositorName}</strong> vous invite à valider votre participation 
                  en tant que co-auteur/ayant droit sur l'œuvre suivante :
                </p>
                
                <!-- Creation Info -->
                <div style="background-color: #252525; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #bff227; font-size: 18px; font-weight: bold; margin: 0 0 12px 0;">
                    ${params.creationTitle}
                  </p>
                  <div style="display: flex; gap: 20px;">
                    <div>
                      <p style="color: #666; font-size: 12px; margin: 0;">Votre rôle</p>
                      <p style="color: #fff; font-size: 14px; margin: 4px 0 0 0;">${params.role}</p>
                    </div>
                    <div>
                      <p style="color: #666; font-size: 12px; margin: 0;">Votre part</p>
                      <p style="color: #bff227; font-size: 14px; font-weight: bold; margin: 4px 0 0 0;">${params.percentage}%</p>
                    </div>
                  </div>
                </div>
                
                <!-- Warning -->
                <div style="background-color: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255, 165, 0, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <p style="color: #ffa500; font-size: 14px; margin: 0;">
                    ⏰ <strong>Attention :</strong> Cette invitation expire dans 7 jours 
                    (${params.expiresAt.toLocaleDateString('fr-FR')}). Passé ce délai, le dépôt sera annulé.
                  </p>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${params.signUrl}" 
                     style="display: inline-block; background: linear-gradient(to right, #bff227, #9dd11e); 
                            color: #0a0a0a; font-size: 16px; font-weight: bold; text-decoration: none; 
                            padding: 16px 32px; border-radius: 12px;">
                    Valider ma participation
                  </a>
                </div>
                
                <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
                  Ou copiez ce lien dans votre navigateur :<br>
                  <a href="${params.signUrl}" style="color: #bff227; word-break: break-all;">${params.signUrl}</a>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 32px;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  Cet email a été envoyé par UnlmtdProof, membre d'Artys Network.
                </p>
                <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">
                  Si vous n'avez pas demandé cet email, vous pouvez l'ignorer.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (response.ok) {
      console.log('📧 Email sent successfully to:', params.to);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('📧 MailerSend error:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('📧 Failed to send email:', error);
    return false;
  }
}

export async function POST(request: Request) {
  console.log('[Send Invitations API] POST request received');
  
  try {
    const user = await verifyToken(request);
    console.log('[Send Invitations API] User verified:', user?.userId || 'null');
    
    if (!user) {
      console.log('[Send Invitations API] Unauthorized - no valid token');
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { creationId, invitations } = body;
    
    console.log('[Send Invitations API] Received data:', { creationId, invitationsCount: invitations?.length });

    if (!creationId || !invitations || !Array.isArray(invitations) || invitations.length === 0) {
      console.log('[Send Invitations API] Invalid data:', { creationId, invitations });
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unlmtdproof.com';

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
        console.log('[Send Invitations] Invitation created for:', email, 'token:', token.substring(0, 8) + '...');

        // Send email
        const signUrl = `${baseUrl}/sign/${token}`;
        const emailSent = await sendInvitationEmail({
          to: email,
          depositorName: creationData.depositor_name || creationData.depositor_email,
          creationTitle: creationData.title,
          role,
          percentage,
          signUrl,
          expiresAt,
        });

        results.push({ email, success: true, emailSent });
      } catch (dbError: any) {
        console.error('DB error for', email, dbError);
        results.push({ email, success: false, error: dbError.message });
      }
    }

    // Update creation status and co-signature tracking
    const successCount = results.filter(r => r.success).length;
    await sql`
      UPDATE creations 
      SET 
        status = 'pending_signatures', 
        cosignature_required = true,
        cosignature_count = ${successCount},
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
