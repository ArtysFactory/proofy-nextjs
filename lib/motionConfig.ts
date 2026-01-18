// ============================================
// UNLMTDPROOF - Motion System Configuration
// Tokens, variants, and transitions for Framer Motion
// Style: Sobre, confiance / juridique / on-chain
// ============================================

import { Variants, Transition } from "framer-motion";

// ============================================
// 1. DURATION TOKENS
// ============================================
export const motionDurations = {
  fast: 0.18,   // Micro hover, tap
  base: 0.26,   // Textes, cards
  slow: 0.45,   // Section + stagger
} as const;

// ============================================
// 2. EASING TOKENS
// ============================================
export const motionEasing = {
  // Tweens UI - Material-esque curve
  default: [0.22, 0.61, 0.36, 1] as const,
  // Alternative for exits
  out: [0.0, 0.0, 0.2, 1] as const,
  // Alternative for entries
  in: [0.4, 0.0, 1, 1] as const,
};

// ============================================
// 3. SPRING TOKENS
// ============================================
export const motionSpring = {
  // Cards hover - bouncy but controlled
  cardHover: {
    type: "spring" as const,
    stiffness: 260,
    damping: 22,
  },
  // Softer spring for larger elements
  soft: {
    type: "spring" as const,
    stiffness: 120,
    damping: 20,
  },
};

// ============================================
// 4. SECTION TRANSITIONS
// ============================================
export const sectionTransition: Transition = {
  duration: motionDurations.slow,
  ease: motionEasing.default,
};

// ============================================
// 5. SECTION VARIANTS (scroll-reveal)
// ============================================
export const sectionVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 24 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...sectionTransition,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

// ============================================
// 6. ITEM VARIANTS
// ============================================

// Standard fade-in-up for items within sections
export const fadeInUpItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 12 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: motionDurations.base, 
      ease: motionEasing.default 
    },
  },
};

// Larger movement for hero/featured elements
export const fadeInUpLarge: Variants = {
  hidden: { 
    opacity: 0, 
    y: 24 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: motionDurations.slow, 
      ease: motionEasing.default 
    },
  },
};

// Scale variant for icons/badges
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: motionDurations.base, 
      ease: motionEasing.default 
    },
  },
};

// ============================================
// 7. CARD HOVER VARIANTS
// ============================================
export const cardHover: Variants = {
  rest: { 
    y: 0, 
    scale: 1, 
    boxShadow: "0 0 0 rgba(0,0,0,0)" 
  },
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
    transition: motionSpring.cardHover,
  },
};

// Subtle lift for smaller interactive elements
export const subtleLift: Variants = {
  rest: { 
    y: 0 
  },
  hover: {
    y: -2,
    transition: motionSpring.cardHover,
  },
};

// ============================================
// 8. ACCORDION VARIANTS
// ============================================
export const accordionContent: Variants = {
  collapsed: { 
    opacity: 0, 
    height: 0 
  },
  expanded: { 
    opacity: 1, 
    height: "auto",
    transition: {
      duration: motionDurations.base,
      ease: motionEasing.default,
    }
  },
};

export const accordionIcon: Variants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 45 },
};

// ============================================
// 9. PROGRESS BAR VARIANT (for StoryBlocks)
// ============================================
export const progressBar: Variants = {
  rest: { 
    scaleX: 0,
    originX: 0,
  },
  hover: {
    scaleX: 1,
    transition: {
      duration: 0.4,
      ease: motionEasing.default,
    },
  },
};

// ============================================
// 10. STAGGER CONTAINER VARIANTS
// ============================================
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Faster stagger for grids
export const fastStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// ============================================
// 11. BUTTON VARIANTS
// ============================================
export const buttonHover: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: motionSpring.cardHover,
  },
  tap: { 
    scale: 0.98,
    transition: { duration: motionDurations.fast },
  },
};

// ============================================
// 12. UTILITY FUNCTIONS
// ============================================

/**
 * Create a delayed fade-in-up variant
 * @param delay - Delay in seconds before animation starts
 */
export const createDelayedFadeInUp = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: motionDurations.base, 
      ease: motionEasing.default,
      delay,
    },
  },
});

/**
 * Create stagger container with custom timing
 * @param stagger - Time between children animations
 * @param delay - Initial delay before first child
 */
export const createStaggerContainer = (stagger: number = 0.08, delay: number = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});
