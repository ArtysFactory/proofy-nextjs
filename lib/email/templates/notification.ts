// ============================================
// PROOFY - Email Templates: Signature Notifications
// ============================================

export interface SignatureNotificationParams {
  to: string;
  depositorName: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  creationTitle: string;
  action: 'signed' | 'rejected';
  rejectionReason?: string;
  dashboardUrl: string;
  totalSigners: number;
  signedCount: number;
  locale?: 'fr' | 'en' | 'es';
}

export interface AnchoringNotificationParams {
  to: string;
  depositorName: string;
  creationTitle: string;
  txHash: string;
  explorerUrl: string;
  proofUrl: string;
  locale?: 'fr' | 'en' | 'es';
}

// ============================================
// Signature Notification (FR)
// ============================================
export function generateSignatureNotificationHTML_FR(params: SignatureNotificationParams): string {
  const isSigned = params.action === 'signed';
  const statusColor = isSigned ? '#22c55e' : '#ef4444';
  const statusEmoji = isSigned ? '✅' : '❌';
  const statusText = isSigned ? 'a signé' : 'a refusé';
  const progressPercent = Math.round((params.signedCount / params.totalSigners) * 100);
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSigned ? 'Nouvelle signature' : 'Signature refusée'} - UnlmtdProof</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0a0a0a; }
    a { color: #bff227; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; width: 100%;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://i.imgur.com/HgjX8Uh.png" alt="PROOF" width="50" height="50" style="display: block; border-radius: 10px;" />
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a;">
                <tr>
                  <td class="content" style="padding: 32px;">
                    
                    <!-- Status Header -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="display: inline-block; background-color: ${statusColor}20; border: 1px solid ${statusColor}40; border-radius: 50px; padding: 8px 20px;">
                            <span style="color: ${statusColor}; font-size: 14px; font-weight: 600;">
                              ${statusEmoji} ${isSigned ? 'Nouvelle signature' : 'Signature refusée'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Message -->
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      Bonjour <strong style="color: #ffffff;">${params.depositorName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      <strong style="color: #ffffff;">${params.signerName}</strong> (${params.signerRole})<br/>
                      ${statusText} votre invitation pour :<br/>
                      <strong style="color: #bff227;">${params.creationTitle}</strong>
                    </p>
                    
                    ${!isSigned && params.rejectionReason ? `
                    <!-- Rejection Reason -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #ef444420; border: 1px solid #ef444440; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 8px 0; color: #ef4444; font-size: 13px; font-weight: 600;">Raison du refus :</p>
                          <p style="margin: 0; color: #fca5a5; font-size: 14px; line-height: 1.5;">${params.rejectionReason}</p>
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    <!-- Progress -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #1f1f1f; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 12px 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Progression des signatures</p>
                          
                          <!-- Progress Bar -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="background-color: #2a2a2a; border-radius: 8px; height: 8px;">
                                <div style="background: linear-gradient(90deg, #bff227 0%, #9bcc1f 100%); width: ${progressPercent}%; height: 8px; border-radius: 8px;"></div>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 600; text-align: center;">
                            ${params.signedCount} / ${params.totalSigners} signatures
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${params.dashboardUrl}" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #bff227 0%, #9bcc1f 100%); color: #000000; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
                            Voir le tableau de bord
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0; color: #737373; font-size: 12px;">
                © ${new Date().getFullYear()} UnlmtdProof by Artys Factory<br/>
                Protégez vos créations avec la preuve blockchain
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================
// Signature Notification (EN)
// ============================================
export function generateSignatureNotificationHTML_EN(params: SignatureNotificationParams): string {
  const isSigned = params.action === 'signed';
  const statusColor = isSigned ? '#22c55e' : '#ef4444';
  const statusEmoji = isSigned ? '✅' : '❌';
  const statusText = isSigned ? 'signed' : 'rejected';
  const progressPercent = Math.round((params.signedCount / params.totalSigners) * 100);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSigned ? 'New Signature' : 'Signature Rejected'} - UnlmtdProof</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0a0a0a; }
    a { color: #bff227; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; width: 100%;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://i.imgur.com/HgjX8Uh.png" alt="PROOF" width="50" height="50" style="display: block; border-radius: 10px;" />
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a;">
                <tr>
                  <td class="content" style="padding: 32px;">
                    
                    <!-- Status Header -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="display: inline-block; background-color: ${statusColor}20; border: 1px solid ${statusColor}40; border-radius: 50px; padding: 8px 20px;">
                            <span style="color: ${statusColor}; font-size: 14px; font-weight: 600;">
                              ${statusEmoji} ${isSigned ? 'New Signature' : 'Signature Rejected'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Message -->
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      Hello <strong style="color: #ffffff;">${params.depositorName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      <strong style="color: #ffffff;">${params.signerName}</strong> (${params.signerRole})<br/>
                      has ${statusText} your invitation for:<br/>
                      <strong style="color: #bff227;">${params.creationTitle}</strong>
                    </p>
                    
                    ${!isSigned && params.rejectionReason ? `
                    <!-- Rejection Reason -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #ef444420; border: 1px solid #ef444440; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 8px 0; color: #ef4444; font-size: 13px; font-weight: 600;">Reason for rejection:</p>
                          <p style="margin: 0; color: #fca5a5; font-size: 14px; line-height: 1.5;">${params.rejectionReason}</p>
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    <!-- Progress -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #1f1f1f; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 12px 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Signature Progress</p>
                          
                          <!-- Progress Bar -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="background-color: #2a2a2a; border-radius: 8px; height: 8px;">
                                <div style="background: linear-gradient(90deg, #bff227 0%, #9bcc1f 100%); width: ${progressPercent}%; height: 8px; border-radius: 8px;"></div>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 600; text-align: center;">
                            ${params.signedCount} / ${params.totalSigners} signatures
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${params.dashboardUrl}" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #bff227 0%, #9bcc1f 100%); color: #000000; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
                            View Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0; color: #737373; font-size: 12px;">
                © ${new Date().getFullYear()} UnlmtdProof by Artys Factory<br/>
                Protect your creations with blockchain proof
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================
// Signature Notification (ES)
// ============================================
export function generateSignatureNotificationHTML_ES(params: SignatureNotificationParams): string {
  const isSigned = params.action === 'signed';
  const statusColor = isSigned ? '#22c55e' : '#ef4444';
  const statusEmoji = isSigned ? '✅' : '❌';
  const statusText = isSigned ? 'ha firmado' : 'ha rechazado';
  const progressPercent = Math.round((params.signedCount / params.totalSigners) * 100);
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSigned ? 'Nueva firma' : 'Firma rechazada'} - UnlmtdProof</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0a0a0a; }
    a { color: #bff227; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; width: 100%;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://i.imgur.com/HgjX8Uh.png" alt="PROOF" width="50" height="50" style="display: block; border-radius: 10px;" />
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a;">
                <tr>
                  <td class="content" style="padding: 32px;">
                    
                    <!-- Status Header -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="display: inline-block; background-color: ${statusColor}20; border: 1px solid ${statusColor}40; border-radius: 50px; padding: 8px 20px;">
                            <span style="color: ${statusColor}; font-size: 14px; font-weight: 600;">
                              ${statusEmoji} ${isSigned ? 'Nueva firma' : 'Firma rechazada'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Message -->
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      Hola <strong style="color: #ffffff;">${params.depositorName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      <strong style="color: #ffffff;">${params.signerName}</strong> (${params.signerRole})<br/>
                      ${statusText} tu invitación para:<br/>
                      <strong style="color: #bff227;">${params.creationTitle}</strong>
                    </p>
                    
                    ${!isSigned && params.rejectionReason ? `
                    <!-- Rejection Reason -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #ef444420; border: 1px solid #ef444440; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 8px 0; color: #ef4444; font-size: 13px; font-weight: 600;">Motivo del rechazo:</p>
                          <p style="margin: 0; color: #fca5a5; font-size: 14px; line-height: 1.5;">${params.rejectionReason}</p>
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    <!-- Progress -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #1f1f1f; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 12px 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Progreso de firmas</p>
                          
                          <!-- Progress Bar -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="background-color: #2a2a2a; border-radius: 8px; height: 8px;">
                                <div style="background: linear-gradient(90deg, #bff227 0%, #9bcc1f 100%); width: ${progressPercent}%; height: 8px; border-radius: 8px;"></div>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 600; text-align: center;">
                            ${params.signedCount} / ${params.totalSigners} firmas
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${params.dashboardUrl}" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #bff227 0%, #9bcc1f 100%); color: #000000; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
                            Ver panel de control
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0; color: #737373; font-size: 12px;">
                © ${new Date().getFullYear()} UnlmtdProof by Artys Factory<br/>
                Protege tus creaciones con prueba blockchain
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================
// Anchoring Complete Notification (FR)
// ============================================
export function generateAnchoringNotificationHTML_FR(params: AnchoringNotificationParams): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ancrage blockchain confirmé - UnlmtdProof</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0a0a0a; }
    a { color: #bff227; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; width: 100%;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://i.imgur.com/HgjX8Uh.png" alt="PROOF" width="50" height="50" style="display: block; border-radius: 10px;" />
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a;">
                <tr>
                  <td class="content" style="padding: 32px;">
                    
                    <!-- Success Header -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                          <h1 style="margin: 0; color: #bff227; font-size: 24px; font-weight: 700;">
                            Ancrage blockchain confirmé !
                          </h1>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Message -->
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      Bonjour <strong style="color: #ffffff;">${params.depositorName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      Tous les co-signataires ont validé votre dépôt.<br/>
                      Votre création <strong style="color: #bff227;">${params.creationTitle}</strong><br/>
                      est maintenant <strong style="color: #22c55e;">immuablement ancrée sur la blockchain Polygon</strong>.
                    </p>
                    
                    <!-- Transaction Info -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #1f1f1f; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 8px 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Transaction Hash</p>
                          <p style="margin: 0; color: #bff227; font-size: 12px; font-family: monospace; word-break: break-all;">${params.txHash}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Buttons -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 12px;">
                          <a href="${params.proofUrl}" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #bff227 0%, #9bcc1f 100%); color: #000000; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
                            Voir mon certificat
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="${params.explorerUrl}" style="color: #a3a3a3; font-size: 13px;">
                            Voir sur Polygonscan →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0; color: #737373; font-size: 12px;">
                © ${new Date().getFullYear()} UnlmtdProof by Artys Factory<br/>
                Protégez vos créations avec la preuve blockchain
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================
// Anchoring Complete Notification (EN)
// ============================================
export function generateAnchoringNotificationHTML_EN(params: AnchoringNotificationParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blockchain Anchoring Confirmed - UnlmtdProof</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0a0a0a; }
    a { color: #bff227; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; width: 100%;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://i.imgur.com/HgjX8Uh.png" alt="PROOF" width="50" height="50" style="display: block; border-radius: 10px;" />
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a;">
                <tr>
                  <td class="content" style="padding: 32px;">
                    
                    <!-- Success Header -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                          <h1 style="margin: 0; color: #bff227; font-size: 24px; font-weight: 700;">
                            Blockchain Anchoring Confirmed!
                          </h1>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Message -->
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      Hello <strong style="color: #ffffff;">${params.depositorName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      All co-signatories have validated your deposit.<br/>
                      Your creation <strong style="color: #bff227;">${params.creationTitle}</strong><br/>
                      is now <strong style="color: #22c55e;">immutably anchored on Polygon blockchain</strong>.
                    </p>
                    
                    <!-- Transaction Info -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #1f1f1f; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 8px 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Transaction Hash</p>
                          <p style="margin: 0; color: #bff227; font-size: 12px; font-family: monospace; word-break: break-all;">${params.txHash}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Buttons -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 12px;">
                          <a href="${params.proofUrl}" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #bff227 0%, #9bcc1f 100%); color: #000000; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
                            View My Certificate
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="${params.explorerUrl}" style="color: #a3a3a3; font-size: 13px;">
                            View on Polygonscan →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0; color: #737373; font-size: 12px;">
                © ${new Date().getFullYear()} UnlmtdProof by Artys Factory<br/>
                Protect your creations with blockchain proof
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================
// Anchoring Complete Notification (ES)
// ============================================
export function generateAnchoringNotificationHTML_ES(params: AnchoringNotificationParams): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anclaje blockchain confirmado - UnlmtdProof</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0a0a0a; }
    a { color: #bff227; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; width: 100%;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://i.imgur.com/HgjX8Uh.png" alt="PROOF" width="50" height="50" style="display: block; border-radius: 10px;" />
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #2a2a2a;">
                <tr>
                  <td class="content" style="padding: 32px;">
                    
                    <!-- Success Header -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                          <h1 style="margin: 0; color: #bff227; font-size: 24px; font-weight: 700;">
                            ¡Anclaje blockchain confirmado!
                          </h1>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Message -->
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      Hola <strong style="color: #ffffff;">${params.depositorName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #e5e5e5; font-size: 16px; line-height: 1.6; text-align: center;">
                      Todos los co-firmantes han validado tu depósito.<br/>
                      Tu creación <strong style="color: #bff227;">${params.creationTitle}</strong><br/>
                      ahora está <strong style="color: #22c55e;">inmutablemente anclada en la blockchain Polygon</strong>.
                    </p>
                    
                    <!-- Transaction Info -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #1f1f1f; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 8px 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Hash de transacción</p>
                          <p style="margin: 0; color: #bff227; font-size: 12px; font-family: monospace; word-break: break-all;">${params.txHash}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Buttons -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 12px;">
                          <a href="${params.proofUrl}" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #bff227 0%, #9bcc1f 100%); color: #000000; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
                            Ver mi certificado
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="${params.explorerUrl}" style="color: #a3a3a3; font-size: 13px;">
                            Ver en Polygonscan →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0; color: #737373; font-size: 12px;">
                © ${new Date().getFullYear()} UnlmtdProof by Artys Factory<br/>
                Protege tus creaciones con prueba blockchain
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================
// Helper to select locale-based template
// ============================================
export function getSignatureNotificationHTML(params: SignatureNotificationParams): string {
  const locale = params.locale || 'fr';
  switch (locale) {
    case 'en': return generateSignatureNotificationHTML_EN(params);
    case 'es': return generateSignatureNotificationHTML_ES(params);
    default: return generateSignatureNotificationHTML_FR(params);
  }
}

export function getAnchoringNotificationHTML(params: AnchoringNotificationParams): string {
  const locale = params.locale || 'fr';
  switch (locale) {
    case 'en': return generateAnchoringNotificationHTML_EN(params);
    case 'es': return generateAnchoringNotificationHTML_ES(params);
    default: return generateAnchoringNotificationHTML_FR(params);
  }
}
