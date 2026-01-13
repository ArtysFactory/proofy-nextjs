import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// Helper to hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, country, email, password } = body;

        // Validation
        if (!firstName || !lastName || !country || !email || !password) {
            return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
        }

        const db = getDB();

        // Check if email already exists
        const existingUser = await db
            .prepare('SELECT id FROM users WHERE email = ?')
            .bind(email.toLowerCase())
            .first();

        if (existingUser) {
            return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const result = await db
            .prepare(`
        INSERT INTO users (firstName, lastName, country, email, passwordHash, emailVerified, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `)
            .bind(
                firstName.trim(),
                lastName.trim(),
                country,
                email.toLowerCase().trim(),
                passwordHash
            )
            .run();

        return NextResponse.json(
            {
                success: true,
                message: 'Compte créé avec succès',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: "Erreur lors de l'inscription", details: error.message },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';
