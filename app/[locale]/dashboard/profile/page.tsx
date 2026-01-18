'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LocaleLink from '@/components/LocaleLink';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    emailVerified: boolean;
    createdAt: string;
    googleId?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const t = useTranslations('profile');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        country: 'FR',
    });
    
    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        // Transfer cookies to localStorage if needed (Google OAuth)
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key && value) acc[key] = value;
            return acc;
        }, {} as Record<string, string>);
        
        if (cookies.proofy_token && !localStorage.getItem('token')) {
            localStorage.setItem('token', cookies.proofy_token);
            if (cookies.proofy_user) {
                try {
                    const user = JSON.parse(decodeURIComponent(cookies.proofy_user));
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (e) {
                    console.error('Failed to parse user cookie:', e);
                }
            }
            document.cookie = 'proofy_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'proofy_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            router.push(`/${locale}/login`);
            return;
        }
        
        loadProfile();
    }, [router, locale]);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setFormData({
                    firstName: data.user.firstName || '',
                    lastName: data.user.lastName || '',
                    email: data.user.email || '',
                    country: data.user.country || 'FR',
                });
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push(`/${locale}/login`);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setErrorMessage(t('loadError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                // Update localStorage user data
                localStorage.setItem('user', JSON.stringify({
                    id: data.user.id,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    email: data.user.email,
                }));
                setSuccessMessage(t('saveSuccess'));
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.error || t('saveError'));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrorMessage(t('saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMessage(t('passwordMismatch'));
            return;
        }
        
        if (passwordData.newPassword.length < 8) {
            setErrorMessage(t('passwordTooShort'));
            return;
        }

        setIsChangingPassword(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(t('passwordChangeSuccess'));
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.error || t('passwordChangeError'));
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setErrorMessage(t('passwordChangeError'));
        } finally {
            setIsChangingPassword(false);
        }
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPasswordData(prev => ({
            ...prev,
            newPassword: password,
            confirmPassword: password,
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(`/${locale}`);
    };

    // Countries list
    const countries = [
        { code: 'FR', name: 'France' },
        { code: 'BE', name: 'Belgique' },
        { code: 'CH', name: 'Suisse' },
        { code: 'CA', name: 'Canada' },
        { code: 'US', name: 'États-Unis' },
        { code: 'GB', name: 'Royaume-Uni' },
        { code: 'DE', name: 'Allemagne' },
        { code: 'ES', name: 'Espagne' },
        { code: 'IT', name: 'Italie' },
        { code: 'PT', name: 'Portugal' },
        { code: 'NL', name: 'Pays-Bas' },
        { code: 'LU', name: 'Luxembourg' },
        { code: 'MA', name: 'Maroc' },
        { code: 'TN', name: 'Tunisie' },
        { code: 'DZ', name: 'Algérie' },
        { code: 'SN', name: 'Sénégal' },
        { code: 'CI', name: 'Côte d\'Ivoire' },
        { code: 'OTHER', name: 'Autre' },
    ];

    if (isLoading || !isMounted) {
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
        <div className="min-h-screen">
            {/* Aurora Background */}
            <div className="aurora-bg">
                <div className="aurora-stars"></div>
                <div className="aurora-layer"></div>
                <div className="aurora-layer aurora-layer-2"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <LocaleLink href="/dashboard" className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl rotate-6"></div>
                                <div className="absolute inset-0 bg-[#0b0124] rounded-xl flex items-center justify-center">
                                    <i className="fas fa-shield-halved text-[#bff227] text-lg"></i>
                                </div>
                            </div>
                            <span className="font-display font-bold text-xl bg-gradient-to-r from-[#bff227] to-white bg-clip-text text-transparent hidden sm:block">
                                UnlmtdProof
                            </span>
                        </LocaleLink>
                        
                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <i className="fas fa-sign-out-alt text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Back Button */}
                    <LocaleLink 
                        href="/dashboard" 
                        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        {tCommon('back')}
                    </LocaleLink>

                    {/* Page Title */}
                    <h1 className="font-display text-3xl font-bold text-white mb-8">
                        <i className="fas fa-user-circle mr-3 text-[#bff227]"></i>
                        {t('title')}
                    </h1>

                    {/* Success/Error Messages */}
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 glass-card border-green-500/30 text-green-400 rounded-xl"
                            >
                                <i className="fas fa-check-circle mr-2"></i>
                                {successMessage}
                            </motion.div>
                        )}
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 glass-card border-red-500/30 text-red-400 rounded-xl"
                            >
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                {errorMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Profile Information Card */}
                    <div className="glass-card rounded-3xl p-8 mb-8">
                        <h2 className="font-display text-xl font-semibold text-white mb-6 flex items-center">
                            <i className="fas fa-id-card mr-3 text-[#bff227]"></i>
                            {t('personalInfo')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* First Name */}
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

                            {/* Last Name */}
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

                            {/* Email */}
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
                                {user?.emailVerified && (
                                    <p className="mt-2 text-sm text-green-400">
                                        <i className="fas fa-check-circle mr-1"></i>
                                        {t('emailVerified')}
                                    </p>
                                )}
                            </div>

                            {/* Country */}
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('country')}
                                </label>
                                <select
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="input-aurora w-full px-4 py-3 rounded-xl text-white bg-transparent"
                                >
                                    {countries.map((c) => (
                                        <option key={c.code} value={c.code} className="bg-[#0b0124]">
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Google Connected */}
                            {user?.googleId && (
                                <div className="p-4 glass-card rounded-xl border-blue-500/30">
                                    <p className="text-sm text-blue-400">
                                        <i className="fab fa-google mr-2"></i>
                                        {t('googleConnected')}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full btn-aurora font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="loader w-5 h-5 border-2"></div>
                                        {tCommon('loading')}
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i>
                                        {tCommon('save')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Password Change Card */}
                    {!user?.googleId && (
                        <div className="glass-card rounded-3xl p-8 mb-8">
                            <h2 className="font-display text-xl font-semibold text-white mb-6 flex items-center">
                                <i className="fas fa-lock mr-3 text-[#bff227]"></i>
                                {t('changePassword')}
                            </h2>

                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                {/* Current Password */}
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('currentPassword')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="currentPassword"
                                            type={showPasswords.current ? 'text' : 'password'}
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="input-aurora w-full px-4 py-3 pr-12 rounded-xl text-white"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                                            {t('newPassword')}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="text-sm text-[#bff227] hover:underline flex items-center gap-1"
                                        >
                                            <i className="fas fa-sync-alt"></i>
                                            {t('generate')}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="newPassword"
                                            type={showPasswords.new ? 'text' : 'password'}
                                            required
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="input-aurora w-full px-4 py-3 pr-12 rounded-xl text-white"
                                            placeholder="••••••••"
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('confirmPassword')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            required
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="input-aurora w-full px-4 py-3 pr-12 rounded-xl text-white"
                                            placeholder="••••••••"
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="w-full py-3 px-4 border border-[#bff227]/50 text-[#bff227] font-semibold rounded-xl hover:bg-[#bff227]/10 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {isChangingPassword ? (
                                        <>
                                            <div className="loader w-5 h-5 border-2 border-[#bff227]"></div>
                                            {tCommon('loading')}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-key"></i>
                                            {t('updatePassword')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Account Info Card */}
                    <div className="glass-card rounded-3xl p-8">
                        <h2 className="font-display text-xl font-semibold text-white mb-6 flex items-center">
                            <i className="fas fa-info-circle mr-3 text-[#bff227]"></i>
                            {t('accountInfo')}
                        </h2>
                        
                        <div className="space-y-4 text-gray-400">
                            <p>
                                <span className="text-gray-500">{t('accountCreated')}:</span>{' '}
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(locale, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }) : '-'}
                            </p>
                            <p>
                                <span className="text-gray-500">{t('userId')}:</span>{' '}
                                <code className="text-xs bg-gray-800 px-2 py-1 rounded">#{user?.id}</code>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
