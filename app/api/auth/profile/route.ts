import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';

// Get user profile
export async function GET(request: NextRequest) {
    try {
        // Get authorization token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';
        const secret = new TextEncoder().encode(jwtSecret);

        // Verify JWT
        let payload;
        try {
            const verified = await jwtVerify(token, secret);
            payload = verified.payload;
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = payload.userId as number;

        // Connect to database
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // Get user data
        const users = await sql`
            SELECT id, first_name, last_name, email, country, email_verified, google_id, created_at
            FROM users
            WHERE id = ${userId}
        `;

        if (users.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = users[0];

        return NextResponse.json({
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                country: user.country,
                emailVerified: user.email_verified,
                googleId: user.google_id ? true : false, // Don't expose actual Google ID
                createdAt: user.created_at,
            },
        });
    } catch (error: any) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Update user profile
export async function PUT(request: NextRequest) {
    try {
        // Get authorization token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';
        const secret = new TextEncoder().encode(jwtSecret);

        // Verify JWT
        let payload;
        try {
            const verified = await jwtVerify(token, secret);
            payload = verified.payload;
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = payload.userId as number;
        const body = await request.json();
        const { firstName, lastName, email, country } = body;

        // Validate required fields
        if (!firstName || !lastName || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Connect to database
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // Check if email is already used by another user
        const existingUsers = await sql`
            SELECT id FROM users WHERE email = ${email.toLowerCase()} AND id != ${userId}
        `;

        if (existingUsers.length > 0) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }

        // Update user
        const updatedUsers = await sql`
            UPDATE users
            SET 
                first_name = ${firstName},
                last_name = ${lastName},
                email = ${email.toLowerCase()},
                country = ${country || 'FR'},
                updated_at = NOW()
            WHERE id = ${userId}
            RETURNING id, first_name, last_name, email, country, email_verified, google_id, created_at
        `;

        if (updatedUsers.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = updatedUsers[0];

        return NextResponse.json({
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                country: user.country,
                emailVerified: user.email_verified,
                googleId: user.google_id ? true : false,
                createdAt: user.created_at,
            },
        });
    } catch (error: any) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const runtime = 'edge';
