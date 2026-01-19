import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';

// ============================================
// PROOFY - Co-signature Invitations API
// ============================================

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

// Generate secure token for invitation link
function generateInvitationToken(): string {
    return randomBytes(32).toString('hex'); // 64 chars
}

// GET /api/invitations - List invitations for a creation or user
export async function GET(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);
        const { searchParams } = new URL(request.url);
        const creationId = searchParams.get('creationId');
        const draftId = searchParams.get('draftId');
        const type = searchParams.get('type'); // 'sent' or 'received'

        if (type === 'received') {
            // Get invitations received by this user (by email)
            const user = await sql`SELECT email FROM users WHERE id = ${payload.userId}`;
            if (!user[0]) {
                return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
            }

            const invitations = await sql`
                SELECT 
                    di.*,
                    c.title as creation_title,
                    c.project_type,
                    c.file_hash,
                    u.first_name as inviter_first_name,
                    u.last_name as inviter_last_name,
                    u.email as inviter_email
                FROM deposit_invitations di
                LEFT JOIN creations c ON di.creation_id = c.id
                LEFT JOIN users u ON di.inviter_id = u.id
                WHERE di.invitee_email = ${user[0].email}
                ORDER BY di.created_at DESC
            `;

            return NextResponse.json({ invitations });
        }

        if (creationId) {
            // Get invitations for a specific creation
            const invitations = await sql`
                SELECT 
                    di.*,
                    u.first_name as invitee_first_name,
                    u.last_name as invitee_last_name
                FROM deposit_invitations di
                LEFT JOIN users u ON di.invitee_user_id = u.id
                WHERE di.creation_id = ${creationId}
                AND di.inviter_id = ${payload.userId}
                ORDER BY di.created_at ASC
            `;

            return NextResponse.json({ invitations });
        }

        if (draftId) {
            // Get invitations for a draft (pre-creation)
            const invitations = await sql`
                SELECT * FROM deposit_invitations
                WHERE draft_id = ${draftId}
                AND inviter_id = ${payload.userId}
                ORDER BY created_at ASC
            `;

            return NextResponse.json({ invitations });
        }

        // Get all invitations sent by this user
        const invitations = await sql`
            SELECT 
                di.*,
                c.title as creation_title,
                c.project_type,
                c.status as creation_status
            FROM deposit_invitations di
            LEFT JOIN creations c ON di.creation_id = c.id
            WHERE di.inviter_id = ${payload.userId}
            ORDER BY di.created_at DESC
            LIMIT 100
        `;

        return NextResponse.json({ invitations });
    } catch (error: any) {
        console.error('Get invitations error:', error);
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
    }
}

