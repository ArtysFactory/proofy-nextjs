'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, Sparkles, RefreshCw, Check, X } from 'lucide-react';
import LocaleLink from '@/components/LocaleLink';

function ResetPasswordContent() {
    const params = useParams();
    const locale = params.locale as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const t = useTranslations();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Password strength indicators
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let newPassword = '';
        
        // Ensure at least one of each required type
        newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        newPassword += '0123456789'[Math.floor(Math.random() * 10)];
        newPassword += '!@#$%^&*'[Math.floor(Math.random() * 8)];
        
        // Fill the rest
        for (let i = 4; i < 16; i++) {
            newPassword += chars[Math.floor(Math.random() * chars.length)];
        }
        
        // Shuffle the password
        newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');
        
        setPassword(newPassword);
        setConfirmPassword(newPassword);
        setShowPassword(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('auth.errors.passwordMismatch'));
            return;
        }

        if (password.length < 8) {
            setError(t('auth.errors.weakPassword'));
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/${locale}/login?message=password-reset`);
                }, 3000);
            } else {
                setError(data.error || t('errors.generic'));
            }
        } catch (err) {
            setError(t('errors.network'));
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md text-center">
                    <div className="text-red-400 mb-4">
                        {t('auth.resetPassword.invalidLink')}
                    </div>
                    <LocaleLink
                        href="/forgot-password"
                        className="text-purple-400 hover:text-purple-300"
                    >
                        {t('auth.resetPassword.requestNew')}
                    </LocaleLink>
                </div>
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
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl mb-4 border border-purple-500/30">
                                <Sparkles className="w-8 h-8 text-purple-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                {t('auth.resetPassword.title')}
                            </h1>
                            <p className="text-gray-400">
                                {t('auth.resetPassword.subtitle')}
                            </p>
                        </div>

                        {success ? (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    {t('auth.resetPassword.successTitle')}
                                </h2>
                                <p className="text-gray-400 mb-4">
                                    {t('auth.resetPassword.successMessage')}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {t('auth.resetPassword.redirecting')}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Password Field */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            {t('auth.resetPassword.newPassword')}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            {t('auth.signup.generatePassword')}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    
                                    {/* Password Strength Indicator */}
                                    {password && (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-1 flex-1 rounded-full transition-colors ${
                                                            passwordStrength >= level
                                                                ? passwordStrength <= 2
                                                                    ? 'bg-red-500'
                                                                    : passwordStrength <= 4
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-green-500'
                                                                : 'bg-gray-700'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-2 gap-1 text-xs">
                                                <div className={`flex items-center gap-1 ${passwordChecks.length ? 'text-green-400' : 'text-gray-500'}`}>
                                                    {passwordChecks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                    8+ {t('auth.signup.characters')}
                                                </div>
                                                <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                                                    {passwordChecks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                    {t('auth.signup.uppercase')}
                                                </div>
                                                <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-400' : 'text-gray-500'}`}>
                                                    {passwordChecks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                    {t('auth.signup.number')}
                                                </div>
                                                <div className={`flex items-center gap-1 ${passwordChecks.special ? 'text-green-400' : 'text-gray-500'}`}>
                                                    {passwordChecks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                    {t('auth.signup.special')}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('auth.resetPassword.confirmPassword')}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="mt-1 text-xs text-red-400">{t('auth.errors.passwordMismatch')}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || password !== confirmPassword || password.length < 8}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t('common.loading')}
                                        </>
                                    ) : (
                                        t('auth.resetPassword.submit')
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
