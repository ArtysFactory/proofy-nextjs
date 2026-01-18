'use client';

// ============================================
// AnimatedSection - Scroll-reveal wrapper
// Applies to ALL sections except Hero
// Uses useInView with once: true for first-visit only
// ============================================

import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { sectionVariants } from '@/lib/motionConfig';

interface AnimatedSectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  /** Custom margin for triggering animation (default: -100px) */
  viewMargin?: string;
  /** Whether to animate only once (default: true) */
  once?: boolean;
}

export function AnimatedSection({ 
  id, 
  className, 
  children,
  viewMargin = "-100px",
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { 
    once, 
    margin: viewMargin as `${number}px` 
  });

  return (
    <motion.section
      id={id}
      ref={ref}
      className={className}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.section>
  );
}

export default AnimatedSection;
