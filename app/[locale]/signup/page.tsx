'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LocaleLink from '@/components/LocaleLink';
import Logo from '@/components/ui/Logo';
import { Eye, EyeOff, RefreshCw, Check, X } from 'lucide-react';

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Password strength indicators
    const passwordChecks = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    };

    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        
        setFormData(prev => ({
            ...prev,
            password: newPassword,
            confirmPassword: newPassword
        }));
        setShowPassword(true);
        setShowConfirmPassword(true);
    };

    const handleGoogleSignup = () => {
        setGoogleLoading(true);
        // Redirect to Google OAuth endpoint
        window.location.href = '/api/auth/google';
    };

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
                
                // Redirect to original page or dashboard
                const redirectUrl = searchParams.get('redirect');
                if (redirectUrl) {
                    router.push(`/${locale}${redirectUrl}`);
                } else {
                    router.push(`/${locale}/dashboard`);
                }
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
                <div className="flex justify-center mb-8">
                    <Logo size="lg" linkTo="/" />
                </div>

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

                    {/* Google Signup Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignup}
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
                        {t('googleSignup')}
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
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                        {t('password')}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="text-xs text-[#bff227] hover:text-[#d4ff4a] flex items-center gap-1 transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        {t('generatePassword')}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="input-aurora w-full px-4 py-3 pr-12 rounded-xl text-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                
                                {/* Password Strength Indicator */}
                                {formData.password && (
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
                                                8+ {t('characters')}
                                            </div>
                                            <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                                                {passwordChecks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {t('uppercase')}
                                            </div>
                                            <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-400' : 'text-gray-500'}`}>
                                                {passwordChecks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {t('number')}
                                            </div>
                                            <div className={`flex items-center gap-1 ${passwordChecks.special ? 'text-green-400' : 'text-gray-500'}`}>
                                                {passwordChecks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {t('special')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('confirmPassword')}
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="input-aurora w-full px-4 py-3 pr-12 rounded-xl text-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-400">{tErrors('passwordMismatch')}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start">
                            <input 
                                type="checkbox" 
                                required 
                                className="mt-1 mr-2 w-4 h-4 rounded border-gray-600 bg-gray-700 text-[#bff227] focus:ring-[#bff227] focus:ring-offset-0" 
                            />
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

export default function SignupPage() {
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
            <SignupContent />
        </Suspense>
    );
}
