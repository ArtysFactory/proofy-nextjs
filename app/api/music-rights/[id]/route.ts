// ============================================
// PROOFY V3 - Music Rights API
// GET / POST /api/music-rights/[id]
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';
import type {
  ArtysMusicRights,
  MusicRightsUpdatePayload,
  MusicRightsResponse,
} from '@/types/music';
import {
  validateMusicRights,
  buildPublicMetadataFromRights,
  determineMusicRightsStatus,
  determineFullMusicRightsStatus,
  logMetadataChange,
  updateMetadataQuality,
  createInitialMetadataQuality,
} from '@/lib/music-rights';

export const runtime = 'edge';

// ===== AUTH HELPER =====

async function verifyAuth(request: NextRequest): Promise<{ userId: number; email: string } | null> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'proofy-secret-key');
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as number,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

// ===== GET /api/music-rights/[id] =====

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Auth check
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const sql = neon(databaseUrl);

    // Fetch creation
    const results = await sql`
      SELECT 
        c.*,
        u.first_name, u.last_name, u.email as user_email
      FROM creations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ${Number(id)} OR c.public_id = ${id}
    `;

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Creation not found' },
        { status: 404 }
      );
    }

    const row = results[0];

    // Check ownership
    if (row.user_id !== auth.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if music project
    if (row.project_type !== 'music') {
      return NextResponse.json(
        { error: 'This creation is not a music project' },
        { status: 400 }
      );
    }

    // Build response
    const rights: ArtysMusicRights = {
      work: row.music_work || {
        work_id: '',
        title: row.title || '',
        authors: [],
        composers: [],
        publishers: [],
      },
      masters: row.music_masters || [],
      releases: row.music_releases || [],
      parties: row.music_parties || [],
      mandates: row.music_mandates || [],
      publicMetadata: row.public_metadata || {
        schema_version: '1.0.0',
        last_updated: new Date().toISOString(),
        work: { title: '', main_authors: [] },
        masters: [],
        releases: [],
        parties: [],
        identifiers: { masters_isrc: [], ipi_list: [], isni_list: [] },
      },
      metadataQuality: row.metadata_quality || createInitialMetadataQuality(String(auth.userId)),
      musicRightsStatus: row.music_rights_status || 'draft',
      fullMusicRightsStatus: row.full_music_rights_status || 'incomplete',
      audioFingerprint: row.audio_fingerprint,
      audioMetadata: row.audio_metadata,
      distributionMetadata: row.distribution_metadata,
      royaltyTracking: row.royalty_tracking,
      nftMetadata: row.nft_metadata,
      onChainSplits: row.on_chain_splits,
    };

    return NextResponse.json({
      success: true,
      creationId: row.id,
      publicId: row.public_id,
      title: row.title,
      rights,
    });
  } catch (error) {
    console.error('GET /api/music-rights/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// ===== POST /api/music-rights/[id] =====

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Auth check
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const sql = neon(databaseUrl);
    const payload: MusicRightsUpdatePayload = await request.json();

    // Fetch existing creation
    const results = await sql`
      SELECT * FROM creations 
      WHERE id = ${Number(id)} OR public_id = ${id}
    `;

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Creation not found' },
        { status: 404 }
      );
    }

    const row = results[0];

    // Check ownership
    if (row.user_id !== auth.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if music project
    if (row.project_type !== 'music') {
      return NextResponse.json(
        { error: 'This creation is not a music project' },
        { status: 400 }
      );
    }

    // Validate the data
    const validation = validateMusicRights(payload);

    // Determine statuses
    const musicRightsStatus = determineMusicRightsStatus(payload, payload.mandates || []);
    const fullMusicRightsStatus = determineFullMusicRightsStatus(
      validation,
      musicRightsStatus,
      row.distribution_status
    );

    // Build public metadata
    const publicMetadata = buildPublicMetadataFromRights(
      payload.work || { work_id: '', title: '', authors: [], composers: [], publishers: [] },
      payload.masters || [],
      payload.releases || [],
      payload.parties || []
    );

    // Update metadata quality
    const currentQuality = row.metadata_quality || createInitialMetadataQuality(String(auth.userId));
    const updatedQuality = updateMetadataQuality(
      currentQuality,
      String(auth.userId),
      'rights_updated',
      `Music rights updated (completeness: ${validation.completeness_score}%)`,
      validation.valid ? 'self_declared' : 'draft',
      validation.completeness_score
    );

    // Update database
    await sql`
      UPDATE creations SET
        music_work = ${JSON.stringify(payload.work)}::jsonb,
        music_masters = ${JSON.stringify(payload.masters || [])}::jsonb,
        music_releases = ${JSON.stringify(payload.releases || [])}::jsonb,
        music_parties = ${JSON.stringify(payload.parties || [])}::jsonb,
        music_mandates = ${JSON.stringify(payload.mandates || [])}::jsonb,
        music_rights_status = ${musicRightsStatus},
        public_metadata = ${JSON.stringify(publicMetadata)}::jsonb,
        metadata_quality = ${JSON.stringify(updatedQuality)}::jsonb,
        metadata_version = COALESCE(metadata_version, 0) + 1,
        full_music_rights_status = ${fullMusicRightsStatus},
        updated_at = NOW()
      WHERE id = ${row.id}
    `;

    // Log the change
    await logMetadataChange(
      row.id,
      String(auth.userId),
      'rights_updated',
      `Music rights updated by user`,
      {
        music_work: row.music_work,
        music_masters: row.music_masters,
        music_parties: row.music_parties,
      },
      payload,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    const response: MusicRightsResponse = {
      success: true,
      musicRightsStatus,
      fullMusicRightsStatus,
      publicMetadata,
      errors: validation.errors.length > 0 ? validation.errors : undefined,
    };

    return NextResponse.json({
      ...response,
      validation: {
        valid: validation.valid,
        completeness_score: validation.completeness_score,
        warnings: validation.warnings,
      },
    });
  } catch (error) {
    console.error('POST /api/music-rights/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
