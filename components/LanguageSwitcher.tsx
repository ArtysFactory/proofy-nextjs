'use client';

// ============================================
// PROOFY - Language Switcher component
// Uses next-intl's Link for proper locale switching
// ============================================

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get the path without the current locale
  const getLocalizedPath = (newLocale: Locale) => {
    // Remove leading slash and split
    const pathWithoutLeadingSlash = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const segments = pathWithoutLeadingSlash.split('/');
    
    // Check if first segment is a locale
    if (segments[0] && locales.includes(segments[0] as Locale)) {
      // Replace existing locale
      segments[0] = newLocale;
    } else {
      // No locale in path, prepend new locale
      segments.unshift(newLocale);
    }
    
    // Rebuild path
    const newPath = '/' + segments.filter(Boolean).join('/');
    return newPath || `/${newLocale}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{localeFlags[locale as Locale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          {locales.map((loc) => (
            <Link
              key={loc}
              href={getLocalizedPath(loc)}
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                locale === loc
                  ? 'bg-[#bff227]/10 text-[#bff227]'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-lg">{localeFlags[loc]}</span>
              <span className="text-sm font-medium">{localeNames[loc]}</span>
              {locale === loc && (
                <span className="ml-auto text-[#bff227]">✓</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
