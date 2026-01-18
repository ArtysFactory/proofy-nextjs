'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LocaleLink from '@/components/LocaleLink';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/ui/Logo';

export default function Navbar() {
    const t = useTranslations('nav');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0a0a0a] ${
                isScrolled
                    ? 'border-b border-white/5'
                    : ''
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Logo size="md" linkTo="/" />

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <a
                            href="#features"
                            className="text-gray-300 hover:text-[#bff227] transition-colors text-sm"
                        >
                            {t('features')}
                        </a>
                        <a
                            href="#how-it-works"
                            className="text-gray-300 hover:text-[#bff227] transition-colors text-sm"
                        >
                            {t('howItWorks')}
                        </a>
                        <LocaleLink
                            href="/login"
                            className="text-gray-300 hover:text-white transition-colors text-sm"
                        >
                            {t('login')}
                        </LocaleLink>
                        <LocaleLink
                            href="/signup"
                            className="px-5 py-2 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0b0124] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#bff227]/20 transition-all duration-300 text-sm"
                        >
                            {t('getStarted')}
                        </LocaleLink>
                        
                        {/* Language Switcher */}
                        <LanguageSwitcher />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <LanguageSwitcher />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white p-2"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/5">
                        <div className="flex flex-col gap-4">
                            <a
                                href="#features"
                                className="text-gray-300 hover:text-[#bff227] transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('features')}
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-gray-300 hover:text-[#bff227] transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('howItWorks')}
                            </a>
                            <LocaleLink
                                href="/login"
                                className="text-gray-300 hover:text-white transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('login')}
                            </LocaleLink>
                            <LocaleLink
                                href="/signup"
                                className="px-5 py-2 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0b0124] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#bff227]/20 transition-all duration-300 text-center"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('getStarted')}
                            </LocaleLink>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
