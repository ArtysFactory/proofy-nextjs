import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getDB } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ valid: false }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const jwtSecret = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';
        const secretKey = new TextEncoder().encode(jwtSecret);

        const { payload } = await jwtVerify(token, secretKey);

        const db = getDB();
        const user = await db
            .prepare('SELECT id, firstName, lastName, email FROM users WHERE id = ?')
            .bind(payload.userId)
            .first();

        if (!user) {
            return NextResponse.json({ valid: false }, { status: 401 });
        }

        return NextResponse.json({ valid: true, user });
    } catch (error) {
        return NextResponse.json({ valid: false }, { status: 401 });
    }
}

export const runtime = 'edge';
