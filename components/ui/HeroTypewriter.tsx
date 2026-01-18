'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroTypewriterProps {
  line1: string;
  line3: string;
  rotatingWords: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
  initialDelay?: number;
}

export function HeroTypewriter({
  line1,
  line3,
  rotatingWords,
  typingSpeed = 80,
  deletingSpeed = 50,
  delayBetweenWords = 2000,
  initialDelay = 500,
}: HeroTypewriterProps) {
  // State for line 1 (types once then stays)
  const [line1Text, setLine1Text] = useState('');
  const [line1Complete, setLine1Complete] = useState(false);

  // State for line 3 (types once then stays)
  const [line3Text, setLine3Text] = useState('');
  const [line3Complete, setLine3Complete] = useState(false);

  // State for rotating words (line 2)
  const [currentWord, setCurrentWord] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rotationStarted, setRotationStarted] = useState(false);

  // Cursor states
  const [showCursor1, setShowCursor1] = useState(true);
  const [showCursor2, setShowCursor2] = useState(false);
  const [showCursor3, setShowCursor3] = useState(false);

  // Type line 1 (first)
  useEffect(() => {
    if (line1Complete) return;

    const timeout = setTimeout(() => {
      if (line1Text.length < line1.length) {
        setLine1Text(line1.slice(0, line1Text.length + 1));
      } else {
        setLine1Complete(true);
        setShowCursor1(false);
        setShowCursor2(true);
        setRotationStarted(true);
      }
    }, line1Text.length === 0 ? initialDelay : typingSpeed);

    return () => clearTimeout(timeout);
  }, [line1Text, line1, line1Complete, typingSpeed, initialDelay]);

  // Type line 3 (starts at the same time as line 1)
  useEffect(() => {
    if (line3Complete) return;

    const timeout = setTimeout(() => {
      if (line3Text.length < line3.length) {
        setLine3Text(line3.slice(0, line3Text.length + 1));
      } else {
        setLine3Complete(true);
        setShowCursor3(false);
      }
    }, line3Text.length === 0 ? initialDelay + (line1.length * typingSpeed) + 200 : typingSpeed);

    return () => clearTimeout(timeout);
  }, [line3Text, line3, line3Complete, typingSpeed, initialDelay, line1.length]);

  // Rotating words animation (line 2)
  useEffect(() => {
    if (!rotationStarted) return;

    const targetWord = rotatingWords[wordIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentWord.length < targetWord.length) {
          setCurrentWord(targetWord.slice(0, currentWord.length + 1));
        } else {
          // Word complete, wait then delete
          setTimeout(() => {
            setIsDeleting(true);
          }, delayBetweenWords);
        }
      } else {
        // Deleting
        if (currentWord.length > 0) {
          setCurrentWord(currentWord.slice(0, -1));
        } else {
          // Word deleted, move to next
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentWord, isDeleting, wordIndex, rotatingWords, rotationStarted, typingSpeed, deletingSpeed, delayBetweenWords]);

  // Cursor blinking
  useEffect(() => {
    const interval = setInterval(() => {
      if (showCursor1) setShowCursor1((prev) => !prev);
      if (showCursor2) setShowCursor2((prev) => !prev);
      if (showCursor3) setShowCursor3((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [showCursor1, showCursor2, showCursor3]);

  // Keep cursor2 visible after line1 completes
  useEffect(() => {
    if (line1Complete) {
      setShowCursor2(true);
    }
  }, [line1Complete]);

  return (
    <div className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
      {/* Line 1: Protégez vos créations */}
      <div className="mb-2">
        <span className="text-white">{line1Text}</span>
        {!line1Complete && (
          <span 
            className="inline-block w-[3px] h-[0.9em] bg-[#bff227] ml-1 align-middle"
            style={{ opacity: showCursor1 ? 1 : 0, transition: 'opacity 0.1s' }}
          />
        )}
      </div>

      {/* Line 2: Rotating words (musicales, Vidéos, Images, Documents) */}
      <div className="mb-2 min-h-[1.2em]">
        <span className="text-[#bff227] inline-block">
          {currentWord}
        </span>
        {line1Complete && (
          <span 
            className="inline-block w-[3px] h-[0.9em] bg-[#bff227] ml-1 align-middle"
            style={{ opacity: showCursor2 ? 1 : 0, transition: 'opacity 0.1s' }}
          />
        )}
      </div>

      {/* Line 3: sur la blockchain */}
      <div>
        <span className="text-white">{line3Text}</span>
        {!line3Complete && line3Text.length > 0 && (
          <span 
            className="inline-block w-[3px] h-[0.9em] bg-[#bff227] ml-1 align-middle"
            style={{ opacity: showCursor3 ? 1 : 0, transition: 'opacity 0.1s' }}
          />
        )}
      </div>
    </div>
  );
}

export default HeroTypewriter;
