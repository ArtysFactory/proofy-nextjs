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

        // Polygonscan URL for QR Code (blockchain proof)
        const polygonscanUrl = creation.txHash 
            ? `https://polygonscan.com/tx/${creation.txHash}`
            : `https://polygonscan.com/address/0x33623122f8B30c6988bb27Dd865e95A38Fe0Ef48`;
        
        // Generate QR Code pointing to Polygonscan
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(polygonscanUrl)}&bgcolor=ffffff&color=0b0124&margin=10`;

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

        // Generate certificate HTML with dark design preserved for print
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
        /* ===========================================
           PROOFY CERTIFICATE - PRINT-OPTIMIZED STYLES
           Force dark theme colors in PDF export
           =========================================== */
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* CRITICAL: Force background colors to print */
        html {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #0a0a0a !important;
            min-height: 100vh;
            padding: 40px 20px;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        
        .certificate {
            max-width: 800px;
            margin: 0 auto;
            background-color: #0a0a0a !important;
            border: 3px solid #bff227 !important;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 0 60px rgba(191, 242, 39, 0.15);
        }
        
        .header {
            background-color: #0a0a0a !important;
            background-image: linear-gradient(135deg, #141414 0%, #0a0a0a 100%) !important;
            padding: 40px;
            text-align: center;
            border-bottom: 3px solid #bff227 !important;
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
            background-color: #bff227 !important;
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
            color: #bff227 !important;
        }
        
        .certificate-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #bff227 !important;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 8px;
        }
        
        .certificate-subtitle {
            font-size: 24px;
            font-weight: 600;
            color: #ffffff !important;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #bff227 !important;
            color: #0a0a0a !important;
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 20px;
        }
        
        .content {
            padding: 40px;
            background-color: #0a0a0a !important;
        }
        
        .creation-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            font-weight: 700;
            color: #ffffff !important;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-card {
            background-color: #141414 !important;
            border: 1px solid #333333 !important;
            border-radius: 16px;
            padding: 20px;
        }
        
        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #bff227 !important;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        
        .info-value {
            font-size: 16px;
            color: #ffffff !important;
            font-weight: 500;
        }
        
        .hash-section {
            background-color: #141414 !important;
            border: 1px solid #333333 !important;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
        }
        
        .hash-title {
            font-size: 14px;
            font-weight: 600;
            color: #bff227 !important;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }
        
        .hash-value {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #ffffff !important;
            word-break: break-all;
            background-color: #0a0a0a !important;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #bff227 !important;
        }
        
        .blockchain-section {
            background-color: #141414 !important;
            border: 3px solid #bff227 !important;
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
            color: #bff227 !important;
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
            color: #888888 !important;
        }
        
        .blockchain-value {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #ffffff !important;
            word-break: break-all;
        }
        
        .qr-section {
            text-align: center;
            padding: 30px;
            background-color: #141414 !important;
            border-radius: 16px;
            border: 1px solid #333333 !important;
        }
        
        .qr-title {
            font-size: 14px;
            font-weight: 600;
            color: #bff227 !important;
            margin-bottom: 20px;
        }
        
        .qr-code {
            display: inline-block;
            background-color: #ffffff !important;
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
            font-size: 11px;
            color: #888888 !important;
            word-break: break-all;
        }
        
        .qr-url a {
            color: #bff227 !important;
            text-decoration: none;
        }
        
        .footer {
            background-color: #0a0a0a !important;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #333333 !important;
        }
        
        .footer-text {
            font-size: 12px;
            color: #888888 !important;
            margin-bottom: 8px;
        }
        
        .footer-link {
            color: #bff227 !important;
            text-decoration: none;
            font-weight: 500;
        }
        
        .polygon-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background-color: #8247e5 !important;
            color: #ffffff !important;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 16px;
            text-decoration: none;
        }
        
        .download-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #bff227 !important;
            color: #0a0a0a !important;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border: none;
            cursor: pointer;
            margin-bottom: 20px;
            transition: all 0.2s ease;
        }
        
        .download-btn:hover {
            background-color: #d4ff4d !important;
            transform: translateY(-2px);
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
            background-color: transparent !important;
            color: #ffffff !important;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            text-decoration: none;
            border: 2px solid #bff227 !important;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .back-btn:hover {
            background-color: rgba(191, 242, 39, 0.1) !important;
        }
        
        /* Print notice banner */
        .print-notice {
            background-color: #1a1a2e !important;
            border: 2px solid #bff227 !important;
            border-radius: 12px;
            padding: 16px 24px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .print-notice-icon {
            font-size: 24px;
        }
        
        .print-notice-text {
            color: #ffffff !important;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .print-notice-text strong {
            color: #bff227 !important;
        }
        
        /* ===========================================
           PRINT MEDIA QUERIES - FORCE DARK THEME
           =========================================== */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            html, body {
                background-color: #0a0a0a !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            
            .actions-bar, .print-notice {
                display: none !important;
            }
            
            .certificate {
                border-radius: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border-width: 0 !important;
                border-bottom: 3px solid #bff227 !important;
            }
            
            .header {
                border-radius: 0 !important;
            }
            
            /* Force all backgrounds for print */
            .header, .content, .footer {
                background-color: #0a0a0a !important;
            }
            
            .info-card, .hash-section, .blockchain-section, .qr-section {
                background-color: #141414 !important;
            }
            
            .hash-value {
                background-color: #0a0a0a !important;
            }
            
            /* Ensure text visibility */
            .certificate-subtitle, .creation-title, .info-value, 
            .hash-value, .blockchain-value {
                color: #ffffff !important;
            }
            
            .logo-text, .certificate-title, .info-label, 
            .hash-title, .blockchain-title, .qr-title, .footer-link {
                color: #bff227 !important;
            }
            
            .blockchain-label, .qr-url, .footer-text {
                color: #888888 !important;
            }
            
            /* Keep QR code background white */
            .qr-code {
                background-color: #ffffff !important;
            }
        }
        
        @page {
            size: A4;
            margin: 10mm;
        }
    </style>
</head>
<body>
    <div class="print-notice">
        <span class="print-notice-icon">💡</span>
        <span class="print-notice-text">
            Pour conserver le design sombre dans le PDF, activez <strong>"Graphiques d'arrière-plan"</strong> 
            dans les options d'impression (Plus de paramètres → Graphiques d'arrière-plan).
        </span>
    </div>
    
    <div class="actions-bar">
        <button onclick="window.print()" class="download-btn">
            📥 Télécharger en PDF
        </button>
        <a href="/fr/dashboard" class="back-btn" onclick="event.preventDefault(); window.location.href = '/fr/dashboard';">
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
                    <span>Preuve Blockchain Polygon</span>
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
                <a href="${polygonscanUrl}" target="_blank" class="polygon-badge">
                    🔗 Voir sur Polygonscan
                </a>
            </div>
            ` : ''}
            
            <div class="qr-section">
                <div class="qr-title">📱 Scanner pour vérifier sur Polygonscan</div>
                <div class="qr-code">
                    <img src="${qrCodeUrl}" alt="QR Code - Vérifier sur Polygonscan" />
                </div>
                <div class="qr-url">
                    <a href="${polygonscanUrl}" target="_blank">${polygonscanUrl}</a>
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
