'use client';

// ============================================
// UNLMTDPROOF - Landing Page
// Refactored with Motion System components
// Hero stays custom, all other sections use AnimatedSection
// ============================================

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, ChevronDown } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LocaleLink from '@/components/LocaleLink';
import HeroTypewriter from '@/components/ui/HeroTypewriter';

// Section components with Motion System
import {
  ProblemSection,
  ArtistsSection,
  AICreatorsSection,
  StepsSection,
  PricingSection,
  FaqSection,
  TrustSection,
  FinalCtaSection,
} from '@/components/sections';

// Motion config for Hero (custom, not using AnimatedSection)
import { motionDurations, motionEasing } from '@/lib/motionConfig';

export default function HomePage() {
  const t = useTranslations('home');
  const heroRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hero animation variants (custom for hero section)
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: motionDurations.slow, 
        ease: motionEasing.default 
      },
    },
  };

  return (
    <>
      <Navbar />

      <main className="relative z-10 pt-16">
        {/* ========================================
            HERO SECTION - Custom (no AnimatedSection)
            Emotional tension with typewriter effect
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
          <div 
            className="absolute inset-0 pointer-events-none z-[1]" 
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(191, 242, 39, 0.12) 0%, transparent 50%)'
            }} 
          />

          {/* Main Content */}
          <AnimatePresence>
            {isMounted && (
              <motion.div
                className="max-w-5xl mx-auto text-center relative z-10 py-20"
                variants={heroContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 border border-[#bff227]/30"
                  variants={heroItemVariants}
                >
                  <div className="w-2 h-2 bg-[#bff227] rounded-full animate-pulse" />
                  <span className="text-gray-300 text-sm">
                    {t('hero.badge')} • {t('hero.badgeFast')} • {t('hero.badgeCheap')}
                  </span>
                </motion.div>

                {/* Main Title - Typewriter effect 3 lines */}
                <motion.div
                  className="mb-8"
                  variants={heroItemVariants}
                >
                  <HeroTypewriter
                    line1={t('hero.line1')}
                    line3={t('hero.line3')}
                    rotatingWords={t.raw('hero.rotatingWords') as string[]}
                  />
                </motion.div>

                {/* Subtitle */}
                <motion.p
                  className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
                  variants={heroItemVariants}
                >
                  {t('hero.subtitle').split(t('hero.subtitleHighlight'))[0]}
                  <span className="text-[#bff227] font-semibold">
                    {t('hero.subtitleHighlight')}
                  </span>
                  {t('hero.subtitle').split(t('hero.subtitleHighlight'))[1]}
                  <br className="hidden md:block" />
                  <span className="text-gray-400">{t('hero.subtitleEnd')}</span>
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
                  variants={heroItemVariants}
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
                  variants={heroItemVariants}
                >
                  {t('hero.microText')}
                </motion.p>

                {/* Scroll indicator */}
                <motion.div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                  variants={heroItemVariants}
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <span className="text-gray-500 text-xs uppercase tracking-widest">
                    {t('hero.discover')}
                  </span>
                  <ChevronDown className="w-5 h-5 text-[#bff227]" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ========================================
            SECTIONS with Motion System
            All wrapped with AnimatedSection (scroll-reveal)
        ======================================== */}
        
        {/* Problem Section - 4 Pillars */}
        <ProblemSection />

        {/* Artists Section */}
        <ArtistsSection />

        {/* AI Creators Section */}
        <AICreatorsSection />

        {/* How It Works - 3 Steps */}
        <StepsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <FaqSection />

        {/* Trust Section */}
        <TrustSection />

        {/* Final CTA Section */}
        <FinalCtaSection />
      </main>

      <Footer />
    </>
  );
}
