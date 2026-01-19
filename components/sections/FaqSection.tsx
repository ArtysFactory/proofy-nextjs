'use client';

// ============================================
// FaqSection - Accordion FAQ
// Motion: fadeInUpItem + AnimatePresence for accordion
// Icon rotates 45° when expanded
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { fadeInUpItem, motionDurations, motionEasing } from '@/lib/motionConfig';

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

export function FaqSection() {
  const t = useTranslations('home.faq');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <AnimatedSection 
      id="faq" 
      className="py-24 px-4 relative bg-black"
    >
      <div className="max-w-3xl mx-auto">
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

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqKeys.map((faq, index) => {
            const isOpen = activeIndex === index;
            
            return (
              <motion.div
                key={faq}
                variants={fadeInUpItem}
                className="glass-card rounded-2xl border border-white/5 overflow-hidden"
              >
                {/* Question button */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white pr-4">
                    {t(`${faq}.question`)}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ 
                      duration: motionDurations.base, 
                      ease: motionEasing.default 
                    }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#bff227]' : 'text-gray-400'}`} />
                  </motion.span>
                </button>
                
                {/* Answer content with AnimatePresence */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: 'auto', 
                        opacity: 1,
                        transition: {
                          height: { duration: motionDurations.base, ease: motionEasing.default },
                          opacity: { duration: motionDurations.base, delay: 0.1 }
                        }
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0,
                        transition: {
                          height: { duration: motionDurations.base, ease: motionEasing.default },
                          opacity: { duration: motionDurations.fast }
                        }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                        {t(`${faq}.answer`)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}

export default FaqSection;
