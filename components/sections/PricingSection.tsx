'use client';

// ============================================
// PricingSection - Pricing packs with cardHover
// Motion: fadeInUpItem + cardHover on pricing cards
// ============================================

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { fadeInUpItem, cardHover } from '@/lib/motionConfig';
import LocaleLink from '@/components/LocaleLink';

const packKeys = ['starter', 'creator', 'pro', 'studio'] as const;
const reassuranceKeys = ['noSubscription', 'noHiddenFees', 'noExpiration', 'frenchBilling'] as const;

export function PricingSection() {
  const t = useTranslations('home.pricing');

  return (
    <AnimatedSection 
      id="pricing" 
      className="py-24 px-4 relative bg-[#0a0a0a]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header 
          variants={fadeInUpItem} 
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t('title')}{' '}
            <span className="text-[#bff227]">{t('titleHighlight')}</span>
          </h2>
          <p className="text-gray-400 text-lg">
            {t('subtitle')}
          </p>
        </motion.header>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packKeys.map((pack) => {
            const isPopular = t.raw(`${pack}.popular`) === true;
            
            return (
              <motion.article
                key={pack}
                variants={fadeInUpItem}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="h-full"
              >
                <motion.div
                  variants={cardHover}
                  className={`relative h-full rounded-3xl p-[1px] border transition-all duration-300 ${
                    isPopular 
                      ? 'bg-gradient-to-b from-[#bff227]/20 to-transparent border-[#bff227]/50 shadow-xl shadow-[#bff227]/10' 
                      : 'border-white/10 bg-white/5 backdrop-blur hover:border-[#bff227]/30'
                  }`}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#bff227] text-black text-xs font-bold px-4 py-1 rounded-full z-10">
                      POPULAIRE
                    </div>
                  )}
                  
                  <div className="flex h-full flex-col rounded-[23px] bg-neutral-950/80 p-6">
                    {/* Pack name */}
                    <h3 className="font-display text-xl font-bold text-white mb-2">
                      {t(`${pack}.name`)}
                    </h3>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">
                        {t(`${pack}.price`)}€
                      </span>
                    </div>
                    
                    {/* Price per deposit */}
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <span className="text-[#bff227] font-semibold">
                        {t(`${pack}.pricePerDeposit`)}€
                      </span>
                      <span className="text-gray-500">{t('perDeposit')}</span>
                    </div>
                    
                    {/* Deposits count */}
                    <div className="text-gray-400 text-sm mb-4">
                      {t(`${pack}.deposits`)} {t('deposits')}
                    </div>
                    
                    {/* Ideal for */}
                    <div className="text-gray-500 text-xs mt-auto">
                      {t('idealFor')}: {t(`${pack}.idealFor`)}
                    </div>
                  </div>
                </motion.div>
              </motion.article>
            );
          })}
        </div>

        {/* INPI Comparison */}
        <motion.div
          variants={fadeInUpItem}
          className="glass-card rounded-2xl p-6 mb-12 border border-[#bff227]/20 max-w-2xl mx-auto"
        >
          <h4 className="font-semibold text-white mb-3">{t('comparison.title')}</h4>
          <p className="text-gray-400 text-sm mb-2">{t('comparison.inpi')}</p>
          <p className="text-[#bff227] font-semibold">{t('comparison.unlmtdproof')}</p>
        </motion.div>

        {/* Reassurance badges */}
        <motion.div
          variants={fadeInUpItem}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {reassuranceKeys.map((badge) => (
            <div 
              key={badge} 
              className="flex items-center gap-2 text-gray-300 text-sm"
            >
              <Check className="w-4 h-4 text-[#bff227]" />
              <span>{t(`reassurance.${badge}`)}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={fadeInUpItem}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <LocaleLink
            href="/signup"
            className="bg-gradient-to-r from-[#bff227] to-[#9dcc1e] !text-black font-bold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-[#bff227]/20 hover:shadow-[#bff227]/40 transition-all duration-300 hover:scale-105"
          >
            {t('cta')}
          </LocaleLink>
          <LocaleLink
            href="/signup"
            className="glass-card text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:border-[#bff227]/50 transition-all duration-300"
          >
            {t('ctaSecondary')}
          </LocaleLink>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

export default PricingSection;
