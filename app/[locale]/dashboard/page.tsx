'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LocaleLink from '@/components/LocaleLink';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Creation {
    id: number;
    publicId: string;
    title: string;
    fileHash: string;
    projectType: string;
    status: string;
    createdAt: string;
    txHash?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const t = useTranslations('dashboard');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    
    const [user, setUser] = useState<any>(null);
    const [creations, setCreations] = useState<Creation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        // Check authentication
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push(`/${locale}/login`);
            return;
        }

        setUser(JSON.parse(userData));
        loadCreations();
    }, [router]);

    const loadCreations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/creations', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCreations(data.creations || []);
            }
        } catch (error) {
            console.error('Error loading creations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(`/${locale}`);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: 'easeOut' },
        },
    };

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

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[#bff227]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <LocaleLink href="/" className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl"></div>
                                <div className="absolute inset-0 bg-[#0b0124] rounded-xl flex items-center justify-center m-0.5">
                                    <i className="fas fa-shield-halved text-[#bff227] text-lg"></i>
                                </div>
                            </div>
                            <span className="font-display font-bold text-xl bg-gradient-to-r from-[#bff227] to-white bg-clip-text text-transparent">
                                Proofy
                            </span>
                        </LocaleLink>

                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            <span className="text-gray-300 hidden sm:block">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="dashboard-content"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Header */}
                            <motion.div className="mb-12" variants={itemVariants}>
                                <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                    {t('title')}
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    Gérez vos créations et suivez leur statut sur la blockchain
                                </p>
                            </motion.div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <motion.div
                                    className="glass-card rounded-2xl p-6"
                                    variants={itemVariants}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400">{t('stats.total')}</span>
                                        <i className="fas fa-file text-[#bff227]"></i>
                                    </div>
                                    <div className="font-display text-3xl font-bold text-white">
                                        {creations.length}
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="glass-card rounded-2xl p-6"
                                    variants={itemVariants}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400">{t('stats.confirmed')}</span>
                                        <i className="fas fa-check-circle text-emerald-400"></i>
                                    </div>
                                    <div className="font-display text-3xl font-bold text-white">
                                        {creations.filter((c) => c.status === 'confirmed').length}
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="glass-card rounded-2xl p-6"
                                    variants={itemVariants}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400">{t('stats.pending')}</span>
                                        <i className="fas fa-clock text-amber-400"></i>
                                    </div>
                                    <div className="font-display text-3xl font-bold text-white">
                                        {creations.filter((c) => c.status === 'pending').length}
                                    </div>
                                </motion.div>
                            </div>

                            {/* CTA Button */}
                            <motion.div className="mb-12 flex flex-wrap gap-4" variants={itemVariants}>
                                <LocaleLink
                                    href="/dashboard/new"
                                    className="inline-flex items-center gap-3 btn-aurora text-white font-semibold px-8 py-4 rounded-2xl text-lg"
                                >
                                    <i className="fas fa-plus"></i>
                                    {t('newCreation')}
                                </LocaleLink>
                            </motion.div>

                            {/* Creations List */}
                            <motion.div variants={itemVariants}>
                                <h2 className="font-display text-2xl font-bold text-white mb-6">
                                    {t('myCreations')}
                                </h2>

                                {creations.length === 0 ? (
                                    <div className="glass-card rounded-2xl p-12 text-center">
                                        <i className="fas fa-folder-open text-6xl text-gray-600 mb-4"></i>
                                        <p className="text-gray-400 text-lg mb-6">
                                            {t('empty.subtitle')}
                                        </p>
                                        <LocaleLink
                                            href="/dashboard/new"
                                            className="inline-flex items-center gap-2 btn-aurora text-white font-semibold px-6 py-3 rounded-xl"
                                        >
                                            <i className="fas fa-plus"></i>
                                            {t('newCreation')}
                                        </LocaleLink>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {creations.map((creation, index) => (
                                            <motion.div
                                                key={creation.id}
                                                className="glass-card rounded-2xl p-6 hover:border-[#bff227]/40 transition-all"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-display text-xl font-bold text-white mb-2">
                                                            {creation.title}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-3">
                                                            <span>
                                                                <i className="fas fa-tag mr-2"></i>
                                                                {creation.projectType}
                                                            </span>
                                                            <span>
                                                                <i className="fas fa-calendar mr-2"></i>
                                                                {new Date(creation.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-mono text-gray-500 bg-[#0b0124]/50 p-2 rounded-lg truncate">
                                                            {creation.fileHash}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <span
                                                            className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${creation.status === 'confirmed'
                                                                    ? 'status-confirmed'
                                                                    : creation.status === 'pending'
                                                                        ? 'status-pending'
                                                                        : 'status-failed'
                                                                }`}
                                                        >
                                                            {creation.status === 'confirmed'
                                                                ? t('creation.confirmed')
                                                                : creation.status === 'pending'
                                                                    ? t('creation.pending')
                                                                    : 'Error'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-3">
                                                    <LocaleLink
                                                        href={`/proof/${creation.publicId}`}
                                                        className="text-[#bff227] hover:underline text-sm"
                                                    >
                                                        <i className="fas fa-eye mr-2"></i>
                                                        {t('creation.viewProof')}
                                                    </LocaleLink>
                                                    <LocaleLink
                                                        href={`/dashboard/rights/${creation.publicId}`}
                                                        className="text-purple-400 hover:underline text-sm"
                                                    >
                                                        <i className="fas fa-scale-balanced mr-2"></i>
                                                        {t('creation.manageRights')}
                                                    </LocaleLink>
                                                    {creation.txHash && (
                                                        <a
                                                            href={`https://polygonscan.com/tx/${creation.txHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#bff227] hover:underline text-sm"
                                                        >
                                                            <i className="fas fa-external-link-alt mr-2"></i>
                                                            Polygonscan
                                                        </a>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
