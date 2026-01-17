'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LocaleLink from '@/components/LocaleLink';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('auth.login');
    const tErrors = useTranslations('auth.errors');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        // Check for Google auth success from cookies
        const googleAuth = searchParams.get('google_auth');
        if (googleAuth === 'success') {
            // Read cookies and transfer to localStorage
            const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split('=');
                acc[key] = value;
                return acc;
            }, {} as Record<string, string>);
            
            if (cookies.proofy_token) {
                localStorage.setItem('token', cookies.proofy_token);
            }
            if (cookies.proofy_user) {
                try {
                    const user = JSON.parse(decodeURIComponent(cookies.proofy_user));
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (e) {
                    console.error('Failed to parse user cookie:', e);
                }
            }
            // Redirect to dashboard
            router.push(`/${locale}/dashboard`);
            return;
        }
        
        // Check for error from Google OAuth
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(t('googleAuthFailed'));
        }
        
        // Check for success message (password reset, account created)
        const message = searchParams.get('message');
        if (message === 'password-reset') {
            setSuccessMessage(t('passwordResetSuccess'));
        } else if (message === 'account-created') {
            setSuccessMessage(t('accountCreated'));
        }
        
        // Load saved email if "remember me" was used
        const savedEmail = localStorage.getItem('proofy_remembered_email');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, [searchParams, locale, router, t]);

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        // Redirect to Google OAuth endpoint
        window.location.href = '/api/auth/google';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || tErrors('invalidCredentials'));
            }

            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Handle "Remember Me"
            if (rememberMe) {
                localStorage.setItem('proofy_remembered_email', formData.email);
            } else {
                localStorage.removeItem('proofy_remembered_email');
            }

            // Redirect to dashboard with locale
            router.push(`/${locale}/dashboard`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="aurora-bg">
                    <div className="aurora-stars"></div>
                    <div className="aurora-layer"></div>
                    <div className="aurora-layer aurora-layer-2"></div>
                </div>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Aurora Background */}
            <div className="aurora-bg">
                <div className="aurora-stars"></div>
                <div className="aurora-layer"></div>
                <div className="aurora-layer aurora-layer-2"></div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key="login-form"
                    className="w-full max-w-md relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                {/* Logo */}
                <LocaleLink href="/" className="flex items-center justify-center gap-3 mb-8">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl rotate-6"></div>
                        <div className="absolute inset-0 bg-[#0b0124] rounded-xl flex items-center justify-center">
                            <i className="fas fa-shield-halved text-[#bff227] text-xl"></i>
                        </div>
                    </div>
                    <span className="font-display font-bold text-2xl bg-gradient-to-r from-[#bff227] to-white bg-clip-text text-transparent">
                        Proofy
                    </span>
                </LocaleLink>

                {/* Login Card */}
                <div className="glass-card rounded-3xl p-8">
                    <h1 className="font-display text-3xl font-bold text-white mb-2 text-center">
                        {t('title')}
                    </h1>
                    <p className="text-gray-400 text-center mb-8">
                        {t('subtitle')}
                    </p>

                    {/* Success Message */}
                    {successMessage && (
                        <motion.div
                            className="mb-6 p-4 glass-card border-green-500/30 text-green-400 rounded-xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <i className="fas fa-check-circle mr-2"></i>
                            {successMessage}
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            className="mb-6 p-4 glass-card border-red-500/30 text-red-400 rounded-xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {error}
                        </motion.div>
                    )}

                    {/* Google Login Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full mb-6 py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {googleLoading ? (
                            <div className="loader w-5 h-5 border-2 border-gray-400"></div>
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        )}
                        {t('googleLogin')}
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#0b0124] text-gray-400">{tCommon('or')}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                {t('email')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                {t('password')}
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[#bff227] focus:ring-[#bff227] focus:ring-offset-0 mr-2"
                                />
                                <span className="text-sm text-gray-400">{tCommon('rememberMe')}</span>
                            </label>
                            <LocaleLink href="/forgot-password" className="text-sm text-[#bff227] hover:underline">
                                {t('forgotPassword')}
                            </LocaleLink>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-aurora font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="loader w-5 h-5 border-2"></div>
                                    {tCommon('loading')}
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt"></i>
                                    {t('submit')}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            {t('noAccount')}{' '}
                            <LocaleLink href="/signup" className="text-[#bff227] hover:underline font-semibold">
                                {t('createAccount')}
                            </LocaleLink>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <LocaleLink href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                        <i className="fas fa-arrow-left mr-2"></i>
                        {tCommon('back')}
                    </LocaleLink>
                </div>
            </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="aurora-bg">
                    <div className="aurora-stars"></div>
                    <div className="aurora-layer"></div>
                    <div className="aurora-layer aurora-layer-2"></div>
                </div>
                <div className="loader"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
