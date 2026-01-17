import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { SignJWT } from 'jose';

// Google OAuth callback - exchanges code for tokens and creates/logs in user
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Parse state to get locale
        let locale = 'fr';
        if (state) {
            try {
                const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
                locale = stateData.locale || 'fr';
            } catch (e) {
                console.error('Failed to parse state:', e);
            }
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unlmtdproof.com';

        // Handle OAuth errors
        if (error) {
            console.error('Google OAuth error:', error);
            return NextResponse.redirect(`${baseUrl}/${locale}/login?error=google_auth_failed`);
        }

        if (!code) {
            return NextResponse.redirect(`${baseUrl}/${locale}/login?error=no_code`);
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

        if (!clientId || !clientSecret) {
            return NextResponse.redirect(`${baseUrl}/${locale}/login?error=oauth_not_configured`);
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            return NextResponse.redirect(`${baseUrl}/${locale}/login?error=token_exchange_failed`);
        }

        const tokens = await tokenResponse.json();

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userInfoResponse.ok) {
            return NextResponse.redirect(`${baseUrl}/${locale}/login?error=user_info_failed`);
        }

        const googleUser = await userInfoResponse.json();

        // Connect to database
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.redirect(`${baseUrl}/${locale}/login?error=db_error`);
        }

        const sql = neon(databaseUrl);

        // Check if user exists with this Google ID or email
        const existingUsers = await sql`
            SELECT id, email, first_name, last_name, google_id 
            FROM users 
            WHERE google_id = ${googleUser.id} OR email = ${googleUser.email.toLowerCase()}
        `;

        let user;

        if (existingUsers.length > 0) {
            user = existingUsers[0];
            
            // Update Google ID if user exists but signed up with email
            if (!user.google_id) {
                await sql`
                    UPDATE users 
                    SET google_id = ${googleUser.id}, 
                        email_verified = true,
                        updated_at = NOW()
                    WHERE id = ${user.id}
                `;
            }
        } else {
            // Create new user
            const newUsers = await sql`
                INSERT INTO users (
                    first_name, 
                    last_name, 
                    email, 
                    google_id, 
                    email_verified,
                    country,
                    created_at, 
                    updated_at
                ) VALUES (
                    ${googleUser.given_name || 'User'},
                    ${googleUser.family_name || ''},
                    ${googleUser.email.toLowerCase()},
                    ${googleUser.id},
                    true,
                    'FR',
                    NOW(),
                    NOW()
                )
                RETURNING id, email, first_name, last_name
            `;
            user = newUsers[0];
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';
        const secret = new TextEncoder().encode(jwtSecret);

        const token = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .setIssuedAt()
            .sign(secret);

        // Create response with redirect to dashboard
        const response = NextResponse.redirect(`${baseUrl}/${locale}/dashboard?google_auth=success`);

        // Set cookies for token and user data
        const cookieOptions = {
            httpOnly: false, // Allow JS access for our client-side auth
            secure: true,
            sameSite: 'lax' as const,
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        };

        response.cookies.set('proofy_token', token, cookieOptions);
        response.cookies.set('proofy_user', JSON.stringify({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
        }), cookieOptions);

        return response;
    } catch (error: any) {
        console.error('Google OAuth callback error:', error);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unlmtdproof.com';
        return NextResponse.redirect(`${baseUrl}/fr/login?error=callback_error`);
    }
}

export const runtime = 'edge';
