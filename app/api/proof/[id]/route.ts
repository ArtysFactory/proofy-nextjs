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
                c.copyright_rights as "copyrightRights",
                c.neighboring_rights as "neighboringRights",
                c.music_work as "musicWork",
                c.music_parties as "musicParties",
                u.first_name as "firstName", u.last_name as "lastName", u.email
            FROM creations c
            JOIN users u ON c.user_id = u.id
            WHERE c.public_id = ${id}
        `;

        if (results.length === 0) {
            return NextResponse.json({ error: 'Preuve introuvable' }, { status: 404 });
        }

        return NextResponse.json({ creation: results[0] });
    } catch (error: any) {
        console.error('Get proof error:', error);
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
    }
}

export const runtime = 'edge';
