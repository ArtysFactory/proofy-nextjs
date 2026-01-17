'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LocaleLink from '@/components/LocaleLink';

export default function SignupPage() {
    const router = useRouter();
    const t = useTranslations('auth.signup');
    const tErrors = useTranslations('auth.errors');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        country: 'FR',
        email: '',
        password: '',
        confirmPassword: '',
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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError(tErrors('passwordMismatch'));
            return;
        }

        if (formData.password.length < 8) {
            setError(tErrors('weakPassword'));
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    country: formData.country,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const signupData = await response.json();

            if (!response.ok) {
                throw new Error(signupData.error || tErrors('emailExists'));
            }

            // Auto-login after successful signup
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok && loginData.token) {
                // Store token and user in localStorage
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('user', JSON.stringify(loginData.user));
                
                // Redirect to dashboard
                router.push(`/${locale}/dashboard`);
            } else {
                // Fallback to login page if auto-login fails
                router.push(`/${locale}/login?message=account-created`);
            }
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
                    key="signup-form"
                    className="w-full max-w-2xl relative z-10"
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

                {/* Signup Card */}
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
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('firstName')}
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                    placeholder="Jean"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('lastName')}
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                    placeholder="Dupont"
                                />
                            </div>
                        </div>

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

                        <div className="grid md:grid-cols-2 gap-6">
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
                                <p className="text-xs text-gray-500 mt-1">{tErrors('weakPassword')}</p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('confirmPassword')}
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-start">
                            <input type="checkbox" required className="mt-1 mr-2" />
                            <span className="text-sm text-gray-400">
                                {t('termsAgree')}{' '}
                                <LocaleLink href="/terms" className="text-[#bff227] hover:underline">
                                    {t('terms')}
                                </LocaleLink>
                            </span>
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
                                    <i className="fas fa-user-plus"></i>
                                    {t('submit')}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            {t('hasAccount')}{' '}
                            <LocaleLink href="/login" className="text-[#bff227] hover:underline font-semibold">
                                {t('login')}
                            </LocaleLink>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <LocaleLink href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                        <i className="fas fa-arrow-left mr-2"></i>
                        {t('backToHome')}
                    </LocaleLink>
                </div>
            </motion.div>
            </AnimatePresence>
        </div>
    );
}
