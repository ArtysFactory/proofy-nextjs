import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';
import { anchorToBlockchain, simulateAnchor } from '@/lib/blockchain';

// ============================================
// PROOFY - Finalize Creation API
// Manually trigger blockchain anchoring when all signed
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: publicId } = await params;
    if (!publicId) {
      return NextResponse.json({ error: 'ID de création requis' }, { status: 400 });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const sql = neon(databaseUrl);

    // Get creation and verify ownership
    const creation = await sql`
      SELECT 
        c.id, c.public_id, c.title, c.file_hash, c.project_type, c.status,
        c.cosignature_required, c.cosignature_count, c.cosignature_signed_count,
        c.tx_hash
      FROM creations c
      WHERE c.public_id = ${publicId} AND c.user_id = ${payload.userId}
    `;

    if (!creation[0]) {
      return NextResponse.json({ error: 'Création non trouvée' }, { status: 404 });
    }

    const cr = creation[0];

    // Check if already anchored
    if (cr.status === 'anchored' && cr.tx_hash) {
      return NextResponse.json({ 
        success: true, 
        message: 'Déjà ancré sur la blockchain',
        alreadyAnchored: true,
        txHash: cr.tx_hash
      });
    }

    // Check if co-signature is required and all have signed
    if (cr.cosignature_required) {
      const signedCount = parseInt(cr.cosignature_signed_count) || 0;
      const totalCount = parseInt(cr.cosignature_count) || 0;

      console.log(`[Finalize] Checking signatures: ${signedCount}/${totalCount}`);

      if (signedCount < totalCount) {
        return NextResponse.json({ 
          error: `Toutes les signatures ne sont pas encore reçues (${signedCount}/${totalCount})`,
          signedCount,
          totalCount
        }, { status: 400 });
      }
    }

    // Proceed with blockchain anchoring
    console.log(`[Finalize] Triggering blockchain anchoring for ${cr.public_id}...`);

    const privateKey = process.env.POLYGON_PRIVATE_KEY;
    const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';

    let blockchainResult;
    if (privateKey) {
      blockchainResult = await anchorToBlockchain(
        cr.file_hash, 
        cr.public_id, 
        cr.project_type || 'music', 
        privateKey, 
        rpcUrl
      );
    } else {
      console.log('[Finalize] No POLYGON_PRIVATE_KEY - using simulation mode');
      blockchainResult = await simulateAnchor(cr.file_hash, cr.public_id, cr.project_type || 'music');
    }

    if (!blockchainResult.success) {
      console.error('[Finalize] Blockchain anchoring failed:', blockchainResult.error);
      return NextResponse.json({ 
        error: 'Échec de l\'ancrage blockchain',
        details: blockchainResult.error
      }, { status: 500 });
    }

    // Update creation with blockchain info
    await sql`
      UPDATE creations
      SET 
        tx_hash = ${blockchainResult.txHash},
        block_number = ${blockchainResult.blockNumber || null},
        anchored_at = NOW(),
        status = 'anchored',
        cosignature_status = 'all_signed',
        updated_at = NOW()
      WHERE id = ${cr.id}
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
        ${cr.id},
        ${blockchainResult.txHash},
        'polygon',
        ${blockchainResult.blockNumber || null},
        'confirmed',
        NOW()
      )
    `;

    console.log(`[Finalize] Success! TX: ${blockchainResult.txHash}`);

    return NextResponse.json({
      success: true,
      message: blockchainResult.simulated 
        ? 'Dépôt simulé avec succès (mode test)'
        : 'Dépôt ancré sur la blockchain Polygon !',
      txHash: blockchainResult.txHash,
      explorerUrl: blockchainResult.explorerUrl,
      simulated: blockchainResult.simulated
    });

  } catch (error: any) {
    console.error('[Finalize] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}

export const runtime = 'edge';
