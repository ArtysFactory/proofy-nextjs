import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        const results = await sql`
            SELECT 
                c.id, c.public_id as "publicId", c.title, c.description, 
                c.file_hash as "fileHash", c.project_type as "projectType", 
                c.authors, c.status, c.created_at as "createdAt", 
                c.tx_hash as "txHash", c.block_number as "blockNumber",
                u.first_name as "firstName", u.last_name as "lastName", u.email
            FROM creations c
            JOIN users u ON c.user_id = u.id
            WHERE c.public_id = ${id}
        `;

        if (results.length === 0) {
            return NextResponse.json({ error: 'Preuve introuvable' }, { status: 404 });
        }

        const creation = results[0];

        // Public proof URL
        const proofUrl = `https://proofy-nextjs.vercel.app/proof/${creation.publicId}`;
        
        // Generate QR Code using Google Charts API (reliable and edge-compatible)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(proofUrl)}&bgcolor=ffffff&color=0b0124&margin=10`;

        // Format date in French
        const createdDate = new Date(creation.createdAt);
        const formattedDate = createdDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Generate certificate HTML
        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificat Proofy - ${escapeHtml(creation.title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0b0124 0%, #1a0a3e 50%, #0b0124 100%);
            min-height: 100vh;
            padding: 40px 20px;
            color: #fff;
        }
        
        .certificate {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(191, 242, 39, 0.2);
            border-radius: 24px;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        
        .header {
            background: linear-gradient(135deg, rgba(191, 242, 39, 0.15) 0%, rgba(191, 242, 39, 0.05) 100%);
            padding: 40px;
            text-align: center;
            border-bottom: 1px solid rgba(191, 242, 39, 0.2);
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .logo-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #bff227 0%, #9dcc1e 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .logo-text {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(135deg, #bff227 0%, #fff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .certificate-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #bff227;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 8px;
        }
        
        .certificate-subtitle {
            font-size: 24px;
            font-weight: 600;
            color: #fff;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #bff227 0%, #9dcc1e 100%);
            color: #0b0124;
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 20px;
        }
        
        .content {
            padding: 40px;
        }
        
        .creation-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
        
        .info-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(191, 242, 39, 0.1);
            border-radius: 16px;
            padding: 20px;
        }
        
        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #bff227;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        
        .info-value {
            font-size: 16px;
            color: #fff;
            font-weight: 500;
        }
        
        .hash-section {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(191, 242, 39, 0.2);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
        }
        
        .hash-title {
            font-size: 14px;
            font-weight: 600;
            color: #bff227;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }
        
        .hash-value {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #fff;
            word-break: break-all;
            background: rgba(191, 242, 39, 0.05);
            padding: 16px;
            border-radius: 8px;
            border-left: 3px solid #bff227;
        }
        
        .blockchain-section {
            background: linear-gradient(135deg, rgba(191, 242, 39, 0.1) 0%, rgba(191, 242, 39, 0.02) 100%);
            border: 1px solid rgba(191, 242, 39, 0.2);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
        }
        
        .blockchain-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 600;
            color: #bff227;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
        }
        
        .blockchain-info {
            display: grid;
            gap: 16px;
        }
        
        .blockchain-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .blockchain-label {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
        }
        
        .blockchain-value {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #fff;
            word-break: break-all;
        }
        
        .qr-section {
            text-align: center;
            padding: 30px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 16px;
            border: 1px solid rgba(191, 242, 39, 0.1);
        }
        
        .qr-title {
            font-size: 14px;
            font-weight: 600;
            color: #bff227;
            margin-bottom: 20px;
        }
        
        .qr-code {
            display: inline-block;
            background: #fff;
            padding: 16px;
            border-radius: 16px;
            margin-bottom: 16px;
        }
        
        .qr-code img {
            display: block;
            width: 200px;
            height: 200px;
        }
        
        .qr-url {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            word-break: break-all;
        }
        
        .qr-url a {
            color: #bff227;
            text-decoration: none;
        }
        
        .footer {
            background: rgba(0, 0, 0, 0.3);
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid rgba(191, 242, 39, 0.1);
        }
        
        .footer-text {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 8px;
        }
        
        .footer-link {
            color: #bff227;
            text-decoration: none;
            font-weight: 500;
        }
        
        .polygon-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #8247e5;
            color: #fff;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 16px;
            text-decoration: none;
            transition: background 0.2s;
        }
        
        .polygon-badge:hover {
            background: #9b5de5;
        }
        
        .download-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #bff227 0%, #9dcc1e 100%);
            color: #0b0124;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-bottom: 20px;
        }
        
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(191, 242, 39, 0.3);
        }
        
        .actions-bar {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            text-decoration: none;
            border: 1px solid rgba(191, 242, 39, 0.3);
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .back-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(191, 242, 39, 0.5);
        }
        
        @media print {
            body {
                background: #fff !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .certificate {
                border: 2px solid #0b0124;
                box-shadow: none;
                border-radius: 0;
            }
            .header {
                background: #f0f7d4 !important;
                -webkit-print-color-adjust: exact !important;
            }
            .logo-text {
                color: #0b0124 !important;
                -webkit-text-fill-color: #0b0124 !important;
            }
            .certificate-title {
                color: #0b0124 !important;
            }
            .certificate-subtitle, .creation-title, .info-value, .hash-value, .blockchain-value, .qr-url {
                color: #0b0124 !important;
            }
            .info-label, .hash-title, .blockchain-title, .blockchain-label {
                color: #555 !important;
            }
            .status-badge {
                background: #bff227 !important;
                -webkit-print-color-adjust: exact !important;
            }
            .info-card, .hash-section, .blockchain-section, .qr-section {
                background: #f9f9f9 !important;
                border-color: #ddd !important;
                -webkit-print-color-adjust: exact !important;
            }
            .hash-value {
                background: #fff !important;
                border-left-color: #bff227 !important;
            }
            .polygon-badge {
                background: #8247e5 !important;
                color: #fff !important;
                -webkit-print-color-adjust: exact !important;
            }
            .footer {
                background: #f5f5f5 !important;
            }
            .footer-text {
                color: #666 !important;
            }
            .actions-bar, .download-btn, .back-btn {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="actions-bar">
        <button onclick="window.print()" class="download-btn">
            📥 Télécharger en PDF
        </button>
        <a href="https://proofy-nextjs.vercel.app/dashboard" class="back-btn">
            ← Retour au tableau de bord
        </a>
    </div>
    
    <div class="certificate">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">🛡️</div>
                <span class="logo-text">Proofy</span>
            </div>
            <div class="certificate-title">Certificat de Preuve d'Antériorité</div>
            <div class="certificate-subtitle">Blockchain Polygon</div>
            <div class="status-badge">
                ✓ PREUVE VÉRIFIÉE
            </div>
        </div>
        
        <div class="content">
            <h1 class="creation-title">${escapeHtml(creation.title)}</h1>
            
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-label">Type de projet</div>
                    <div class="info-value">${getProjectTypeLabel(creation.projectType)}</div>
                </div>
                
                <div class="info-card">
                    <div class="info-label">Date de dépôt</div>
                    <div class="info-value">${formattedDate}</div>
                </div>
                
                <div class="info-card">
                    <div class="info-label">Déposant</div>
                    <div class="info-value">${escapeHtml(creation.firstName)} ${escapeHtml(creation.lastName)}</div>
                </div>
                
                <div class="info-card">
                    <div class="info-label">Identifiant Public</div>
                    <div class="info-value" style="font-family: monospace;">${creation.publicId}</div>
                </div>
            </div>
            
            ${creation.description ? `
            <div class="info-card" style="margin-bottom: 30px;">
                <div class="info-label">Description</div>
                <div class="info-value">${escapeHtml(creation.description)}</div>
            </div>
            ` : ''}
            
            ${creation.authors ? `
            <div class="info-card" style="margin-bottom: 30px;">
                <div class="info-label">Auteur(s)</div>
                <div class="info-value">${escapeHtml(creation.authors)}</div>
            </div>
            ` : ''}
            
            <div class="hash-section">
                <div class="hash-title">🔐 Empreinte SHA-256 du fichier</div>
                <div class="hash-value">${creation.fileHash}</div>
            </div>
            
            ${creation.txHash ? `
            <div class="blockchain-section">
                <div class="blockchain-title">
                    <span>⛓️</span>
                    <span>Preuve Blockchain</span>
                </div>
                <div class="blockchain-info">
                    <div class="blockchain-item">
                        <span class="blockchain-label">Transaction Hash</span>
                        <span class="blockchain-value">${creation.txHash}</span>
                    </div>
                    ${creation.blockNumber ? `
                    <div class="blockchain-item">
                        <span class="blockchain-label">Numéro de bloc</span>
                        <span class="blockchain-value">#${creation.blockNumber}</span>
                    </div>
                    ` : ''}
                    <div class="blockchain-item">
                        <span class="blockchain-label">Réseau</span>
                        <span class="blockchain-value">Polygon Mainnet</span>
                    </div>
                    <div class="blockchain-item">
                        <span class="blockchain-label">Smart Contract</span>
                        <span class="blockchain-value">0x33623122f8B30c6988bb27Dd865e95A38Fe0Ef48</span>
                    </div>
                </div>
                <a href="https://polygonscan.com/tx/${creation.txHash}" target="_blank" class="polygon-badge">
                    🔗 Voir sur Polygonscan
                </a>
            </div>
            ` : ''}
            
            <div class="qr-section">
                <div class="qr-title">📱 Scanner pour vérifier cette preuve</div>
                <div class="qr-code">
                    <img src="${qrCodeUrl}" alt="QR Code - Scanner pour vérifier" />
                </div>
                <div class="qr-url">
                    <a href="${proofUrl}" target="_blank">${proofUrl}</a>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                Ce certificat atteste de l'existence et de l'intégrité du fichier à la date indiquée.
            </p>
            <p class="footer-text">
                La preuve est enregistrée de manière immuable sur la blockchain Polygon.
            </p>
            <p class="footer-text" style="margin-top: 16px;">
                Généré par <a href="https://proofy-nextjs.vercel.app" class="footer-link">Proofy</a> — Protection de propriété intellectuelle sur blockchain
            </p>
        </div>
    </div>
</body>
</html>
        `;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="proofy-certificate-${creation.publicId}.html"`,
            },
        });
    } catch (error: any) {
        console.error('Certificate generation error:', error);
        return NextResponse.json({ error: 'Erreur lors de la génération', details: error.message }, { status: 500 });
    }
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper function to get project type label
function getProjectTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        'music': '🎵 Musique',
        'image': '🖼️ Image',
        'video': '🎬 Vidéo',
        'document': '📄 Document',
        'code': '💻 Code source',
        'other': '📁 Autre'
    };
    return labels[type] || type;
}

export const runtime = 'edge';