// POST /api/invitations - Create new invitations for co-signers
export async function POST(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const { creationId, draftId, invitations } = body;

        if (!invitations || !Array.isArray(invitations) || invitations.length === 0) {
            return NextResponse.json(
                { error: 'Au moins une invitation requise' },
                { status: 400 }
            );
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // Check user credits
        const credits = await sql`
            SELECT available_credits FROM user_credits WHERE user_id = ${payload.userId}
        `;
        
        const availableCredits = credits[0]?.available_credits || 0;
        const requiredCredits = invitations.length;

        if (availableCredits < requiredCredits) {
            return NextResponse.json(
                { 
                    error: 'Crédits insuffisants',
                    required: requiredCredits,
                    available: availableCredits,
                    message: `Vous avez besoin de ${requiredCredits} crédit(s) pour ${invitations.length} co-signataire(s). Crédits disponibles: ${availableCredits}`
                },
                { status: 402 }
            );
        }

        // Calculate expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const createdInvitations = [];

        for (const inv of invitations) {
            if (!inv.email || !inv.roleType || inv.percentage === undefined) {
                continue; // Skip invalid invitations
            }

            const token = generateInvitationToken();

            const result = await sql`
                INSERT INTO deposit_invitations (
                    creation_id,
                    draft_id,
                    inviter_id,
                    invitee_email,
                    role_type,
                    role_label,
                    percentage,
                    token,
                    status,
                    expires_at,
                    created_at
                )
                VALUES (
                    ${creationId || null},
                    ${draftId || null},
                    ${payload.userId},
                    ${inv.email.toLowerCase().trim()},
                    ${inv.roleType},
                    ${inv.roleLabel || null},
                    ${inv.percentage},
                    ${token},
                    'pending',
                    ${expiresAt.toISOString()},
                    NOW()
                )
                RETURNING id, token, invitee_email, role_type, percentage, expires_at
            `;

            if (result[0]) {
                // Log the creation in signature_history
                await sql`
                    INSERT INTO signature_history (
                        invitation_id,
                        action,
                        actor_user_id,
                        metadata,
                        created_at
                    )
                    VALUES (
                        ${result[0].id},
                        'created',
                        ${payload.userId},
                        ${JSON.stringify({ email: inv.email, roleType: inv.roleType, percentage: inv.percentage })},
                        NOW()
                    )
                `;

                createdInvitations.push({
                    ...result[0],
                    signUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://unlmtdproof.com'}/sign/${token}`
                });
            }
        }

        // Deduct credits
        if (createdInvitations.length > 0) {
            await sql`
                UPDATE user_credits 
                SET used_credits = used_credits + ${createdInvitations.length},
                    updated_at = NOW()
                WHERE user_id = ${payload.userId}
            `;

            // Log credit transaction
            const creditsAfter = availableCredits - createdInvitations.length;
            await sql`
                INSERT INTO credit_transactions (
                    user_id,
                    transaction_type,
                    credits_change,
                    credits_after,
                    reference_type,
                    reference_id,
                    description,
                    created_at
                )
                VALUES (
                    ${payload.userId},
                    'cosigner',
                    ${-createdInvitations.length},
                    ${creditsAfter},
                    'creation',
                    ${creationId || null},
                    ${'Co-signature: ' + createdInvitations.length + ' invitation(s)'},
                    NOW()
                )
            `;

            // Update creation with co-signature info if creationId provided
            if (creationId) {
                await sql`
                    UPDATE creations 
                    SET cosignature_required = TRUE,
                        cosignature_status = 'pending_signatures',
                        cosignature_count = ${createdInvitations.length},
                        cosignature_signed_count = 0,
                        cosignature_expires_at = ${expiresAt.toISOString()},
                        cosignature_credits_charged = ${createdInvitations.length},
                        updated_at = NOW()
                    WHERE id = ${creationId}
                `;
            }
        }

        return NextResponse.json({
            success: true,
            invitations: createdInvitations,
            creditsUsed: createdInvitations.length,
            creditsRemaining: availableCredits - createdInvitations.length,
            expiresAt: expiresAt.toISOString(),
            message: `${createdInvitations.length} invitation(s) créée(s). Les co-signataires ont 7 jours pour valider.`
        }, { status: 201 });

    } catch (error: any) {
        console.error('Create invitations error:', error);
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
    }
}

// DELETE /api/invitations - Cancel an invitation
export async function DELETE(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const invitationId = searchParams.get('id');

        if (!invitationId) {
            return NextResponse.json({ error: 'ID invitation requis' }, { status: 400 });
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // Check ownership and status
        const invitation = await sql`
            SELECT * FROM deposit_invitations
            WHERE id = ${invitationId}
            AND inviter_id = ${payload.userId}
        `;

        if (!invitation[0]) {
            return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 });
        }

        if (invitation[0].status === 'accepted') {
            return NextResponse.json(
                { error: 'Impossible d\'annuler une invitation déjà acceptée' },
                { status: 400 }
            );
        }

        // Update status to cancelled
        await sql`
            UPDATE deposit_invitations
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = ${invitationId}
        `;

        // Log the cancellation
        await sql`
            INSERT INTO signature_history (
                invitation_id,
                action,
                actor_user_id,
                created_at
            )
            VALUES (
                ${invitationId},
                'cancelled',
                ${payload.userId},
                NOW()
            )
        `;

        // Refund the credit
        await sql`
            UPDATE user_credits 
            SET used_credits = used_credits - 1,
                updated_at = NOW()
            WHERE user_id = ${payload.userId}
        `;

        // Log credit refund
        await sql`
            INSERT INTO credit_transactions (
                user_id,
                transaction_type,
                credits_change,
                credits_after,
                reference_type,
                reference_id,
                description,
                created_at
            )
            VALUES (
                ${payload.userId},
                'refund',
                1,
                (SELECT available_credits FROM user_credits WHERE user_id = ${payload.userId}),
                'invitation',
                ${invitationId},
                'Remboursement: invitation annulée',
                NOW()
            )
        `;

        return NextResponse.json({
            success: true,
            message: 'Invitation annulée. Crédit remboursé.'
        });

    } catch (error: any) {
        console.error('Delete invitation error:', error);
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
    }
}

export const runtime = 'edge';
