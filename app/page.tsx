'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
// Video background - no component needed

export default function HomePage() {
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
                                        Ancré sur <span className="text-[#bff227] font-semibold">Polygon</span> • Ultra rapide • Économique
                                    </span>
                                    <div className="w-px h-4 bg-[#bff227]/30"></div>
                                    <span className="text-[#bff227] text-xs font-semibold uppercase tracking-wider">Web3</span>
                                </motion.div>

                                {/* Main Title */}
                                <motion.h1
                                    className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
                                    variants={itemVariants}
                                >
                                    <span className="text-white">Protégez vos</span>
                                    <br className="hidden sm:block" />
                                    <span className="text-gradient-animated">créations</span>
                                    <br />
                                    <span className="text-white">sur la </span>
                                    <span className="relative inline-block">
                                        <span className="bg-gradient-to-r from-[#bff227] via-white to-white bg-clip-text text-transparent">
                                            blockchain
                                        </span>
                                    </span>
                                </motion.h1>

                                {/* Subtitle */}
                                <motion.p
                                    className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-14 leading-relaxed"
                                    variants={itemVariants}
                                >
                                    Prouvez l&apos;<span className="text-[#bff227]">antériorité</span> de vos œuvres en quelques clics.
                                    <br className="hidden md:block" />
                                    Certificat <span className="text-white">horodaté</span>, <span className="text-white">immuable</span> et vérifiable par tous.
                                </motion.p>

                                {/* CTA Buttons */}
                                <motion.div
                                    className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
                                    variants={itemVariants}
                                >
                                    <Link
                                        href="/signup"
                                        className="btn-premium text-white font-semibold px-10 py-5 rounded-2xl text-lg flex items-center gap-4 group shadow-2xl shadow-[#bff227]/25 hover:shadow-[#bff227]/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                                    >
                                        <i className="fas fa-rocket text-xl"></i>
                                        <span>Déposer une création</span>
                                        <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform duration-300"></i>
                                    </Link>
                                    <a
                                        href="#how-it-works"
                                        className="glass-card text-white font-semibold px-10 py-5 rounded-2xl text-lg flex items-center gap-4 hover:border-[#bff227]/50 transition-all duration-300 group hover:-translate-y-1"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#bff227]/20 flex items-center justify-center group-hover:bg-[#bff227]/30 transition-colors">
                                            <i className="fas fa-play text-[#bff227]"></i>
                                        </div>
                                        <span>Comment ça marche</span>
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
                                        <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">par dépôt</div>
                                    </div>

                                    <div className="glass-card rounded-2xl p-6 text-center hover:border-[#bff227]/40 transition-all duration-300 hover:-translate-y-1">
                                        <div className="font-display text-4xl md:text-5xl font-bold mb-2">
                                            <span className="text-[#bff227]">&lt;</span>
                                            <span className="text-gradient-animated">30</span>
                                            <span className="text-white">s</span>
                                        </div>
                                        <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">confirmation</div>
                                    </div>

                                    <div className="glass-card rounded-2xl p-6 text-center hover:border-[#bff227]/40 transition-all duration-300 hover:-translate-y-1">
                                        <div className="font-display text-4xl md:text-5xl font-bold mb-2">
                                            <span className="text-gradient-animated">∞</span>
                                        </div>
                                        <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">durée de validité</div>
                                    </div>
                                </motion.div>

                                {/* Scroll Indicator */}
                                <motion.div
                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                                    variants={itemVariants}
                                >
                                    <span className="text-gray-500 text-xs uppercase tracking-widest">Découvrir</span>
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
                                    Ancré sur <span className="text-[#bff227] font-semibold">Polygon</span> • Ultra rapide • Économique
                                </span>
                            </div>
                            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
                                <span className="text-white">Protégez vos</span>
                                <br className="hidden sm:block" />
                                <span className="text-gradient-animated">créations</span>
                                <br />
                                <span className="text-white">sur la </span>
                                <span className="bg-gradient-to-r from-[#bff227] via-white to-white bg-clip-text text-transparent">
                                    blockchain
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-14 leading-relaxed">
                                Prouvez l&apos;antériorité de vos œuvres en quelques clics.
                            </p>
                        </div>
                    )}
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 px-4 relative bg-black">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                Tout ce dont vous avez <span className="text-[#bff227]">besoin</span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Une solution complète pour protéger votre propriété intellectuelle
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
                                    <h3 className="font-display text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section id="how-it-works" className="py-24 px-4 relative overflow-hidden bg-black">
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
                                Comment ça <span className="text-[#bff227]">marche</span> ?
                            </h2>
                            <p className="text-gray-400 text-lg">3 étapes simples pour protéger vos créations</p>
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
                                    <h3 className="font-display text-xl font-bold text-white mb-3">{step.title}</h3>
                                    <p className="text-gray-400">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-4 bg-black">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            className="glass-card rounded-3xl p-12 text-center relative overflow-hidden"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#bff227]/10 via-transparent to-white/10"></div>
                            <div className="relative z-10">
                                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                                    Prêt à protéger vos créations ?
                                </h2>
                                <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                                    Rejoignez les créateurs qui font confiance à la blockchain pour sécuriser leur propriété intellectuelle.
                                </p>
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center gap-3 btn-aurora text-white font-semibold px-8 py-4 rounded-2xl text-lg"
                                >
                                    <i className="fas fa-shield-alt"></i>
                                    Créer mon compte gratuitement
                                    <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

const features = [
    {
        icon: 'fas fa-fingerprint text-[#bff227]',
        gradient: 'bg-gradient-to-br from-[#bff227]/20 to-purple-600/10',
        title: 'Hash SHA-256',
        description: 'Empreinte unique et irréversible de votre fichier. Impossible à falsifier.',
    },
    {
        icon: 'fas fa-link text-white',
        gradient: 'bg-gradient-to-br from-[#bff227]/20 to-violet-600/10',
        title: 'Ancrage Blockchain',
        description: 'Votre preuve est enregistrée sur Polygon, une blockchain sécurisée et écologique.',
    },
    {
        icon: 'fas fa-certificate text-[#bff227]',
        gradient: 'bg-gradient-to-br from-[#bff227]/20 to-purple-600/10',
        title: 'Certificat PDF',
        description: 'Téléchargez un certificat officiel avec QR code pour prouver votre antériorité.',
    },
    {
        icon: 'fas fa-clock text-amber-400',
        gradient: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10',
        title: 'Horodatage UTC',
        description: 'Date et heure précises enregistrées on-chain. Preuve légale incontestable.',
    },
    {
        icon: 'fas fa-shield-alt text-rose-400',
        gradient: 'bg-gradient-to-br from-rose-500/20 to-rose-600/10',
        title: 'RGPD Compliant',
        description: 'Vos données personnelles sont protégées. Seul le hash est public.',
    },
    {
        icon: 'fas fa-wallet text-indigo-400',
        gradient: 'bg-gradient-to-br from-[#bff227]/20 to-indigo-600/10',
        title: 'Sans Wallet',
        description: 'Aucune connaissance Web3 requise. Nous gérons tout pour vous.',
    },
];

const steps = [
    {
        title: 'Uploadez votre fichier',
        description: 'Musique, image, vidéo, texte, PDF... Glissez-déposez votre création.',
        gradient: 'bg-gradient-to-br from-[#bff227] to-purple-600',
        shadow: 'shadow-[#bff227]/30',
    },
    {
        title: 'Remplissez les métadonnées',
        description: 'Titre, description, type de projet, auteurs... Personnalisez votre dépôt.',
        gradient: 'bg-gradient-to-br from-[#bff227] to-violet-600',
        shadow: 'shadow-violet-500/30',
    },
    {
        title: 'Obtenez votre certificat',
        description: 'Votre preuve est ancrée sur la blockchain. Téléchargez votre certificat PDF.',
        gradient: 'bg-gradient-to-br from-[#bff227] to-indigo-600',
        shadow: 'shadow-indigo-500/30',
    },
];
