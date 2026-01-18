'use client';

import { useEffect, useState } from 'react';

interface HeroTypewriterProps {
  line1: string;
  rotatingWords: string[];
  suffix: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
  initialDelay?: number;
}

export function HeroTypewriter({
  line1,
  rotatingWords,
  suffix,
  typingSpeed = 80,
  deletingSpeed = 50,
  delayBetweenWords = 2000,
  initialDelay = 500,
}: HeroTypewriterProps) {
  // State for line 1 (types once then stays)
  const [line1Text, setLine1Text] = useState('');
  const [line1Complete, setLine1Complete] = useState(false);

  // State for rotating words (line 2)
  const [currentWord, setCurrentWord] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rotationStarted, setRotationStarted] = useState(false);

  // Cursor states
  const [showCursor1, setShowCursor1] = useState(true);
  const [showCursor2, setShowCursor2] = useState(false);

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
      if (!line1Complete) {
        setShowCursor1((prev) => !prev);
      }
    }, 530);

    return () => clearInterval(interval);
  }, [line1Complete]);

  // Keep cursor2 always visible after line1 completes (no blinking for rotating text)
  useEffect(() => {
    if (line1Complete) {
      setShowCursor2(true);
    }
  }, [line1Complete]);

  return (
    <div className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
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

      {/* Line 2: [rotating word] + suffix (sur la blockchain) */}
      {line1Complete && (
        <div className="min-h-[1.2em] whitespace-nowrap">
          <span className="text-[#bff227] inline-block min-w-[1ch]">
            {currentWord}
          </span>
          <span className="text-white"> {suffix}</span>
          <span 
            className="inline-block w-[3px] h-[0.9em] bg-[#bff227] ml-1 align-middle"
            style={{ opacity: showCursor2 ? 1 : 0, transition: 'opacity 0.1s' }}
          />
        </div>
      )}
    </div>
  );
}

export default HeroTypewriter;
