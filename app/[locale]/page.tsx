'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LocaleLink from '@/components/LocaleLink';

export default function HomePage() {
    const t = useTranslations('home');
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const [isMounted, setIsMounted] = useState(false);

    // Ensure client-side rendering for animations
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Parallax transformations
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    // Features data with translations
    const features = [
        {
            icon: 'fas fa-fingerprint text-[#bff227]',
            gradient: 'bg-gradient-to-br from-[#bff227]/20 to-purple-600/10',
            titleKey: 'hash',
        },
        {
            icon: 'fas fa-link text-white',
            gradient: 'bg-gradient-to-br from-[#bff227]/20 to-violet-600/10',
            titleKey: 'blockchain',
        },
        {
            icon: 'fas fa-certificate text-[#bff227]',
            gradient: 'bg-gradient-to-br from-[#bff227]/20 to-purple-600/10',
            titleKey: 'certificate',
        },
        {
            icon: 'fas fa-clock text-amber-400',
            gradient: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10',
            titleKey: 'timestamp',
        },
        {
            icon: 'fas fa-shield-alt text-rose-400',
            gradient: 'bg-gradient-to-br from-rose-500/20 to-rose-600/10',
            titleKey: 'gdpr',
        },
        {
            icon: 'fas fa-wallet text-indigo-400',
            gradient: 'bg-gradient-to-br from-[#bff227]/20 to-indigo-600/10',
            titleKey: 'noWallet',
        },
    ];

    // Steps data
    const steps = [
        {
            stepKey: 'step1',
            gradient: 'bg-gradient-to-br from-[#bff227] to-purple-600',
            shadow: 'shadow-[#bff227]/30',
        },
        {
            stepKey: 'step2',
            gradient: 'bg-gradient-to-br from-[#bff227] to-violet-600',
            shadow: 'shadow-violet-500/30',
        },
        {
            stepKey: 'step3',
            gradient: 'bg-gradient-to-br from-[#bff227] to-indigo-600',
            shadow: 'shadow-indigo-500/30',
        },
    ];

    return (
        <>
            <Navbar />

            <main className="relative z-10 pt-16">
                {/* Hero Section with Neon Flow */}
                <section
                    ref={heroRef}
                    className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black"
                >
                    {/* Video Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute w-full h-full object-cover"
                            style={{ filter: 'brightness(0.6)' }}
                        >
                            <source src="/hero-background.mp4" type="video/mp4" />
                        </video>
                    </div>

                    {/* Subtle gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60 pointer-events-none z-[1]" />

                    {/* Subtle center glow */}
                    <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-[1]" style={{
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(191, 242, 39, 0.08) 0%, transparent 50%)'
                    }} />

                    {/* Main Content */}
                    <AnimatePresence>
                        {isMounted && (
                            <motion.div
                                className="max-w-6xl mx-auto text-center relative z-10 pt-8"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {/* Premium Badge */}
                                <motion.div
                                    className="inline-flex items-center gap-3 hero-badge badge-shimmer px-5 py-2.5 rounded-full mb-10"
                                    variants={itemVariants}
                                >
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-[#bff227] rounded-full"></div>
                                        <div className="absolute w-2.5 h-2.5 bg-[#bff227] rounded-full animate-ping"></div>
                                    </div>
                                    <span className="text-gray-200 text-sm font-medium tracking-wide">
                                        {t('hero.badge')} <span className="text-[#bff227] font-semibold">Polygon</span> • {t('hero.badgeFast')} • {t('hero.badgeCheap')}
                                    </span>
                                    <div className="w-px h-4 bg-[#bff227]/30"></div>
                                    <span className="text-[#bff227] text-xs font-semibold uppercase tracking-wider">Web3</span>
                                </motion.div>

                                {/* Main Title */}
                                <motion.h1
                                    className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
                                    variants={itemVariants}
                                >
                                    <span className="text-white">{t('hero.title1')}</span>
                                    <br className="hidden sm:block" />
                                    <span className="text-gradient-animated">{t('hero.title2')}</span>
                                    <br />
                                    <span className="text-white">{t('hero.title3')} </span>
                                    <span className="relative inline-block">
                                        <span className="bg-gradient-to-r from-[#bff227] via-white to-white bg-clip-text text-transparent">
                                            {t('hero.title4')}
                                        </span>
                                    </span>
                                </motion.h1>

                                {/* Subtitle */}
                                <motion.p
                                    className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-14 leading-relaxed"
                                    variants={itemVariants}
                                >
                                    {t('hero.subtitle').split(t('hero.subtitleHighlight'))[0]}
                                    <span className="text-[#bff227]">{t('hero.subtitleHighlight')}</span>
                                    {t('hero.subtitle').split(t('hero.subtitleHighlight'))[1]}
                                    <br className="hidden md:block" />
                                    {t('hero.subtitleEnd')}
                                </motion.p>

                                {/* CTA Buttons */}
                                <motion.div
                                    className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
                                    variants={itemVariants}
                                >
                                    <LocaleLink
                                        href="/signup"
                                        className="btn-premium text-white font-semibold px-10 py-5 rounded-2xl text-lg flex items-center gap-4 group shadow-2xl shadow-[#bff227]/25 hover:shadow-[#bff227]/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                                    >
                                        <i className="fas fa-rocket text-xl"></i>
                                        <span>{t('hero.cta')}</span>
                                        <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform duration-300"></i>
                                    </LocaleLink>
                                    <a
                                        href="#how-it-works"
                                        className="glass-card text-white font-semibold px-10 py-5 rounded-2xl text-lg flex items-center gap-4 hover:border-[#bff227]/50 transition-all duration-300 group hover:-translate-y-1"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#bff227]/20 flex items-center justify-center group-hover:bg-[#bff227]/30 transition-colors">
                                            <i className="fas fa-play text-[#bff227]"></i>
                                        </div>
                                        <span>{t('hero.ctaSecondary')}</span>
                                    </a>
                                </motion.div>

                                {/* Stats Cards */}
                                <motion.div
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
                                    variants={itemVariants}
                                >
                                    <div className="glass-card rounded-2xl p-6 text-center hover:border-[#bff227]/40 transition-all duration-300 hover:-translate-y-1">
                                        <div className="font-display text-4xl md:text-5xl font-bold mb-2">
                                            <span className="text-gradient-animated">0.001</span>
                                            <span className="text-[#bff227]">$</span>
                                        </div>
                                        <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">{t('hero.statCost')}</div>
                                    </div>

                                    <div className="glass-card rounded-2xl p-6 text-center hover:border-[#bff227]/40 transition-all duration-300 hover:-translate-y-1">
                                        <div className="font-display text-4xl md:text-5xl font-bold mb-2">
                                            <span className="text-[#bff227]">&lt;</span>
                                            <span className="text-gradient-animated">30</span>
                                            <span className="text-white">s</span>
                                        </div>
                                        <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">{t('hero.statTime')}</div>
                                    </div>

                                    <div className="glass-card rounded-2xl p-6 text-center hover:border-[#bff227]/40 transition-all duration-300 hover:-translate-y-1">
                                        <div className="font-display text-4xl md:text-5xl font-bold mb-2">
                                            <span className="text-gradient-animated">∞</span>
                                        </div>
                                        <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">{t('hero.statValidity')}</div>
                                    </div>
                                </motion.div>

                                {/* Scroll Indicator */}
                                <motion.div
                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                                    variants={itemVariants}
                                >
                                    <span className="text-gray-500 text-xs uppercase tracking-widest">{t('hero.discover')}</span>
                                    <div className="w-6 h-10 rounded-full border-2 border-[#bff227]/30 flex justify-center pt-2">
                                        <div className="w-1.5 h-1.5 bg-[#bff227] rounded-full animate-bounce"></div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Fallback for SSR - Show content without animations */}
                    {!isMounted && (
                        <div className="max-w-6xl mx-auto text-center relative z-10 pt-8">
                            <div className="inline-flex items-center gap-3 hero-badge badge-shimmer px-5 py-2.5 rounded-full mb-10">
                                <div className="relative flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-[#bff227] rounded-full"></div>
                                </div>
                                <span className="text-gray-200 text-sm font-medium tracking-wide">
                                    {t('hero.badge')} <span className="text-[#bff227] font-semibold">Polygon</span> • {t('hero.badgeFast')} • {t('hero.badgeCheap')}
                                </span>
                            </div>
                            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
                                <span className="text-white">{t('hero.title1')}</span>
                                <br className="hidden sm:block" />
                                <span className="text-gradient-animated">{t('hero.title2')}</span>
                                <br />
                                <span className="text-white">{t('hero.title3')} </span>
                                <span className="bg-gradient-to-r from-[#bff227] via-white to-white bg-clip-text text-transparent">
                                    {t('hero.title4')}
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-14 leading-relaxed">
                                {t('hero.subtitle')}
                            </p>
                        </div>
                    )}
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 px-4 relative bg-[#0a0a0a]">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                {t('features.title')} <span className="text-[#bff227]">{t('features.titleHighlight')}</span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                {t('features.subtitle')}
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="glass-card rounded-3xl p-8 group"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className={`w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <i className={`${feature.icon} text-2xl`}></i>
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-white mb-3">
                                        {t(`features.${feature.titleKey}.title`)}
                                    </h3>
                                    <p className="text-gray-400">
                                        {t(`features.${feature.titleKey}.description`)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section id="how-it-works" className="py-24 px-4 relative overflow-hidden bg-[#0a0a0a]">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#bff227]/5 to-transparent"></div>

                    <div className="max-w-6xl mx-auto relative z-10">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                {t('howItWorks.title')} <span className="text-[#bff227]">{t('howItWorks.titleHighlight')}</span> ?
                            </h2>
                            <p className="text-gray-400 text-lg">{t('howItWorks.subtitle')}</p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#bff227]/50 via-violet-500/50 to-white/50"></div>

                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="relative text-center"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                >
                                    <div className={`w-16 h-16 mx-auto mb-6 ${step.gradient} rounded-2xl flex items-center justify-center text-white font-display text-2xl font-bold shadow-lg ${step.shadow} relative z-10`}>
                                        {index + 1}
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-white mb-3">
                                        {t(`howItWorks.${step.stepKey}.title`)}
                                    </h3>
                                    <p className="text-gray-400">
                                        {t(`howItWorks.${step.stepKey}.description`)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>


            </main>

            <Footer />
        </>
    );
}
