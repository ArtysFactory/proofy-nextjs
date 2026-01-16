// ============================================
// PROOFY V3 - API: Update Rights
// PUT /api/creations/[id]/rights
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

// Verify JWT token using jose (Edge-compatible)
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
    return payload as { userId: number; email: string };
  } catch (error) {
    return null;
  }
}

// GET - Récupérer les droits d'une création
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: publicId } = await params;
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const sql = neon(databaseUrl);

    // Get creation with rights
    const result = await sql`
      SELECT 
        id, 
        public_id as "publicId", 
        title,
        copyright_rights as "copyrightRights", 
        neighboring_rights as "neighboringRights"
      FROM creations 
      WHERE public_id = ${publicId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Création introuvable' }, { status: 404 });
    }

    const creation = result[0];

    return NextResponse.json({
      success: true,
      rights: {
        copyrightRights: creation.copyrightRights || null,
        neighboringRights: creation.neighboringRights || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching rights:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour les droits
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const payload = await verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: publicId } = await params;
    const body = await request.json();
    const { copyrightRights, neighboringRights } = body;

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const sql = neon(databaseUrl);

    // Verify the creation exists and belongs to the user
    const existingResult = await sql`
      SELECT id, user_id as "userId" 
      FROM creations 
      WHERE public_id = ${publicId}
    `;

    if (existingResult.length === 0) {
      return NextResponse.json({ error: 'Création introuvable' }, { status: 404 });
    }

    const creation = existingResult[0];

    // Check ownership
    if (creation.userId !== payload.userId) {
      return NextResponse.json({ error: 'Non autorisé à modifier cette création' }, { status: 403 });
    }

    // Validate copyright rights total = 100%
    if (copyrightRights) {
      const copyrightTotal =
        (copyrightRights.authors || []).reduce((sum: number, h: any) => sum + (h.percentage || 0), 0) +
        (copyrightRights.composers || []).reduce((sum: number, h: any) => sum + (h.percentage || 0), 0) +
        (copyrightRights.publishers || []).reduce((sum: number, h: any) => sum + (h.percentage || 0), 0);

      if (copyrightTotal !== 100) {
        return NextResponse.json(
          { error: `Le total des droits d'auteur doit être égal à 100% (actuellement ${copyrightTotal}%)` },
          { status: 400 }
        );
      }
    }

    // Validate neighboring rights total = 100% (if enabled)
    if (neighboringRights?.enabled) {
      const neighboringTotal =
        (neighboringRights.producers || []).reduce((sum: number, h: any) => sum + (h.percentage || 0), 0) +
        (neighboringRights.performers || []).reduce((sum: number, h: any) => sum + (h.percentage || 0), 0) +
        (neighboringRights.labels || []).reduce((sum: number, h: any) => sum + (h.percentage || 0), 0) +
        (neighboringRights.others || []).reduce((sum: number, h: any) => sum + (h.percentage || 0), 0);

      if (neighboringTotal !== 100) {
        return NextResponse.json(
          { error: `Le total des droits voisins doit être égal à 100% (actuellement ${neighboringTotal}%)` },
          { status: 400 }
        );
      }
    }

    // Update the creation with new rights
    await sql`
      UPDATE creations 
      SET 
        copyright_rights = ${JSON.stringify(copyrightRights)},
        neighboring_rights = ${JSON.stringify(neighboringRights)},
        updated_at = NOW()
      WHERE public_id = ${publicId}
    `;

    // Log the change in audit
    await sql`
      INSERT INTO metadata_audit_log (creation_id, changed_by, change_type, new_value, change_summary)
      VALUES (
        ${creation.id}, 
        ${payload.email}, 
        'rights_update', 
        ${JSON.stringify({ copyrightRights, neighboringRights })}, 
        'Mise à jour des droits d''auteur et droits voisins'
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Droits mis à jour avec succès',
    });
  } catch (error: any) {
    console.error('Error updating rights:', error);
    return NextResponse.json({ error: 'Erreur serveur: ' + error.message }, { status: 500 });
  }
}
