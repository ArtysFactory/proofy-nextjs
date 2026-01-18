'use client';

// ============================================
// FinalCtaSection - Final Call-to-Action
// Motion: fadeInUpItem with dramatic glow effect
// ============================================

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { fadeInUpItem } from '@/lib/motionConfig';
import LocaleLink from '@/components/LocaleLink';

export function FinalCtaSection() {
  const t = useTranslations('home.finalCta');

  return (
    <AnimatedSection 
      className="py-24 px-4 relative bg-gradient-to-b from-[#0a0a0a] to-black overflow-hidden"
    >
      {/* Background glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(191, 242, 39, 0.1) 0%, transparent 50%)'
        }}
      />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div variants={fadeInUpItem}>
          {/* Title */}
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
            {t('title')}{' '}
            <span className="text-[#bff227]">{t('titleHighlight')}</span>
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-400 text-lg mb-8">
            {t('subtitle')}
          </p>
          
          {/* Main CTA */}
          <LocaleLink
            href="/signup"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#bff227] to-[#9dcc1e] !text-black font-bold px-10 py-5 rounded-2xl text-xl shadow-2xl shadow-[#bff227]/30 hover:shadow-[#bff227]/50 transition-all duration-300 hover:scale-105 mb-4"
          >
            <Shield className="w-6 h-6" />
            {t('cta')}
          </LocaleLink>
          
          {/* Micro text */}
          <p className="text-gray-500 text-sm">
            {t('microText')}
          </p>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

export default FinalCtaSection;
