import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface Params {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = params;

        const db = getDB();
        const creation = await db
            .prepare(`
        SELECT 
          c.id, c.publicId, c.title, c.description, c.fileHash, 
          c.projectType, c.authors, c.status, c.createdAt, 
          c.txHash, c.blockNumber,
          u.firstName, u.lastName, u.email
        FROM creations c
        JOIN users u ON c.userId = u.id
        WHERE c.publicId = ?
      `)
            .bind(id)
            .first();

        if (!creation) {
            return NextResponse.json({ error: 'Preuve introuvable' }, { status: 404 });
        }

        return NextResponse.json({ creation });
    } catch (error: any) {
        console.error('Get proof error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export const runtime = 'edge';
