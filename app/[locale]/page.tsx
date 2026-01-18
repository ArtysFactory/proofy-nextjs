'use client';

import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, Zap, FileText, Palette, Music, Sparkles, Check, ChevronDown, Shield, Globe } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LocaleLink from '@/components/LocaleLink';

export default function HomePage() {
    const t = useTranslations('home');
    const tCommon = useTranslations('common');
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const [isMounted, setIsMounted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    // Pillar icons mapping
    const pillarIcons = {
        lock: Lock,
        zap: Zap,
        'file-text': FileText,
        palette: Palette,
    };

    // Pricing packs
    const pricingPacks = ['starter', 'creator', 'pro', 'studio'] as const;

    // FAQ items
    const faqItems = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

    return (
        <>
            <Navbar />

            <main className="relative z-10 pt-16">
                {/* ========================================
                    HERO SECTION - Emotional tension
                ======================================== */}
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
                            style={{ filter: 'brightness(0.5)' }}
                        >
                            <source src="/hero-background.mp4" type="video/mp4" />
                        </video>
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 pointer-events-none z-[1]" />

                    {/* Animated glow */}
                    <div className="absolute inset-0 pointer-events-none z-[1]" style={{
                        background: 'radial-gradient(ellipse at 50% 30%, rgba(191, 242, 39, 0.12) 0%, transparent 50%)'
                    }} />

                    {/* Main Content */}
                    <AnimatePresence>
                        {isMounted && (
                            <motion.div
                                className="max-w-5xl mx-auto text-center relative z-10 py-20"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {/* Badge */}
                                <motion.div
                                    className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 border border-[#bff227]/30"
                                    variants={itemVariants}
                                >
                                    <div className="w-2 h-2 bg-[#bff227] rounded-full animate-pulse"></div>
                                    <span className="text-gray-300 text-sm">
                                        {t('hero.badge')} • {t('hero.badgeFast')} • {t('hero.badgeCheap')}
                                    </span>
                                </motion.div>

                                {/* Main Title - Emotional hook */}
                                <motion.h1
                                    className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
                                    variants={itemVariants}
                                >
                                    <span className="text-white">{t('hero.line1')}</span>
                                    <br />
                                    <span className="text-white">{t('hero.line2')}</span>
                                    <br />
                                    <span className="bg-gradient-to-r from-[#bff227] via-[#d4ff4d] to-[#bff227] bg-clip-text text-transparent">
                                        {t('hero.line3')}
                                    </span>
                                </motion.h1>

                                {/* Subtitle */}
                                <motion.p
                                    className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
                                    variants={itemVariants}
                                >
                                    {t('hero.subtitle').split(t('hero.subtitleHighlight'))[0]}
                                    <span className="text-[#bff227] font-semibold">{t('hero.subtitleHighlight')}</span>
                                    {t('hero.subtitle').split(t('hero.subtitleHighlight'))[1]}
                                    <br className="hidden md:block" />
                                    <span className="text-gray-400">{t('hero.subtitleEnd')}</span>
                                </motion.p>

                                {/* CTA */}
                                <motion.div
                                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
                                    variants={itemVariants}
                                >
                                    <LocaleLink
                                        href="/signup"
                                        className="group relative overflow-hidden bg-gradient-to-r from-[#bff227] to-[#9dcc1e] !text-black font-bold px-8 py-4 rounded-2xl text-lg flex items-center gap-3 shadow-2xl shadow-[#bff227]/30 hover:shadow-[#bff227]/50 transition-all duration-300 hover:scale-105"
                                    >
                                        <Shield className="w-5 h-5" />
                                        <span>{t('hero.cta')}</span>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                                    </LocaleLink>
                                    <a
                                        href="#how-it-works"
                                        className="glass-card text-white font-semibold px-8 py-4 rounded-2xl text-lg flex items-center gap-3 hover:border-[#bff227]/50 transition-all duration-300 group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#bff227]/20 flex items-center justify-center group-hover:bg-[#bff227]/30 transition-colors">
                                            <i className="fas fa-play text-[#bff227] text-sm"></i>
                                        </div>
                                        <span>{t('hero.ctaSecondary')}</span>
                                    </a>
                                </motion.div>

                                {/* Micro text */}
                                <motion.p
                                    className="text-gray-500 text-sm"
                                    variants={itemVariants}
                                >
                                    {t('hero.microText')}
                                </motion.p>

                                {/* Scroll indicator */}
                                <motion.div
                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                                    variants={itemVariants}
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <span className="text-gray-500 text-xs uppercase tracking-widest">{t('hero.discover')}</span>
                                    <ChevronDown className="w-5 h-5 text-[#bff227]" />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* ========================================
                    PROBLEM SECTION - Why UnlmtdProof
                ======================================== */}
                <section id="why" className="py-24 px-4 relative bg-gradient-to-b from-black to-[#0a0a0a]">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                {t('problem.title')} <span className="text-[#bff227]">{t('problem.titleHighlight')}</span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
                                {t('problem.subtitle')}
                            </p>
                        </motion.div>

                        {/* 4 Pillars */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(['pillar1', 'pillar2', 'pillar3', 'pillar4'] as const).map((pillar, index) => {
                                const iconKey = t(`problem.${pillar}.icon`) as keyof typeof pillarIcons;
                                const Icon = pillarIcons[iconKey] || Lock;
                                return (
                                    <motion.div
                                        key={pillar}
                                        className="group relative"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <div className="glass-card rounded-3xl p-6 h-full border border-white/5 hover:border-[#bff227]/30 transition-all duration-300 group-hover:-translate-y-2">
                                            <div className="w-14 h-14 bg-gradient-to-br from-[#bff227]/20 to-[#bff227]/5 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                                <Icon className="w-7 h-7 text-[#bff227]" />
                                            </div>
                                            <h3 className="font-display text-xl font-bold text-white mb-3">
                                                {t(`problem.${pillar}.title`)}
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                {t(`problem.${pillar}.description`)}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ========================================
                    ARTISTS SECTION
                ======================================== */}
                <section id="artists" className="py-24 px-4 relative bg-[#0a0a0a] overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#bff227]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="max-w-6xl mx-auto relative z-10">
                        <motion.div
                            className="flex flex-col lg:flex-row items-center gap-12 mb-16"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#bff227]/30">
                                    <Music className="w-12 h-12 text-black" />
                                </div>
                            </div>
                            <div className="text-center lg:text-left">
                                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                    {t('artists.title')} <span className="text-[#bff227]">{t('artists.titleHighlight')}</span>
                                </h2>
                                <p className="text-gray-400 text-lg max-w-2xl">
                                    {t('artists.subtitle')}
                                </p>
                            </div>
                        </motion.div>

                        {/* Blocks */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            {(['block1', 'block2', 'block3', 'block4'] as const).map((block, index) => (
                                <motion.div
                                    key={block}
                                    className="glass-card rounded-3xl p-8 border border-white/5 hover:border-[#bff227]/20 transition-all duration-300"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <h3 className="font-display text-xl font-bold text-white mb-3">
                                        {t(`artists.${block}.title`)}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {t(`artists.${block}.description`)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <LocaleLink
                                href="/signup"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#bff227] to-[#9dcc1e] !text-black font-bold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-[#bff227]/20 hover:shadow-[#bff227]/40 transition-all duration-300 hover:scale-105"
                            >
                                <Music className="w-5 h-5" />
                                {t('artists.cta')}
                            </LocaleLink>
                        </motion.div>
                    </div>
                </section>

                {/* ========================================
                    AI CREATORS SECTION
                ======================================== */}
                <section id="ai-creators" className="py-24 px-4 relative bg-gradient-to-b from-[#0a0a0a] to-black overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2" />
                    
                    <div className="max-w-6xl mx-auto relative z-10">
                        <motion.div
                            className="flex flex-col lg:flex-row items-center gap-12 mb-16"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                                    <Sparkles className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            <div className="text-center lg:text-left">
                                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                    {t('aiCreators.title')} <span className="text-purple-400">{t('aiCreators.titleHighlight')}</span>
                                </h2>
                                <p className="text-gray-400 text-lg max-w-2xl">
                                    {t('aiCreators.subtitle')}
                                </p>
                            </div>
                        </motion.div>

                        {/* Blocks */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            {(['block1', 'block2', 'block3', 'block4'] as const).map((block, index) => (
                                <motion.div
                                    key={block}
                                    className="glass-card rounded-3xl p-8 border border-white/5 hover:border-purple-500/20 transition-all duration-300"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <h3 className="font-display text-xl font-bold text-white mb-3">
                                        {t(`aiCreators.${block}.title`)}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {t(`aiCreators.${block}.description`)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Punchline */}
                        <motion.blockquote
                            className="text-center mb-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-2xl md:text-3xl font-display font-bold text-purple-300 italic">
                                {t('aiCreators.punchline')}
                            </p>
                        </motion.blockquote>

                        {/* CTA */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <LocaleLink
                                href="/signup"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                            >
                                <Sparkles className="w-5 h-5" />
                                {t('aiCreators.cta')}
                            </LocaleLink>
                        </motion.div>
                    </div>
                </section>

                {/* ========================================
                    HOW IT WORKS SECTION
                ======================================== */}
                <section id="how-it-works" className="py-24 px-4 relative bg-black overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#bff227]/5 to-transparent"></div>
                    
                    <div className="max-w-6xl mx-auto relative z-10">
                        <motion.div
                            className="text-center mb-16"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                {t('howItWorks.title')} <span className="text-[#bff227]">{t('howItWorks.titleHighlight')}</span>
                            </h2>
                        </motion.div>

                        {/* Steps */}
                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            {(['step1', 'step2', 'step3'] as const).map((step, index) => (
                                <motion.div
                                    key={step}
                                    className="relative"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                >
                                    {/* Connector line */}
                                    {index < 2 && (
                                        <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#bff227]/50 to-transparent" />
                                    )}
                                    
                                    <div className="glass-card rounded-3xl p-8 text-center border border-white/5 hover:border-[#bff227]/30 transition-all duration-300 h-full">
                                        {/* Step number */}
                                        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#bff227]/30">
                                            <span className="text-black font-display text-2xl font-bold">{index + 1}</span>
                                        </div>
                                        <span className="text-[#bff227] text-sm font-semibold uppercase tracking-wider">
                                            {t(`howItWorks.${step}.badge`)}
                                        </span>
                                        <h3 className="font-display text-2xl font-bold text-white mt-2 mb-2">
                                            {t(`howItWorks.${step}.title`)}
                                        </h3>
                                        <p className="text-[#bff227]/80 font-medium mb-3">
                                            {t(`howItWorks.${step}.subtitle`)}
                                        </p>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {t(`howItWorks.${step}.description`)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Reassurance */}
                        <motion.div
                            className="text-center mb-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full border border-[#bff227]/20">
                                <Lock className="w-4 h-4 text-[#bff227]" />
                                <span className="text-gray-300 text-sm">{t('howItWorks.reassurance')}</span>
                            </div>
                        </motion.div>

                        {/* CTA */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <LocaleLink
                                href="/signup"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#bff227] to-[#9dcc1e] !text-black font-bold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-[#bff227]/20 hover:shadow-[#bff227]/40 transition-all duration-300 hover:scale-105"
                            >
                                {t('howItWorks.cta')}
                            </LocaleLink>
                        </motion.div>
                    </div>
                </section>

                {/* ========================================
                    PRICING SECTION
                ======================================== */}
                <section id="pricing" className="py-24 px-4 relative bg-[#0a0a0a]">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                {t('pricing.title')} <span className="text-[#bff227]">{t('pricing.titleHighlight')}</span>
                            </h2>
                            <p className="text-gray-400 text-lg">
                                {t('pricing.subtitle')}
                            </p>
                        </motion.div>

                        {/* Pricing cards */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {pricingPacks.map((pack, index) => {
                                const isPopular = t.raw(`pricing.${pack}.popular`) === true;
                                return (
                                    <motion.div
                                        key={pack}
                                        className={`relative rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-2 ${
                                            isPopular 
                                                ? 'bg-gradient-to-b from-[#bff227]/10 to-transparent border-[#bff227]/50 shadow-xl shadow-[#bff227]/10' 
                                                : 'glass-card border-white/10 hover:border-[#bff227]/30'
                                        }`}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        {isPopular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#bff227] text-black text-xs font-bold px-4 py-1 rounded-full">
                                                POPULAIRE
                                            </div>
                                        )}
                                        <h3 className="font-display text-xl font-bold text-white mb-2">
                                            {t(`pricing.${pack}.name`)}
                                        </h3>
                                        <div className="mb-4">
                                            <span className="text-4xl font-bold text-white">{t(`pricing.${pack}.price`)}€</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-4 text-sm">
                                            <span className="text-[#bff227] font-semibold">{t(`pricing.${pack}.pricePerDeposit`)}€</span>
                                            <span className="text-gray-500">{t('pricing.perDeposit')}</span>
                                        </div>
                                        <div className="text-gray-400 text-sm mb-4">
                                            {t(`pricing.${pack}.deposits`)} {t('pricing.deposits')}
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                            {t('pricing.idealFor')}: {t(`pricing.${pack}.idealFor`)}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Comparison */}
                        <motion.div
                            className="glass-card rounded-2xl p-6 mb-12 border border-[#bff227]/20"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <h4 className="font-semibold text-white mb-3">{t('pricing.comparison.title')}</h4>
                            <p className="text-gray-400 text-sm mb-2">{t('pricing.comparison.inpi')}</p>
                            <p className="text-[#bff227] font-semibold">{t('pricing.comparison.unlmtdproof')}</p>
                        </motion.div>

                        {/* Reassurance badges */}
                        <motion.div
                            className="flex flex-wrap justify-center gap-4 mb-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            {(['noSubscription', 'noHiddenFees', 'noExpiration', 'frenchBilling'] as const).map((badge) => (
                                <div key={badge} className="flex items-center gap-2 text-gray-300 text-sm">
                                    <Check className="w-4 h-4 text-[#bff227]" />
                                    <span>{t(`pricing.reassurance.${badge}`)}</span>
                                </div>
                            ))}
                        </motion.div>

                        {/* CTAs */}
                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <LocaleLink
                                href="/signup"
                                className="bg-gradient-to-r from-[#bff227] to-[#9dcc1e] !text-black font-bold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-[#bff227]/20 hover:shadow-[#bff227]/40 transition-all duration-300 hover:scale-105"
                            >
                                {t('pricing.cta')}
                            </LocaleLink>
                            <LocaleLink
                                href="/signup"
                                className="glass-card text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:border-[#bff227]/50 transition-all duration-300"
                            >
                                {t('pricing.ctaSecondary')}
                            </LocaleLink>
                        </motion.div>
                    </div>
                </section>

                {/* ========================================
                    FAQ SECTION
                ======================================== */}
                <section id="faq" className="py-24 px-4 relative bg-black">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                {t('faq.title')} <span className="text-[#bff227]">{t('faq.titleHighlight')}</span>
                            </h2>
                        </motion.div>

                        {/* FAQ items */}
                        <div className="space-y-4">
                            {faqItems.map((faq, index) => (
                                <motion.div
                                    key={faq}
                                    className="glass-card rounded-2xl border border-white/5 overflow-hidden"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                                    >
                                        <span className="font-semibold text-white pr-4">
                                            {t(`faq.${faq}.question`)}
                                        </span>
                                        <ChevronDown 
                                            className={`w-5 h-5 text-[#bff227] flex-shrink-0 transition-transform duration-300 ${
                                                openFaq === index ? 'rotate-180' : ''
                                            }`} 
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                                                    {t(`faq.${faq}.answer`)}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========================================
                    TRUST SECTION
                ======================================== */}
                <section id="trust" className="py-24 px-4 relative bg-[#0a0a0a]">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                                {t('trust.title')} <span className="text-[#bff227]">{t('trust.titleHighlight')}</span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                                {t('trust.description')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                                    <Shield className="w-4 h-4 text-[#bff227]" />
                                    <span className="text-gray-300 text-sm">{t('trust.badge1')}</span>
                                </div>
                                <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                                    <Globe className="w-4 h-4 text-[#bff227]" />
                                    <span className="text-gray-300 text-sm">{t('trust.badge2')}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ========================================
                    FINAL CTA SECTION
                ======================================== */}
                <section className="py-24 px-4 relative bg-gradient-to-b from-[#0a0a0a] to-black overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(191, 242, 39, 0.1) 0%, transparent 50%)'
                    }} />
                    
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
                                {t('finalCta.title')} <span className="text-[#bff227]">{t('finalCta.titleHighlight')}</span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-8">
                                {t('finalCta.subtitle')}
                            </p>
                            <LocaleLink
                                href="/signup"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#bff227] to-[#9dcc1e] !text-black font-bold px-10 py-5 rounded-2xl text-xl shadow-2xl shadow-[#bff227]/30 hover:shadow-[#bff227]/50 transition-all duration-300 hover:scale-105 mb-4"
                            >
                                <Shield className="w-6 h-6" />
                                {t('finalCta.cta')}
                            </LocaleLink>
                            <p className="text-gray-500 text-sm">
                                {t('finalCta.microText')}
                            </p>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
