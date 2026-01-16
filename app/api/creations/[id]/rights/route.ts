// ============================================
// PROOFY V3 - API: Update Rights
// PUT /api/creations/[id]/rights
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  email: string;
}

// GET - Récupérer les droits d'une création
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const publicId = params.id;

    // Get creation with rights
    const result = await query(
      `SELECT id, "publicId", title, 
              "copyrightRights", "neighboringRights",
              "musicWork", "musicParties"
       FROM creations 
       WHERE "publicId" = $1`,
      [publicId]
    );

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
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return NextResponse.json({ error: 'Configuration serveur invalide' }, { status: 500 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const publicId = params.id;
    const body = await request.json();
    const { copyrightRights, neighboringRights } = body;

    // Verify the creation exists and belongs to the user
    const existingResult = await query(
      `SELECT id, "userId" FROM creations WHERE "publicId" = $1`,
      [publicId]
    );

    if (existingResult.length === 0) {
      return NextResponse.json({ error: 'Création introuvable' }, { status: 404 });
    }

    const creation = existingResult[0];

    // Check ownership
    if (creation.userId !== decoded.userId) {
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
    await query(
      `UPDATE creations 
       SET "copyrightRights" = $1,
           "neighboringRights" = $2,
           "updatedAt" = NOW()
       WHERE "publicId" = $3`,
      [
        JSON.stringify(copyrightRights),
        JSON.stringify(neighboringRights),
        publicId,
      ]
    );

    // Log the change in audit
    await query(
      `INSERT INTO metadata_audit_log (creation_id, changed_by, change_type, new_value, change_summary)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        creation.id,
        decoded.email,
        'rights_update',
        JSON.stringify({ copyrightRights, neighboringRights }),
        'Mise à jour des droits d\'auteur et droits voisins',
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Droits mis à jour avec succès',
    });
  } catch (error: any) {
    console.error('Error updating rights:', error);
    return NextResponse.json({ error: 'Erreur serveur: ' + error.message }, { status: 500 });
  }
}
