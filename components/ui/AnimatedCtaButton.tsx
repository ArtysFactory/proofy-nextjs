'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import LocaleLink from '@/components/LocaleLink';

interface AnimatedCtaButtonProps {
  href: string;
  text: string;
  subtext?: string;
}

export default function AnimatedCtaButton({ href, text, subtext }: AnimatedCtaButtonProps) {
  return (
    <LocaleLink href={href} className="group relative">
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* Glow effect behind button */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#bff227] via-[#d4ff4a] to-[#bff227] rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
        
        {/* Main button */}
        <div className="relative bg-gradient-to-r from-[#bff227] to-[#c8f53d] rounded-2xl px-8 py-4 flex items-center gap-4">
          {/* Animated icon container */}
          <motion.div 
            className="relative w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
            
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-black/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            />
          </motion.div>
          
          {/* Text content */}
          <div className="flex flex-col items-start">
            <span className="text-black font-bold text-lg leading-tight">
              {text}
            </span>
            {subtext && (
              <span className="text-black/60 text-sm font-medium">
                {subtext}
              </span>
            )}
          </div>
          
          {/* Arrow indicator */}
          <motion.div
            className="ml-2"
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
          >
            <svg 
              className="w-5 h-5 text-black/70" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.div>
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 skew-x-12" />
          
          {/* Sparkle particles */}
          <motion.div
            className="absolute top-2 right-8 w-1.5 h-1.5 bg-white rounded-full"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0 }}
          />
          <motion.div
            className="absolute bottom-3 right-16 w-1 h-1 bg-white rounded-full"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          />
          <motion.div
            className="absolute top-4 right-20 w-1 h-1 bg-white/80 rounded-full"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
          />
        </div>
      </motion.div>
    </LocaleLink>
  );
}
