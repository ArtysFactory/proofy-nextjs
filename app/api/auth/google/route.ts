import { NextRequest, NextResponse } from 'next/server';

// Google OAuth initialization - redirects to Google login
export async function GET(request: NextRequest) {
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
        
        if (!clientId) {
            return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
        }

        // Get locale from referer or default to 'fr'
        const referer = request.headers.get('referer') || '';
        const localeMatch = referer.match(/\/(fr|en|es)\//);
        const locale = localeMatch ? localeMatch[1] : 'fr';

        // Generate state with locale for redirect after auth
        const state = Buffer.from(JSON.stringify({ locale })).toString('base64');

        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.set('client_id', clientId);
        googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
        googleAuthUrl.searchParams.set('response_type', 'code');
        googleAuthUrl.searchParams.set('scope', 'openid email profile');
        googleAuthUrl.searchParams.set('access_type', 'offline');
        googleAuthUrl.searchParams.set('state', state);
        googleAuthUrl.searchParams.set('prompt', 'select_account');

        return NextResponse.redirect(googleAuthUrl.toString());
    } catch (error: any) {
        console.error('Google OAuth init error:', error);
        return NextResponse.json({ error: 'Failed to initialize Google OAuth' }, { status: 500 });
    }
}

export const runtime = 'edge';
