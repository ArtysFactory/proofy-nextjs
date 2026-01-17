import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Generate a secure random token
async function generateResetToken(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Send password reset email (placeholder - integrate with your email service)
async function sendResetEmail(email: string, token: string, locale: string): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unlmtdproof.com';
    const resetLink = `${baseUrl}/${locale}/reset-password?token=${token}`;
    
    // TODO: Integrate with your email service (SendGrid, Resend, etc.)
    // For now, log the reset link (in production, send actual email)
    console.log(`Password reset link for ${email}: ${resetLink}`);
    
    // If you have an email service configured:
    const emailApiKey = process.env.EMAIL_API_KEY;
    const emailFromAddress = process.env.EMAIL_FROM || 'noreply@proofy.io';
    
    if (emailApiKey) {
        // Example with Resend API
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${emailApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: emailFromAddress,
                    to: email,
                    subject: locale === 'fr' ? 'Réinitialisation de votre mot de passe Proofy' :
                             locale === 'es' ? 'Restablecer su contraseña de Proofy' :
                             'Reset your Proofy password',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #7C3AED;">${
                                locale === 'fr' ? 'Réinitialisation de mot de passe' :
                                locale === 'es' ? 'Restablecer contraseña' :
                                'Password Reset'
                            }</h2>
                            <p>${
                                locale === 'fr' ? 'Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :' :
                                locale === 'es' ? 'Ha solicitado restablecer su contraseña. Haga clic en el enlace a continuación:' :
                                'You requested to reset your password. Click the link below:'
                            }</p>
                            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                                ${
                                    locale === 'fr' ? 'Réinitialiser mon mot de passe' :
                                    locale === 'es' ? 'Restablecer mi contraseña' :
                                    'Reset my password'
                                }
                            </a>
                            <p style="color: #666; font-size: 14px;">${
                                locale === 'fr' ? 'Ce lien expire dans 1 heure.' :
                                locale === 'es' ? 'Este enlace expira en 1 hora.' :
                                'This link expires in 1 hour.'
                            }</p>
                            <p style="color: #666; font-size: 14px;">${
                                locale === 'fr' ? 'Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email.' :
                                locale === 'es' ? 'Si no solicitó este restablecimiento, ignore este correo.' :
                                'If you didn\'t request this reset, ignore this email.'
                            }</p>
                        </div>
                    `,
                }),
            });
            
            return response.ok;
        } catch (error) {
            console.error('Email send error:', error);
            return false;
        }
    }
    
    // Return true even without email service for development
    return true;
}

export async function POST(request: NextRequest) {
    try {
        const { email, locale = 'fr' } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
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

        // Check if user exists
        const users = await sql`
            SELECT id, email, first_name FROM users WHERE email = ${email.toLowerCase()}
        `;

        // Always return success to prevent email enumeration
        if (users.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Si cette adresse existe, vous recevrez un email.'
            });
        }

        const user = users[0];

        // Generate reset token
        const resetToken = await generateResetToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store reset token in database
        await sql`
            UPDATE users 
            SET reset_token = ${resetToken}, 
                reset_token_expires = ${expiresAt.toISOString()},
                updated_at = NOW()
            WHERE id = ${user.id}
        `;

        // Send reset email
        await sendResetEmail(user.email, resetToken, locale);

        return NextResponse.json({
            success: true,
            message: 'Si cette adresse existe, vous recevrez un email.'
        });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Une erreur est survenue' },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';
