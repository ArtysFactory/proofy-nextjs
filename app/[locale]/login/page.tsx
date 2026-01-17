'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LocaleLink from '@/components/LocaleLink';

export default function LoginPage() {
    const router = useRouter();
    const t = useTranslations('auth.login');
    const tErrors = useTranslations('auth.errors');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
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
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                <span className="text-sm text-gray-400">Se souvenir de moi</span>
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
