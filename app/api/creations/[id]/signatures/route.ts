// ============================================
// PROOFY V3 - Get Signatures Status for a Creation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';

async function verifyToken(token: string): Promise<{ userId: number; email: string } | null> {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        return {
            userId: payload.userId as number,
            email: payload.email as string,
        };
    } catch {
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        const creationId = params.id;
        if (!creationId) {
            return NextResponse.json({ error: 'ID de création requis' }, { status: 400 });
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database non configurée' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // First, verify the user owns this creation or is a co-signer
        const creationCheck = await sql`
            SELECT c.id, c.user_id, c.title, c.status, c.cosignature_required,
                   c.cosignature_count, c.cosignature_signed_count, c.cosignature_expires_at
            FROM creations c
            WHERE c.public_id = ${creationId}
            AND (c.user_id = ${user.userId} OR EXISTS (
                SELECT 1 FROM deposit_invitations di 
                WHERE di.creation_id = c.id 
                AND di.invitee_email = ${user.email}
            ))
        `;

        if (creationCheck.length === 0) {
            return NextResponse.json({ error: 'Création non trouvée' }, { status: 404 });
        }

        const creation = creationCheck[0];

        // Get all invitations for this creation
        const invitations = await sql`
            SELECT 
                di.id,
                di.invitee_email,
                di.role_type,
                di.role_label,
                di.percentage,
                di.status,
                di.created_at,
                di.viewed_at,
                di.signed_at,
                di.expires_at,
                di.rejection_reason,
                u.first_name,
                u.last_name
            FROM deposit_invitations di
            LEFT JOIN users u ON di.invitee_user_id = u.id
            WHERE di.creation_id = ${creation.id}
            ORDER BY di.created_at ASC
        `;

        // Calculate time remaining
        const expiresAt = creation.cosignature_expires_at ? new Date(creation.cosignature_expires_at) : null;
        const now = new Date();
        const timeRemaining = expiresAt ? Math.max(0, expiresAt.getTime() - now.getTime()) : null;
        const daysRemaining = timeRemaining ? Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)) : null;

        // Calculate stats
        const stats = {
            total: invitations.length,
            pending: invitations.filter((i: any) => i.status === 'pending').length,
            viewed: invitations.filter((i: any) => i.status === 'viewed').length,
            accepted: invitations.filter((i: any) => i.status === 'accepted').length,
            rejected: invitations.filter((i: any) => i.status === 'rejected').length,
            expired: invitations.filter((i: any) => i.status === 'expired').length,
        };

        // Format invitations for response
        const formattedInvitations = invitations.map((inv: any) => ({
            id: inv.id,
            email: inv.invitee_email,
            name: inv.first_name && inv.last_name 
                ? `${inv.first_name} ${inv.last_name}` 
                : inv.invitee_email.split('@')[0],
            role: inv.role_label || inv.role_type,
            percentage: inv.percentage,
            status: inv.status,
            createdAt: inv.created_at,
            viewedAt: inv.viewed_at,
            signedAt: inv.signed_at,
            expiresAt: inv.expires_at,
            rejectionReason: inv.rejection_reason,
        }));

        return NextResponse.json({
            success: true,
            creation: {
                id: creation.id,
                title: creation.title,
                status: creation.status,
                cosignatureRequired: creation.cosignature_required,
                cosignatureCount: creation.cosignature_count,
                cosignatureSignedCount: creation.cosignature_signed_count,
                expiresAt: creation.cosignature_expires_at,
                daysRemaining,
            },
            invitations: formattedInvitations,
            stats,
        });
    } catch (error: any) {
        console.error('[Signatures API] Error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error.message },
            { status: 500 }
        );
    }
}
