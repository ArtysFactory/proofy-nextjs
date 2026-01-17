'use client';

import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LocaleLink from '@/components/LocaleLink';

export default function Footer() {
    const t = useTranslations('footer');
    const tNav = useTranslations('nav');
    const tBrand = useTranslations('brand');
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative z-10 border-t border-white/5 bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <LocaleLink href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#bff227] to-[#9dd11e] rounded-lg flex items-center justify-center">
                                <span className="text-[#0b0124] font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                {tBrand('name')}
                            </span>
                        </LocaleLink>
                        <p className="text-gray-400 max-w-md mb-4">
                            {tBrand('tagline')}
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#bff227] transition-colors"
                            >
                                <Github size={20} />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#bff227] transition-colors"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#bff227] transition-colors"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a
                                href="mailto:contact@proofy.io"
                                className="text-gray-400 hover:text-[#bff227] transition-colors"
                            >
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">{tNav('home')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <LocaleLink href="/#features" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    {tNav('features')}
                                </LocaleLink>
                            </li>
                            <li>
                                <LocaleLink href="/#how-it-works" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    {tNav('howItWorks')}
                                </LocaleLink>
                            </li>
                            <li>
                                <LocaleLink href="/#pricing" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    {tNav('pricing')}
                                </LocaleLink>
                            </li>
                            <li>
                                <LocaleLink href="/dashboard" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    {tNav('dashboard')}
                                </LocaleLink>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">{t('terms')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <LocaleLink href="/terms" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    {t('terms')}
                                </LocaleLink>
                            </li>
                            <li>
                                <LocaleLink href="/privacy" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    {t('privacy')}
                                </LocaleLink>
                            </li>
                            <li>
                                <LocaleLink href="/contact" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    {t('contact')}
                                </LocaleLink>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} Proofy. {t('rights')}.
                        </p>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            {t('gdprInfo')}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
