// ============================================
// PROOFY - Email Template: Co-signature Invitation (English)
// ============================================

export interface InvitationEmailParams {
  to: string;
  depositorName: string;
  creationTitle: string;
  role: string;
  percentage: number;
  signUrl: string;
  expiresAt: Date;
  projectType?: string;
}

export function generateInvitationEmailHTML_EN(params: InvitationEmailParams): string {
  const expirationDate = params.expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate days remaining
  const now = new Date();
  const daysRemaining = Math.ceil((params.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Project type icon (emoji fallback for email)
  const projectTypeEmoji = {
    music: '🎵',
    visual: '🎨',
    video: '🎬',
    code: '💻',
    other: '📄'
  }[params.projectType || 'music'] || '📄';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Co-signature Invitation - UnlmtdProof</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Base */
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0a0a0a; }
    
    /* Links */
    a { color: #bff227; text-decoration: none; }
    a:hover { color: #d4ff4d; }
    
    /* Button hover */
    .btn-primary:hover { background: linear-gradient(135deg, #d4ff4d 0%, #bff227 100%) !important; }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .content { padding: 24px !important; }
      .btn-primary { padding: 14px 24px !important; font-size: 15px !important; }
      .title { font-size: 20px !important; }
      .stats-grid { display: block !important; }
      .stat-item { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  
  <!-- Wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; width: 100%;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Logo SVG as inline -->
                    <div style="display: inline-block; margin-bottom: 8px;">
                      <img src="https://i.imgur.com/HgjX8Uh.png" alt="PROOF" width="60" height="60" style="display: block; border-radius: 12px;" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      Unlmtd<span style="color: #bff227;">Proof</span>
                    </h1>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #666666;">
                      Blockchain Proof of Ownership
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(180deg, #1a1a1a 0%, #141414 100%); border-radius: 20px; border: 1px solid #2a2a2a; overflow: hidden;">
                
                <!-- Green accent top bar -->
                <tr>
                  <td style="height: 4px; background: linear-gradient(90deg, #bff227 0%, #9dd11e 100%);"></td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td class="content" style="padding: 40px;">
                    
                    <!-- Badge -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: rgba(191, 242, 39, 0.1); border: 1px solid rgba(191, 242, 39, 0.3); border-radius: 20px; padding: 6px 14px;">
                          <span style="color: #bff227; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            ✉️ Co-signature Invitation
                          </span>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Title -->
                    <h2 class="title" style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                      You're invited to confirm your participation
                    </h2>
                    
                    <!-- Intro text -->
                    <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.6; color: #999999;">
                      <strong style="color: #ffffff;">${params.depositorName}</strong> invites you to confirm your role as a rights holder on the following work. Your signature is required to finalize the blockchain deposit.
                    </p>
                    
                    <!-- Creation Card -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border-radius: 16px; border: 1px solid #333333; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          
                          <!-- Project type & title -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="48" valign="top">
                                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, rgba(191, 242, 39, 0.2) 0%, rgba(191, 242, 39, 0.1) 100%); border-radius: 12px; text-align: center; line-height: 48px; font-size: 24px;">
                                  ${projectTypeEmoji}
                                </div>
                              </td>
                              <td style="padding-left: 16px;" valign="top">
                                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">
                                  Work to co-sign
                                </p>
                                <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #bff227; line-height: 1.3;">
                                  ${params.creationTitle}
                                </h3>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Divider -->
                          <div style="height: 1px; background-color: #333333; margin: 20px 0;"></div>
                          
                          <!-- Stats Grid -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="stats-grid">
                            <tr>
                              <td class="stat-item" width="50%" style="padding-right: 12px;" valign="top">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border-radius: 12px; padding: 16px;">
                                  <tr>
                                    <td style="padding: 16px;">
                                      <p style="margin: 0 0 4px 0; font-size: 11px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Your role
                                      </p>
                                      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                                        ${params.role}
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td class="stat-item" width="50%" style="padding-left: 12px;" valign="top">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border-radius: 12px;">
                                  <tr>
                                    <td style="padding: 16px;">
                                      <p style="margin: 0 0 4px 0; font-size: 11px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Your share
                                      </p>
                                      <p style="margin: 0; font-size: 24px; font-weight: 700; color: #bff227;">
                                        ${params.percentage}%
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Warning Box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(255, 165, 0, 0.08); border: 1px solid rgba(255, 165, 0, 0.25); border-radius: 12px; margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="24" valign="top">
                                <span style="font-size: 18px;">⏰</span>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #ffa500;">
                                  Expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}
                                </p>
                                <p style="margin: 0; font-size: 13px; color: #cc8400; line-height: 1.5;">
                                  Deadline: ${expirationDate}. After this date, the deposit will be automatically cancelled.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${params.signUrl}" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #bff227 0%, #9dd11e 100%); color: #0a0a0a; font-size: 16px; font-weight: 700; text-decoration: none; padding: 18px 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(191, 242, 39, 0.3);">
                            ✓ Confirm my participation
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Alternative link -->
                    <p style="margin: 24px 0 0 0; font-size: 12px; color: #666666; text-align: center; line-height: 1.6;">
                      If the button doesn't work, copy this link:<br>
                      <a href="${params.signUrl}" style="color: #bff227; word-break: break-all; font-size: 11px;">${params.signUrl}</a>
                    </p>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Info Section -->
          <tr>
            <td style="padding: 32px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #111111; border-radius: 16px; border: 1px solid #222222;">
                <tr>
                  <td style="padding: 24px;">
                    <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #ffffff;">
                      🔒 What is UnlmtdProof?
                    </h4>
                    <p style="margin: 0; font-size: 13px; color: #888888; line-height: 1.6;">
                      UnlmtdProof is a legal deposit service that records proof of ownership of your creations on the Polygon blockchain. 
                      Your signature confirms your agreement on the rights distribution declared by the depositor.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 16px; border-top: 1px solid #222222;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #666666;">
                      This email was sent by <strong style="color: #888888;">UnlmtdProof</strong>
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #555555;">
                      Part of the <a href="https://artys.network" style="color: #bff227;">Artys Network</a> ecosystem
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 11px; color: #444444; line-height: 1.6;">
                      If you didn't request this invitation, you can ignore this email.<br>
                      © ${new Date().getFullYear()} UnlmtdProof. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}
