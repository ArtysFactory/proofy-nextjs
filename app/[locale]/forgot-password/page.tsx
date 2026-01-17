'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Mail, ArrowLeft, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import LocaleLink from '@/components/LocaleLink';

export default function ForgotPasswordPage() {
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations();
    
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, locale }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.error || t('errors.generic'));
            }
        } catch (err) {
            setError(t('errors.network'));
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
            {/* Aurora Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl mb-4 border border-purple-500/30">
                                <Sparkles className="w-8 h-8 text-purple-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                {t('auth.forgotPassword.title')}
                            </h1>
                            <p className="text-gray-400">
                                {t('auth.forgotPassword.subtitle')}
                            </p>
                        </div>

                        {success ? (
                            /* Success State */
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    {t('auth.forgotPassword.successTitle')}
                                </h2>
                                <p className="text-gray-400 mb-6">
                                    {t('auth.forgotPassword.successMessage')}
                                </p>
                                <LocaleLink
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {t('auth.forgotPassword.backToLogin')}
                                </LocaleLink>
                            </div>
                        ) : (
                            /* Form */
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('auth.login.email')}
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={t('auth.login.emailPlaceholder')}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t('common.loading')}
                                        </>
                                    ) : (
                                        t('auth.forgotPassword.submit')
                                    )}
                                </button>

                                <div className="text-center">
                                    <LocaleLink
                                        href="/login"
                                        className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        {t('auth.forgotPassword.backToLogin')}
                                    </LocaleLink>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
