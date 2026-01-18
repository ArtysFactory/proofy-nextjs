'use client';

// ============================================
// TrustSection - Partner/Trust badges
// Motion: fadeInUpItem
// ============================================

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield, Globe } from 'lucide-react';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { fadeInUpItem } from '@/lib/motionConfig';

export function TrustSection() {
  const t = useTranslations('home.trust');

  return (
    <AnimatedSection 
      id="trust" 
      className="py-24 px-4 relative bg-[#0a0a0a]"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div variants={fadeInUpItem}>
          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('title')}{' '}
            <span className="text-[#bff227]">{t('titleHighlight')}</span>
          </h2>
          
          {/* Description */}
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            {t('description')}
          </p>
          
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
              <Shield className="w-4 h-4 text-[#bff227]" />
              <span className="text-gray-300 text-sm">{t('badge1')}</span>
            </div>
            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
              <Globe className="w-4 h-4 text-[#bff227]" />
              <span className="text-gray-300 text-sm">{t('badge2')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

export default TrustSection;
