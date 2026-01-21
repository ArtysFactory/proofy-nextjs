// ============================================
// PROOFY - Certificate Generation API
// GET /api/certificate/[id] - Generate PDF certificate
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import * as jose from 'jose';
import QRCode from 'qrcode';
import { generateCertificateHTML } from '@/lib/certificate/template';
import { CertificateData, formatDepositDate, formatSignatureDate } from '@/lib/certificate/types';

const JWT_SECRET = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';

// Logo PROOF en base64 (version simplifiée SVG)
const LOGO_BASE64 = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100">
  <!-- Background pill -->
  <rect x="0" y="0" width="400" height="100" rx="50" fill="#000"/>
  
  <!-- Owl circle -->
  <circle cx="50" cy="50" r="40" fill="#A4D233" stroke="#000" stroke-width="2"/>
  
  <!-- Owl face -->
  <circle cx="38" cy="42" r="8" fill="#000"/>
  <circle cx="62" cy="42" r="8" fill="#000"/>
  <circle cx="40" cy="40" r="3" fill="#fff"/>
  <circle cx="64" cy="40" r="3" fill="#fff"/>
  <path d="M45 58 Q50 65 55 58" stroke="#000" stroke-width="3" fill="none"/>
  
  <!-- Circuit lines -->
  <line x1="25" y1="70" x2="25" y2="80" stroke="#000" stroke-width="2"/>
  <line x1="35" y1="75" x2="35" y2="85" stroke="#000" stroke-width="2"/>
  <line x1="65" y1="75" x2="65" y2="85" stroke="#000" stroke-width="2"/>
  <line x1="75" y1="70" x2="75" y2="80" stroke="#000" stroke-width="2"/>
  
  <!-- PROOF text -->
  <text x="110" y="65" font-family="Arial Black, sans-serif" font-size="50" font-weight="900" fill="#fff">PR</text>
  <text x="185" y="65" font-family="Arial Black, sans-serif" font-size="50" font-weight="900" fill="#A4D233">OO</text>
  <text x="275" y="65" font-family="Arial Black, sans-serif" font-size="50" font-weight="900" fill="#fff">F</text>
  
  <!-- Unlmtd Guilds label -->
  <text x="320" y="35" font-family="Arial, sans-serif" font-size="10" fill="#A4D233" transform="rotate(90, 320, 35)">Unlmtd</text>
  <text x="335" y="35" font-family="Arial, sans-serif" font-size="10" fill="#A4D233" transform="rotate(90, 335, 35)">Guilds</text>
</svg>
`).toString('base64')}`;

// Signature Owlister en base64 (version simplifiée SVG)
const SIGNATURE_BASE64 = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 80">
  <text x="10" y="55" font-family="Brush Script MT, cursive, Georgia" font-size="45" fill="#A4D233" font-style="italic">Owlister</text>
</svg>
`).toString('base64')}`;

async function verifyToken(token: string): Promise<{ userId: number; email: string } | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return {
      userId: payload.userId as number,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: publicId } = await context.params;
    
    if (!publicId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Optional: Check authentication for private certificates
    // For public certificates (proof pages), we allow unauthenticated access
    const authHeader = request.headers.get('Authorization');
    let userId: number | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await verifyToken(token);
      userId = user?.userId || null;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database non configurée' }, { status: 500 });
    }

    const sql = neon(databaseUrl);

    // Fetch creation data
    const creations = await sql`
      SELECT 
        c.id,
        c.public_id,
        c.title,
        c.file_hash,
        c.project_type,
        c.status,
        c.created_at,
        c.tx_hash,
        c.block_number,
        c.chain,
        c.contract_address,
        u.first_name,
        u.last_name,
        u.email as user_email
      FROM creations c
      JOIN users u ON c.user_id = u.id
      WHERE c.public_id = ${publicId}
    `;

    if (creations.length === 0) {
      return NextResponse.json({ error: 'Création non trouvée' }, { status: 404 });
    }

    const creation = creations[0];

    // Determine blockchain name
    let blockchainName = 'Polygon';
    if (creation.chain) {
      if (creation.chain.includes('ethereum')) blockchainName = 'Ethereum';
      else if (creation.chain.includes('bnb') || creation.chain.includes('bsc')) blockchainName = 'BNB Chain';
      else if (creation.chain.includes('polygon')) blockchainName = 'Polygon';
    }

    // Build verification URL
    const contractAddress = creation.contract_address || '0x33623122f8B30c6988bb27Dd865e95A38Fe0Ef48';
    const verificationUrl = creation.tx_hash 
      ? `https://polygonscan.com/tx/${creation.tx_hash}`
      : `https://polygonscan.com/address/${contractAddress}`;

    // Prepare certificate data
    const certificateData: CertificateData = {
      blockchain_name: blockchainName,
      tx_hash: creation.tx_hash,
      block_number: creation.block_number,
      project_title: creation.title,
      project_type: creation.project_type || 'music',
      deposit_date: formatDepositDate(creation.created_at),
      depositor_name: creation.first_name && creation.last_name 
        ? `${creation.first_name} ${creation.last_name}`
        : creation.user_email?.split('@')[0] || 'Anonyme',
      public_identifier: `PROOF-${creation.public_id}`,
      sha256_hash: creation.file_hash,
      wallet_address: contractAddress,
      verification_url: verificationUrl,
      signature_date: formatSignatureDate(creation.created_at),
    };

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Generate HTML
    const html = generateCertificateHTML(
      certificateData,
      qrCodeDataUrl,
      LOGO_BASE64,
      SIGNATURE_BASE64
    );

    // Check if PDF format is requested
    const format = request.nextUrl.searchParams.get('format');
    
    if (format === 'pdf') {
      // For PDF generation, we need Puppeteer
      // This requires a different approach for Vercel serverless
      // For now, return HTML that can be printed as PDF
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="certificat-${publicId}.html"`,
        },
      });
    }

    // Return HTML by default (can be printed as PDF from browser)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error('[Certificate API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du certificat', details: error.message },
      { status: 500 }
    );
  }
}
