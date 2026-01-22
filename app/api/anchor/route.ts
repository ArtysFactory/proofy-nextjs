import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';
import { anchorToBlockchain, simulateAnchor } from '@/lib/blockchain';

// ============================================
// PROOFY - Blockchain Anchor API
// POST /api/anchor
// Triggers blockchain anchoring for a creation
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
    } catch (error) {
        return null;
    }
}

// Internal function to anchor a creation (can be called without auth for system triggers)
export async function anchorCreation(creationId: number): Promise<{
    success: boolean;
    txHash?: string;
    blockNumber?: number;
    error?: string;
}> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        return { success: false, error: 'Database not configured' };
    }

    const sql = neon(databaseUrl);

    // Get creation details
    const creation = await sql`
        SELECT id, public_id, file_hash, project_type, status, cosignature_status
        FROM creations
        WHERE id = ${creationId}
    `;

    if (!creation[0]) {
        return { success: false, error: 'Creation not found' };
    }

    const { public_id, file_hash, project_type, status, cosignature_status } = creation[0];

    // Check if already anchored
    if (status === 'confirmed') {
        return { success: false, error: 'Already anchored' };
    }

    // Check if co-signature is complete (if required)
    if (cosignature_status && cosignature_status !== 'all_signed') {
        return { success: false, error: 'Co-signatures not complete' };
    }

    console.log(`[Anchor] Starting blockchain anchor for creation ${creationId} (${public_id})`);

    // Perform blockchain anchoring
    const privateKey = process.env.POLYGON_PRIVATE_KEY;
    const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';

    let blockchainResult;

    if (privateKey) {
        try {
            blockchainResult = await anchorToBlockchain(
                file_hash,
                public_id,
                project_type || 'music',
                privateKey,
                rpcUrl
            );
        } catch (err: any) {
            console.error('[Anchor] Blockchain error:', err);
            blockchainResult = { success: false, error: err.message };
        }
    } else {
        console.log('[Anchor] No POLYGON_PRIVATE_KEY - using simulation mode');
        blockchainResult = await simulateAnchor(file_hash, public_id, project_type || 'music');
    }

    if (blockchainResult.success) {
        // Update creation with blockchain info
        await sql`
            UPDATE creations
            SET 
                status = 'confirmed',
                tx_hash = ${blockchainResult.txHash || null},
                block_number = ${blockchainResult.blockNumber || null},
                chain = 'polygon_mainnet',
                on_chain_timestamp = NOW(),
                updated_at = NOW()
            WHERE id = ${creationId}
        `;

        // Insert transaction record if we have a tx hash
        if (blockchainResult.txHash) {
            await sql`
                INSERT INTO transactions (
                    creation_id,
                    tx_hash,
                    chain,
                    block_number,
                    status,
                    on_chain_timestamp,
                    created_at
                )
                VALUES (
                    ${creationId},
                    ${blockchainResult.txHash},
                    'polygon_mainnet',
                    ${blockchainResult.blockNumber || null},
                    'confirmed',
                    NOW(),
                    NOW()
                )
            `;
        }

        console.log(`[Anchor] Successfully anchored creation ${creationId}. TX: ${blockchainResult.txHash}`);
    } else {
        console.error(`[Anchor] Failed to anchor creation ${creationId}:`, blockchainResult.error);
    }

    return {
        success: blockchainResult.success,
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        error: blockchainResult.error,
    };
}

// POST /api/anchor - Manual anchor trigger (requires auth + ownership)
export async function POST(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const { creationId } = body;

        if (!creationId) {
            return NextResponse.json({ error: 'creationId requis' }, { status: 400 });
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // Verify ownership
        const creation = await sql`
            SELECT id FROM creations
            WHERE id = ${creationId} AND user_id = ${payload.userId}
        `;

        if (!creation[0]) {
            return NextResponse.json({ error: 'Création non trouvée' }, { status: 404 });
        }

        // Trigger anchoring
        const result = await anchorCreation(creationId);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Création ancrée sur la blockchain avec succès',
                txHash: result.txHash,
                blockNumber: result.blockNumber,
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error || 'Échec de l\'ancrage blockchain',
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Anchor error:', error);
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
    }
}
