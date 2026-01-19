'use client';

// ============================================
// StepsSection - "3 étapes. 47 secondes."
// Motion: fadeInUpItem with stagger on step cards
// ============================================

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { fadeInUpItem } from '@/lib/motionConfig';
import LocaleLink from '@/components/LocaleLink';

const stepKeys = ['step1', 'step2', 'step3'] as const;

export function StepsSection() {
  const t = useTranslations('home.howItWorks');

  return (
    <AnimatedSection 
      id="how-it-works" 
      className="py-24 px-4 relative bg-black overflow-hidden"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#bff227]/5 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.header 
          variants={fadeInUpItem} 
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t('title')}
            <br />
            <span className="text-[#bff227]">{t('titleHighlight')}</span>
          </h2>
        </motion.header>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {stepKeys.map((step, index) => (
            <motion.div
              key={step}
              variants={fadeInUpItem}
              className="relative"
            >
              {/* Connector line (hidden on mobile, shown between cards on desktop) */}
              {index < 2 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#bff227]/50 to-transparent" />
              )}
              
              {/* Card */}
              <div className="glass-card rounded-3xl p-8 text-center border border-white/5 hover:border-[#bff227]/30 transition-all duration-300 h-full">
                {/* Step number badge */}
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#bff227]/30">
                  <span className="text-black font-display text-2xl font-bold">
                    {index + 1}
                  </span>
                </div>
                
                {/* Badge label */}
                <span className="text-[#bff227] text-sm font-semibold uppercase tracking-wider">
                  {t(`${step}.badge`)}
                </span>
                
                {/* Title */}
                <h3 className="font-display text-2xl font-bold text-white mt-2 mb-2">
                  {t(`${step}.title`)}
                </h3>
                
                {/* Subtitle */}
                <p className="text-[#bff227]/80 font-medium mb-3">
                  {t(`${step}.subtitle`)}
                </p>
                
                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t(`${step}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reassurance badge */}
        <motion.div
          variants={fadeInUpItem}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full border border-[#bff227]/20">
            <Lock className="w-4 h-4 text-[#bff227]" />
            <span className="text-gray-300 text-sm">{t('reassurance')}</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeInUpItem}
          className="text-center"
        >
          <LocaleLink
            href="/signup"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#bff227] to-[#9dcc1e] !text-black font-bold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-[#bff227]/20 hover:shadow-[#bff227]/40 transition-all duration-300 hover:scale-105"
          >
            {t('cta')}
          </LocaleLink>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

export default StepsSection;
