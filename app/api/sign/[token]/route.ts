import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

// ============================================
// PROOFY - Sign Invitation API
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

// GET /api/sign/[token] - Get invitation details (public, no auth required)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        if (!token || token.length !== 64) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // Get invitation with creation and inviter details
        const invitation = await sql`
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
                c.id as creation_id,
                c.title as creation_title,
                c.project_type,
                c.file_hash,
                c.made_by,
                c.created_at as creation_date,
                u.first_name as inviter_first_name,
                u.last_name as inviter_last_name,
                u.email as inviter_email
            FROM deposit_invitations di
            LEFT JOIN creations c ON di.creation_id = c.id
            LEFT JOIN users u ON di.inviter_id = u.id
            WHERE di.token = ${token}
        `;

        if (!invitation[0]) {
            return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 });
        }

        const inv = invitation[0];

        // Check if expired
        const now = new Date();
        const expiresAt = new Date(inv.expires_at);
        const isExpired = now > expiresAt;

        if (isExpired && inv.status === 'pending') {
            // Auto-update status to expired
            await sql`
                UPDATE deposit_invitations
                SET status = 'expired'
                WHERE token = ${token}
            `;
            inv.status = 'expired';
        }

        // Mark as viewed if first time
        if (!inv.viewed_at && inv.status === 'pending') {
            await sql`
                UPDATE deposit_invitations
                SET viewed_at = NOW()
                WHERE token = ${token}
            `;

            // Log the view
            await sql`
                INSERT INTO signature_history (
                    invitation_id,
                    action,
                    ip_address,
                    user_agent,
                    created_at
                )
                VALUES (
                    ${inv.id},
                    'viewed',
                    ${request.headers.get('x-forwarded-for') || 'unknown'},
                    ${request.headers.get('user-agent') || 'unknown'},
                    NOW()
                )
            `;
        }

        // Calculate time remaining
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));

        return NextResponse.json({
            invitation: {
                id: inv.id,
                email: inv.invitee_email,
                roleType: inv.role_type,
                roleLabel: inv.role_label,
                percentage: inv.percentage,
                status: inv.status,
                createdAt: inv.created_at,
                expiresAt: inv.expires_at,
                daysRemaining,
                isExpired,
                rejectionReason: inv.rejection_reason,
            },
            creation: inv.creation_id ? {
                id: inv.creation_id,
                title: inv.creation_title,
                projectType: inv.project_type,
                fileHash: inv.file_hash,
                madeBy: inv.made_by,
                createdAt: inv.creation_date,
            } : null,
            inviter: {
                name: `${inv.inviter_first_name} ${inv.inviter_last_name}`,
                email: inv.inviter_email,
            },
            requiresAccount: true, // User must create account to sign
        });

    } catch (error: any) {
        console.error('Get invitation error:', error);
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
    }
}

// POST /api/sign/[token] - Accept or reject invitation (requires auth)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        
        // User must be authenticated to sign
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json(
                { error: 'Vous devez créer un compte ou vous connecter pour signer', requiresAuth: true },
                { status: 401 }
            );
        }

        if (!token || token.length !== 64) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
        }

        const body = await request.json();
        const { action, rejectionReason } = body; // action: 'accept' or 'reject'

        if (!action || !['accept', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Action invalide (accept/reject)' }, { status: 400 });
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // Get invitation
        const invitation = await sql`
            SELECT * FROM deposit_invitations
            WHERE token = ${token}
        `;

        if (!invitation[0]) {
            return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 });
        }

        const inv = invitation[0];

        // Check status
        if (inv.status !== 'pending' && inv.status !== 'viewed') {
            return NextResponse.json(
                { error: `Cette invitation a déjà été ${inv.status === 'accepted' ? 'acceptée' : inv.status === 'rejected' ? 'refusée' : 'traitée'}` },
                { status: 400 }
            );
        }

        // Check expiration
        const now = new Date();
        const expiresAt = new Date(inv.expires_at);
        if (now > expiresAt) {
            await sql`UPDATE deposit_invitations SET status = 'expired' WHERE token = ${token}`;
            return NextResponse.json({ error: 'Cette invitation a expiré' }, { status: 400 });
        }

        // Verify email matches
        const user = await sql`SELECT email FROM users WHERE id = ${payload.userId}`;
        if (!user[0] || user[0].email.toLowerCase() !== inv.invitee_email.toLowerCase()) {
            return NextResponse.json(
                { error: 'Cette invitation n\'est pas destinée à votre compte. Connectez-vous avec l\'email: ' + inv.invitee_email },
                { status: 403 }
            );
        }

        const newStatus = action === 'accept' ? 'accepted' : 'rejected';

        // Update invitation
        await sql`
            UPDATE deposit_invitations
            SET 
                status = ${newStatus},
                invitee_user_id = ${payload.userId},
                signed_at = NOW(),
                rejection_reason = ${action === 'reject' ? rejectionReason : null}
            WHERE token = ${token}
        `;

        // Log the action
        await sql`
            INSERT INTO signature_history (
                invitation_id,
                action,
                actor_user_id,
                actor_email,
                ip_address,
                user_agent,
                metadata,
                created_at
            )
            VALUES (
                ${inv.id},
                ${newStatus},
                ${payload.userId},
                ${user[0].email},
                ${request.headers.get('x-forwarded-for') || 'unknown'},
                ${request.headers.get('user-agent') || 'unknown'},
                ${action === 'reject' ? JSON.stringify({ reason: rejectionReason }) : null},
                NOW()
            )
        `;

        // Update creation signature count if accepted
        if (inv.creation_id) {
            if (action === 'accept') {
                const updated = await sql`
                    UPDATE creations
                    SET cosignature_signed_count = cosignature_signed_count + 1,
                        cosignature_status = CASE 
                            WHEN cosignature_signed_count + 1 >= cosignature_count THEN 'all_signed'
                            ELSE 'partially_signed'
                        END,
                        updated_at = NOW()
                    WHERE id = ${inv.creation_id}
                    RETURNING cosignature_count, cosignature_signed_count, cosignature_status
                `;

                // Check if all signed - then proceed with blockchain anchoring
                if (updated[0]?.cosignature_status === 'all_signed') {
                    // TODO: Trigger blockchain anchoring
                    console.log(`[Co-signature] All parties signed for creation ${inv.creation_id}. Ready for blockchain.`);
                }
            } else {
                // Rejection - mark creation as rejected
                await sql`
                    UPDATE creations
                    SET cosignature_status = 'rejected',
                        updated_at = NOW()
                    WHERE id = ${inv.creation_id}
                `;
            }
        }

        return NextResponse.json({
            success: true,
            action: newStatus,
            message: action === 'accept' 
                ? 'Vous avez accepté l\'invitation. Merci pour votre signature !'
                : 'Vous avez refusé l\'invitation. L\'initiateur sera notifié.',
        });

    } catch (error: any) {
        console.error('Sign invitation error:', error);
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
    }
}

export const runtime = 'edge';
