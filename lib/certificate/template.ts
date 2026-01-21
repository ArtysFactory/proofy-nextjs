// ============================================
// PROOFY - Certificate HTML Template
// ============================================

import { CertificateData, getProjectTypeInfo } from './types';

export function generateCertificateHTML(data: CertificateData, qrCodeDataUrl: string, logoBase64: string, signatureBase64: string): string {
  const projectInfo = getProjectTypeInfo(data.project_type);
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificat de Dépôt d'Antériorité - ${data.project_title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #000000;
      color: #FFFFFF;
      width: 210mm;
      height: 297mm;
      position: relative;
      overflow: hidden;
    }
    
    .container {
      padding: 40px 50px;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
    }
    
    /* Watermark / Background Pattern */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 500px;
      opacity: 0.05;
      z-index: 1;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10L90 90H10L50 10Z' fill='none' stroke='%23444' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23444' stroke-width='1'/%3E%3C/svg%3E") center/contain no-repeat;
    }
    
    /* Circuit pattern background */
    .circuit-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.03;
      background-image: 
        linear-gradient(90deg, #333 1px, transparent 1px),
        linear-gradient(#333 1px, transparent 1px);
      background-size: 20px 20px;
      z-index: 0;
    }
    
    /* Logo Section */
    .logo-section {
      text-align: center;
      margin-bottom: 25px;
    }
    
    .logo-section img {
      width: 280px;
      height: auto;
    }
    
    /* Main Title */
    .main-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      text-align: center;
      letter-spacing: 2px;
      margin-bottom: 30px;
      color: #FFFFFF;
    }
    
    /* Section Styling */
    .section {
      border: 2px solid #444444;
      border-radius: 12px;
      padding: 20px 25px;
      margin-bottom: 18px;
      background: rgba(26, 26, 26, 0.5);
    }
    
    .section-title {
      color: #CCCCCC;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }
    
    /* Blockchain Verified Section */
    .blockchain-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .blockchain-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .blockchain-label {
      color: #FFFFFF;
      font-size: 15px;
    }
    
    .blockchain-name {
      color: #FFFFFF;
      font-size: 17px;
      font-weight: 700;
    }
    
    .checkmark {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #00FF00, #00CC00);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #000;
      font-weight: bold;
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
    }
    
    /* Details Section */
    .detail-row {
      display: flex;
      margin-bottom: 12px;
    }
    
    .detail-row:last-child {
      margin-bottom: 0;
    }
    
    .detail-label {
      color: #AAAAAA;
      font-size: 13px;
      width: 140px;
      flex-shrink: 0;
    }
    
    .detail-value {
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 500;
    }
    
    .project-type-icon {
      margin-right: 8px;
    }
    
    /* Security Section */
    .code-block {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      background: #1A1A1A;
      padding: 12px 15px;
      border-radius: 6px;
      font-size: 11px;
      word-break: break-all;
      margin-top: 8px;
      border: 1px solid #333;
    }
    
    .code-label {
      color: #CCCCCC;
      font-size: 12px;
      margin-bottom: 5px;
      display: block;
    }
    
    /* Bottom Section */
    .bottom-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: auto;
      padding-top: 20px;
    }
    
    /* QR Code */
    .qr-section {
      border: 3px solid #00FF00;
      border-radius: 12px;
      padding: 15px;
      text-align: center;
      background: rgba(0, 255, 0, 0.05);
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.15);
    }
    
    .qr-code {
      width: 140px;
      height: 140px;
      background: #FFFFFF;
      padding: 8px;
      border-radius: 8px;
    }
    
    .qr-code img {
      width: 100%;
      height: 100%;
    }
    
    .qr-text {
      color: #00FF00;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 12px;
    }
    
    .qr-subtext {
      color: #88FF88;
      font-size: 9px;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Signature Section */
    .signature-section {
      text-align: right;
    }
    
    .signature-image {
      width: 220px;
      height: auto;
      margin-bottom: 10px;
    }
    
    .signature-label {
      color: #CCCCCC;
      font-size: 11px;
      font-style: italic;
    }
    
    .signature-date {
      color: #888888;
      font-size: 10px;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="circuit-bg"></div>
  <div class="watermark"></div>
  
  <div class="container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="${logoBase64}" alt="PROOF Logo">
    </div>
    
    <!-- Main Title -->
    <h1 class="main-title">CERTIFICAT DE DÉPÔT<br>D'ANTÉRIORITÉ</h1>
    
    <!-- Blockchain Verified Section -->
    <div class="section">
      <div class="section-title">Blockchain Verified</div>
      <div class="blockchain-section">
        <div class="blockchain-info">
          <span class="blockchain-label">Blockchain:</span>
          <span class="blockchain-name">${data.blockchain_name}</span>
        </div>
        <div class="checkmark">✓</div>
      </div>
    </div>
    
    <!-- Project Details Section -->
    <div class="section">
      <div class="section-title">Détails du Projet</div>
      
      <div class="detail-row">
        <span class="detail-label">Titre du projet:</span>
        <span class="detail-value">${data.project_title}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Type de projet:</span>
        <span class="detail-value">
          <span class="project-type-icon">${projectInfo.icon}</span>
          ${projectInfo.label}
        </span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Date de dépôt:</span>
        <span class="detail-value">${data.deposit_date}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Nom du déposant:</span>
        <span class="detail-value">${data.depositor_name}</span>
      </div>
    </div>
    
    <!-- Security Section -->
    <div class="section">
      <div class="section-title">Identification et Sécurité</div>
      
      <div>
        <span class="code-label">Code Identifiant Public:</span>
        <div class="code-block">${data.public_identifier}</div>
      </div>
      
      <div style="margin-top: 15px;">
        <span class="code-label">Empreinte SHA-256:</span>
        <div class="code-block">${data.sha256_hash}</div>
      </div>
    </div>
    
    <!-- Bottom Section: QR Code & Signature -->
    <div class="bottom-section">
      <!-- QR Code -->
      <div class="qr-section">
        <div class="qr-code">
          <img src="${qrCodeDataUrl}" alt="QR Code">
        </div>
        <div class="qr-text">Scannez pour vérifier</div>
        <div class="qr-subtext">Code QR Unique</div>
      </div>
      
      <!-- Signature -->
      <div class="signature-section">
        <img src="${signatureBase64}" alt="Signature" class="signature-image">
        <div class="signature-label">Signature numérique autorisée</div>
        <div class="signature-date">Date: ${data.signature_date}</div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}
