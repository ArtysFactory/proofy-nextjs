'use client';

// ============================================
// PROOFY - Language Switcher component
// Uses next-intl's Link for proper locale switching
// ============================================

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags, defaultLocale, type Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
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

  // Get the path with the new locale
  const getLocalizedPath = useCallback((newLocale: Locale) => {
    // Remove leading slash and split
    const pathWithoutLeadingSlash = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const segments = pathWithoutLeadingSlash.split('/');
    
    // Check if first segment is a locale
    if (segments[0] && locales.includes(segments[0] as Locale)) {
      // Replace existing locale with new one
      segments[0] = newLocale;
    } else {
      // No locale in path, prepend the new locale
      segments.unshift(newLocale);
    }
    
    // Always return path with explicit locale prefix
    // This ensures the middleware correctly sets the locale cookie
    const newPath = '/' + segments.filter(Boolean).join('/');
    return newPath || `/${newLocale}`;
  }, [pathname]);

  // Handle language change with full page navigation
  const handleLanguageChange = useCallback((newLocale: Locale) => {
    setIsOpen(false);
    
    // If same locale, do nothing
    if (newLocale === locale) {
      return;
    }
    
    const newPath = getLocalizedPath(newLocale);
    
    // Force full page reload to ensure locale change takes effect
    // This is more reliable than client-side navigation for locale switching
    window.location.href = newPath;
  }, [locale, getLocalizedPath]);

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
            <button
              key={loc}
              onClick={() => handleLanguageChange(loc)}
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
