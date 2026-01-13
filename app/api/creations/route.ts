import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getDB } from '@/lib/db';

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

// GET /api/creations - List user creations
export async function GET(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const db = getDB();
        const creations = await db
            .prepare(`
        SELECT id, publicId, title, fileHash, projectType, status, createdAt, txHash, blockNumber
        FROM creations
        WHERE userId = ?
        ORDER BY createdAt DESC
      `)
            .bind(payload.userId)
            .all();

        return NextResponse.json({ creations: creations.results || [] });
    } catch (error: any) {
        console.error('Get creations error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST /api/creations - Create new proof
export async function POST(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, fileHash, projectType, authors } = body;

        // Validation
        if (!title || !fileHash || !projectType) {
            return NextResponse.json(
                { error: 'Titre, hash du fichier et type de projet requis' },
                { status: 400 }
            );
        }

        // Generate unique public ID
        const publicId = generatePublicId();

        const db = getDB();

        // Insert creation
        await db
            .prepare(`
        INSERT INTO creations (
          userId, publicId, title, description, fileHash, projectType, 
          authors, status, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
      `)
            .bind(
                payload.userId,
                publicId,
                title,
                description || '',
                fileHash,
                projectType,
                authors || ''
            )
            .run();

        // TODO: Trigger blockchain anchoring in background
        // For now, we'll return success and the anchoring can happen async

        return NextResponse.json(
            {
                success: true,
                publicId,
                message: 'Création enregistrée avec succès',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create proof error:', error);
        return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
    }
}

function generatePublicId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const runtime = 'edge';
