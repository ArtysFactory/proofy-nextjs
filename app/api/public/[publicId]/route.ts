// ============================================
// PROOFY V3 - Public Metadata API
// GET /api/public/[publicId]
// ============================================
// Allfeat-compatible public endpoint
// No authentication required
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';

// ===== GET /api/public/[publicId] =====

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);

    // Fetch creation with public metadata
    const results = await sql`
      SELECT 
        c.id,
        c.public_id,
        c.title,
        c.project_type,
        c.file_hash,
        c.status,
        c.tx_hash,
        c.block_number,
        c.created_at,
        c.public_metadata,
        c.music_rights_status,
        c.full_music_rights_status,
        c.metadata_quality,
        u.first_name,
        u.last_name
      FROM creations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.public_id = ${publicId}
    `;

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Creation not found' },
        { status: 404 }
      );
    }

    const row = results[0];

    // Build response based on project type
    const baseResponse = {
      schema_version: '1.0.0',
      public_id: row.public_id,
      title: row.title,
      project_type: row.project_type,
      proof: {
        file_hash: row.file_hash,
        status: row.status,
        tx_hash: row.tx_hash,
        block_number: row.block_number,
        blockchain: 'polygon',
        contract_address: '0x33623122f8B30c6988bb27Dd865e95A38Fe0Ef48',
        explorer_url: row.tx_hash 
          ? `https://polygonscan.com/tx/${row.tx_hash}`
          : null,
      },
      created_at: row.created_at,
      depositor: {
        display_name: row.first_name && row.last_name 
          ? `${row.first_name} ${row.last_name}`
          : 'Anonymous',
      },
      verification_url: `https://proofy-nextjs.vercel.app/proof/${row.public_id}`,
    };

    // For music projects, include music metadata
    if (row.project_type === 'music' && row.public_metadata) {
      return NextResponse.json({
        ...baseResponse,
        music: row.public_metadata,
        music_rights_status: row.music_rights_status,
        metadata_quality: row.metadata_quality?.status || 'unknown',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Non-music projects
    return NextResponse.json(baseResponse, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('GET /api/public/[publicId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===== OPTIONS for CORS =====

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
