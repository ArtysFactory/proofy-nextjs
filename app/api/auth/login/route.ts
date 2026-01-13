import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { neon } from '@neondatabase/serverless';

// Helper to hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Helper to generate JWT
async function generateToken(userId: number, email: string, secret: string): Promise<string> {
    const secretKey = new TextEncoder().encode(secret);

    const token = await new SignJWT({ userId, email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey);

    return token;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // Find user using tagged template
        const users = await sql`
            SELECT id, first_name, last_name, email, password_hash 
            FROM users 
            WHERE email = ${email.toLowerCase().trim()}
        `;

        if (users.length === 0) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
        }

        const user = users[0] as any;

        // Verify password
        const passwordHash = await hashPassword(password);
        if (passwordHash !== user.password_hash) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
        }

        // Generate JWT (get secret from environment)
        const jwtSecret = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';
        const token = await generateToken(user.id, user.email, jwtSecret);

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Erreur lors de la connexion', details: error.message }, { status: 500 });
    }
}

export const runtime = 'edge';
