import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token et mot de passe requis' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            );
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json(
                { error: 'Erreur de configuration' },
                { status: 500 }
            );
        }

        const sql = neon(databaseUrl);

        // Find user with valid reset token
        const users = await sql`
            SELECT id, email, reset_token_expires 
            FROM users 
            WHERE reset_token = ${token}
        `;

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'Lien invalide ou expiré' },
                { status: 400 }
            );
        }

        const user = users[0];

        // Check if token has expired
        if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
            return NextResponse.json(
                { error: 'Ce lien a expiré. Veuillez en demander un nouveau.' },
                { status: 400 }
            );
        }

        // Hash new password
        const passwordHash = await hashPassword(password);

        // Update password and clear reset token
        await sql`
            UPDATE users 
            SET password_hash = ${passwordHash}, 
                reset_token = NULL, 
                reset_token_expires = NULL,
                updated_at = NOW()
            WHERE id = ${user.id}
        `;

        return NextResponse.json({
            success: true,
            message: 'Mot de passe réinitialisé avec succès'
        });
    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Une erreur est survenue' },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';
