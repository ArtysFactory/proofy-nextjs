import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { query } from '@/lib/db';

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

        const creations = await query(
            `SELECT id, public_id as "publicId", title, file_hash as "fileHash", 
                    project_type as "projectType", status, created_at as "createdAt", 
                    tx_hash as "txHash", block_number as "blockNumber"
             FROM creations
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [payload.userId]
        );

        return NextResponse.json({ creations: creations || [] });
    } catch (error: any) {
        console.error('Get creations error:', error);
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
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

        // Insert creation
        await query(
            `INSERT INTO creations (
                user_id, public_id, title, description, file_hash, project_type, 
                authors, status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW(), NOW())`,
            [
                payload.userId,
                publicId,
                title,
                description || '',
                fileHash,
                projectType,
                authors || ''
            ]
        );

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
        return NextResponse.json({ error: 'Erreur lors de la création', details: error.message }, { status: 500 });
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
