import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getDB, getEnv } from '@/lib/db';
import { anchorToBlockchain } from '@/lib/blockchain';

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

export async function POST(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const { publicId } = body;

        if (!publicId) {
            return NextResponse.json({ error: 'publicId requis' }, { status: 400 });
        }

        const db = getDB();

        // Get creation details
        const creation = (await db
            .prepare('SELECT id, publicId, fileHash, projectType, userId FROM creations WHERE publicId = ?')
            .bind(publicId)
            .first()) as any;

        if (!creation) {
            return NextResponse.json({ error: 'Création introuvable' }, { status: 404 });
        }

        // Verify ownership
        if (creation.userId !== payload.userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Check if already anchored
        const existing = await db
            .prepare('SELECT txHash FROM creations WHERE publicId = ? AND txHash IS NOT NULL')
            .bind(publicId)
            .first();

        if (existing) {
            return NextResponse.json(
                { error: 'Cette création est déjà ancrée sur la blockchain' },
                { status: 400 }
            );
        }

        // Get blockchain credentials from environment
        const env = getEnv();
        const privateKey = env.POLYGON_PRIVATE_KEY;
        const rpcUrl = env.POLYGON_RPC_URL || 'https://polygon-rpc.com';

        if (!privateKey) {
            return NextResponse.json(
                { error: 'Configuration blockchain manquante' },
                { status: 500 }
            );
        }

        // Anchor to blockchain
        const result = await anchorToBlockchain(
            creation.fileHash,
            creation.publicId,
            creation.projectType,
            privateKey,
            rpcUrl
        );

        if (!result.success) {
            // Update status to failed
            await db
                .prepare(`UPDATE creations SET status = 'failed', updatedAt = datetime('now') WHERE publicId = ?`)
                .bind(publicId)
                .run();

            return NextResponse.json(
                { error: result.error || 'Échec de l\'ancrage blockchain' },
                { status: 500 }
            );
        }

        // Update with blockchain data
        await db
            .prepare(`
        UPDATE creations 
        SET txHash = ?, blockNumber = ?, status = 'confirmed', updatedAt = datetime('now')
        WHERE publicId = ?
      `)
            .bind(result.txHash, result.blockNumber || 0, publicId)
            .run();

        return NextResponse.json({
            success: true,
            txHash: result.txHash,
            blockNumber: result.blockNumber,
        });
    } catch (error: any) {
        console.error('Anchor error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'ancrage', details: error.message },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';
