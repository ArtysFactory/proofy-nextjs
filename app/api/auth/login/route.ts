import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getDB } from '@/lib/db';

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

        const db = getDB();

        // Find user
        const user = (await db
            .prepare('SELECT id, firstName, lastName, email, passwordHash FROM users WHERE email = ?')
            .bind(email.toLowerCase().trim())
            .first()) as any;

        if (!user) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
        }

        // Verify password
        const passwordHash = await hashPassword(password);
        if (passwordHash !== user.passwordHash) {
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
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
    }
}

export const runtime = 'edge';
