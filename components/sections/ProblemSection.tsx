'use client';

// ============================================
// ProblemSection - "Pourquoi UnlmtdProof" + 4 Piliers
// Motion: fadeInUpItem + cardHover on pillar cards
// ============================================

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lock, Zap, FileText, Palette, LucideIcon } from 'lucide-react';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { fadeInUpItem, cardHover } from '@/lib/motionConfig';

// Icon mapping
const pillarIcons: Record<string, LucideIcon> = {
  lock: Lock,
  zap: Zap,
  'file-text': FileText,
  palette: Palette,
};

const pillarKeys = ['pillar1', 'pillar2', 'pillar3', 'pillar4'] as const;

export function ProblemSection() {
  const t = useTranslations('home.problem');

  return (
    <AnimatedSection 
      id="why" 
      className="py-24 px-4 relative bg-gradient-to-b from-black to-[#0a0a0a]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          variants={fadeInUpItem} 
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t('title')}{' '}
            <span className="text-[#bff227]">{t('titleHighlight')}</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* 4 Pillars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillarKeys.map((pillar) => {
            const iconKey = t(`${pillar}.icon`) as keyof typeof pillarIcons;
            const Icon = pillarIcons[iconKey] || Lock;
            
            return (
              <motion.article
                key={pillar}
                variants={fadeInUpItem}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="group relative"
              >
                {/* Glassmorphism card wrapper */}
                <div className="relative rounded-3xl border border-white/5 bg-white/5 p-[1px] backdrop-blur h-full">
                  <motion.div
                    variants={cardHover}
                    className="h-full rounded-[23px] bg-neutral-950/80 p-6"
                  >
                    {/* Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-[#bff227]/20 to-[#bff227]/5 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-[#bff227]" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      {t(`${pillar}.title`)}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {t(`${pillar}.description`)}
                    </p>
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}

export default ProblemSection;
