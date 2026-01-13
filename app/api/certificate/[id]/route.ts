import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import QRCode from 'qrcode';

interface Params {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = params;

        const db = getDB();
        const creation = (await db
            .prepare(`
        SELECT 
          c.publicId, c.title, c.description, c.fileHash, 
          c.projectType, c.authors, c.createdAt, 
          c.txHash, c.blockNumber,
          u.firstName, u.lastName, u.email
        FROM creations c
        JOIN users u ON c.userId = u.id
        WHERE c.publicId = ?
      `)
            .bind(id)
            .first()) as any;

        if (!creation) {
            return NextResponse.json({ error: 'Preuve introuvable' }, { status: 404 });
        }

        // Generate QR code for proof URL
        const proofUrl = `${request.nextUrl.origin}/proof/${creation.publicId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(proofUrl, {
            width: 200,
            margin: 2,
        });

        // Generate simple PDF-like HTML response
        // In production, use a proper PDF library like @react-pdf/renderer or puppeteer
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificat Proofy - ${creation.title}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: white;
      color: #000;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #bff227;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #bff227;
    }
    h1 {
      color: #2a2559;
      font-size: 28px;
      margin: 20px 0;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-left: 4px solid #bff227;
    }
    .label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }
    .value {
      font-size: 16px;
      margin-top: 5px;
      word-break: break-all;
    }
    .hash {
      font-family: 'Courier New', monospace;
      background: #fff;
      padding: 10px;
      border: 1px solid #ddd;
      font-size: 12px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    .qr-code {
      text-align: center;
      margin: 20px 0;
    }
    .status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      background: #bff227;
      color: #000;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🛡️ PROOFY</div>
    <p>Certificat de Preuve d'Antériorité sur Blockchain</p>
    <span class="status">✓ VÉRIFIÉ</span>
  </div>

  <h1>${creation.title}</h1>

  <div class="section">
    <div class="label">Type de projet</div>
    <div class="value">${creation.projectType}</div>
  </div>

  <div class="section">
    <div class="label">Date de dépôt</div>
    <div class="value">${new Date(creation.createdAt).toLocaleString('fr-FR', {
            dateStyle: 'full',
            timeStyle: 'long',
        })}</div>
  </div>

  ${creation.authors
                ? `
  <div class="section">
    <div class="label">Auteur(s)</div>
    <div class="value">${creation.authors}</div>
  </div>
  `
                : ''
            }

  <div class="section">
    <div class="label">Déposant</div>
    <div class="value">${creation.firstName} ${creation.lastName}</div>
  </div>

  ${creation.description
                ? `
  <div class="section">
    <div class="label">Description</div>
    <div class="value">${creation.description}</div>
  </div>
  `
                : ''
            }

  <div class="section">
    <div class="label">Empreinte SHA-256 du fichier</div>
    <div class="value hash">${creation.fileHash}</div>
  </div>

  ${creation.txHash
                ? `
  <div class="section">
    <div class="label">Transaction Blockchain (Polygon)</div>
    <div class="value hash">${creation.txHash}</div>
  </div>

  <div class="section">
    <div class="label">Numéro de bloc</div>
    <div class="value">#${creation.blockNumber || 'N/A'}</div>
  </div>
  `
                : ''
            }

  <div class="qr-code">
    <p><strong>Vérifier cette preuve :</strong></p>
    <img src="${qrCodeDataUrl}" alt="QR Code" />
    <p style="font-size: 12px; color: #666;">${proofUrl}</p>
  </div>

  <div class="footer">
    <p><strong>Ce certificat est vérifiable publiquement sur la blockchain Polygon.</strong></p>
    <p>Généré par Proofy - Protection de propriété intellectuelle sur blockchain</p>
    <p>https://proofy.io</p>
  </div>
</body>
</html>
    `;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="proofy-${creation.publicId}.html"`,
            },
        });
    } catch (error: any) {
        console.error('Certificate generation error:', error);
        return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 });
    }
}

export const runtime = 'edge';
