'use client';

// ============================================
// StoryBlocksSection - Artistes / Créateurs IA
// Motion: fadeInUpItem + progress bar on hover
// Reusable for both Artists and AI Creators sections
// ============================================

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Music, Sparkles, LucideIcon } from 'lucide-react';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { fadeInUpItem, progressBar } from '@/lib/motionConfig';
import LocaleLink from '@/components/LocaleLink';

interface StoryBlocksSectionProps {
  /** Section ID for navigation */
  id: string;
  /** Translation namespace (e.g., 'home.artists' or 'home.aiCreators') */
  translationKey: 'artists' | 'aiCreators';
  /** Icon component for the header */
  icon: LucideIcon;
  /** Gradient colors for icon background */
  iconGradient: string;
  /** Shadow color for icon */
  iconShadow: string;
  /** Accent color for highlights */
  accentColor: string;
  /** Progress bar gradient */
  progressGradient: string;
  /** Background decoration color */
  bgDecorationColor: string;
  /** Show punchline quote (for AI section) */
  showPunchline?: boolean;
}

const blockKeys = ['block1', 'block2', 'block3', 'block4'] as const;

export function StoryBlocksSection({
  id,
  translationKey,
  icon: Icon,
  iconGradient,
  iconShadow,
  accentColor,
  progressGradient,
  bgDecorationColor,
  showPunchline = false,
}: StoryBlocksSectionProps) {
  const t = useTranslations(`home.${translationKey}`);

  return (
    <AnimatedSection 
      id={id} 
      className="py-24 px-4 relative bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background decoration */}
      <div 
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: bgDecorationColor }}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with Icon */}
        <motion.div
          variants={fadeInUpItem}
          className="flex flex-col lg:flex-row items-center gap-12 mb-16"
        >
          {/* Icon Box */}
          <div className="flex-shrink-0">
            <div 
              className={`w-24 h-24 ${iconGradient} rounded-3xl flex items-center justify-center shadow-2xl`}
              style={{ boxShadow: `0 25px 50px -12px ${iconShadow}` }}
            >
              <Icon className={`w-12 h-12 ${translationKey === 'artists' ? 'text-black' : 'text-white'}`} />
            </div>
          </div>
          
          {/* Title & Subtitle */}
          <div className="text-center lg:text-left">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              {t('title')}{' '}
              <span style={{ color: accentColor }}>{t('titleHighlight')}</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl">
              {t('subtitle')}
            </p>
          </div>
        </motion.div>

        {/* Story Blocks Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {blockKeys.map((block) => (
            <motion.div
              key={block}
              variants={fadeInUpItem}
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-[1px] backdrop-blur"
            >
              <div className="relative h-full rounded-[23px] bg-neutral-950/80 p-8">
                {/* Progress bar on hover */}
                <motion.div
                  className={`absolute inset-x-0 bottom-0 h-0.5 ${progressGradient}`}
                  variants={progressBar}
                />
                
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {t(`${block}.title`)}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {t(`${block}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Punchline (for AI section) */}
        {showPunchline && (
          <motion.blockquote
            variants={fadeInUpItem}
            className="text-center mb-12"
          >
            <p className="text-2xl md:text-3xl font-display font-bold italic" style={{ color: accentColor }}>
              {t('punchline')}
            </p>
          </motion.blockquote>
        )}

        {/* CTA Button */}
        <motion.div
          variants={fadeInUpItem}
          className="text-center"
        >
          <LocaleLink
            href="/signup"
            className={`inline-flex items-center gap-3 ${iconGradient} ${translationKey === 'artists' ? '!text-black' : 'text-white'} font-bold px-8 py-4 rounded-2xl text-lg shadow-xl transition-all duration-300 hover:scale-105`}
            style={{ boxShadow: `0 20px 40px -12px ${iconShadow}` }}
          >
            <Icon className="w-5 h-5" />
            {t('cta')}
          </LocaleLink>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

// Pre-configured sections for convenience
export function ArtistsSection() {
  return (
    <StoryBlocksSection
      id="artists"
      translationKey="artists"
      icon={Music}
      iconGradient="bg-gradient-to-br from-[#bff227] to-[#9dcc1e]"
      iconShadow="rgba(191, 242, 39, 0.3)"
      accentColor="#bff227"
      progressGradient="bg-gradient-to-r from-[#bff227]/0 via-[#bff227]/70 to-[#bff227]/0"
      bgDecorationColor="rgba(191, 242, 39, 0.05)"
    />
  );
}

export function AICreatorsSection() {
  return (
    <StoryBlocksSection
      id="ai-creators"
      translationKey="aiCreators"
      icon={Sparkles}
      iconGradient="bg-gradient-to-br from-purple-500 to-violet-600"
      iconShadow="rgba(168, 85, 247, 0.3)"
      accentColor="#a855f7"
      progressGradient="bg-gradient-to-r from-purple-500/0 via-purple-500/70 to-purple-500/0"
      bgDecorationColor="rgba(168, 85, 247, 0.05)"
      showPunchline
    />
  );
}

export default StoryBlocksSection;
