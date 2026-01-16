// ============================================
// PROOFY V3 - Metadata Quality API
// PATCH /api/music-rights/[id]/quality
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';
import type { MetadataQualityStatus } from '@/types/music';
import {
  updateMetadataQuality,
  createInitialMetadataQuality,
  logMetadataChange,
} from '@/lib/music-rights';

export const runtime = 'edge';

// ===== AUTH HELPER =====

async function verifyAuth(request: NextRequest): Promise<{ userId: number; email: string; isAdmin?: boolean } | null> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'proofy-secret-key');
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      isAdmin: payload.isAdmin as boolean | undefined,
    };
  } catch {
    return null;
  }
}

// ===== PATCH /api/music-rights/[id]/quality =====

export async function PATCH(
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
    const body = await request.json();
    
    const {
      status,
      review_notes,
    }: {
      status: MetadataQualityStatus;
      review_notes?: string;
    } = body;

    // Validate status
    const validStatuses: MetadataQualityStatus[] = [
      'draft',
      'self_declared',
      'pending_review',
      'verified_artys',
      'verified_third_party',
      'disputed',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Only admins can set verified statuses
    const adminOnlyStatuses: MetadataQualityStatus[] = ['verified_artys', 'verified_third_party'];
    if (adminOnlyStatuses.includes(status) && !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can set verified status' },
        { status: 403 }
      );
    }

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

    // Check access - owner or admin
    if (row.user_id !== auth.userId && !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get current quality or create initial
    const currentQuality = row.metadata_quality || createInitialMetadataQuality(String(auth.userId));

    // Build change summary
    const changeSummary = `Status changed from "${currentQuality.status}" to "${status}"${
      review_notes ? ` - Notes: ${review_notes}` : ''
    }`;

    // Update quality
    const updatedQuality = updateMetadataQuality(
      currentQuality,
      String(auth.userId),
      'quality_review',
      changeSummary,
      status,
      currentQuality.completeness_score
    );

    // Add review notes if provided
    if (review_notes) {
      updatedQuality.review_notes = review_notes;
    }

    // Update database
    await sql`
      UPDATE creations SET
        metadata_quality = ${JSON.stringify(updatedQuality)}::jsonb,
        updated_at = NOW()
      WHERE id = ${row.id}
    `;

    // Log the change
    await logMetadataChange(
      row.id,
      String(auth.userId),
      'quality_review',
      changeSummary,
      currentQuality,
      updatedQuality,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      metadata_quality: updatedQuality,
      message: `Quality status updated to "${status}"`,
    });
  } catch (error) {
    console.error('PATCH /api/music-rights/[id]/quality error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// ===== GET /api/music-rights/[id]/quality =====

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

    const sql = neon(databaseUrl);

    // Fetch creation quality
    const results = await sql`
      SELECT 
        id, public_id, title, 
        metadata_quality, metadata_version,
        music_rights_status, full_music_rights_status
      FROM creations 
      WHERE id = ${Number(id)} OR public_id = ${id}
    `;

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Creation not found' },
        { status: 404 }
      );
    }

    const row = results[0];

    return NextResponse.json({
      success: true,
      creationId: row.id,
      publicId: row.public_id,
      title: row.title,
      metadataQuality: row.metadata_quality || {
        status: 'draft',
        history: [],
      },
      metadataVersion: row.metadata_version || 1,
      musicRightsStatus: row.music_rights_status || 'draft',
      fullMusicRightsStatus: row.full_music_rights_status || 'incomplete',
    });
  } catch (error) {
    console.error('GET /api/music-rights/[id]/quality error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
