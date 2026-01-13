'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-[#0b0124]/80 backdrop-blur-xl border-b border-white/5'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-[#bff227] to-[#9dd11e] rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <span className="text-[#0b0124] font-bold text-lg">P</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Proofy
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/#features"
                            className="text-gray-300 hover:text-[#bff227] transition-colors"
                        >
                            Fonctionnalités
                        </Link>
                        <Link
                            href="/#how-it-works"
                            className="text-gray-300 hover:text-[#bff227] transition-colors"
                        >
                            Comment ça marche
                        </Link>
                        <Link
                            href="/#pricing"
                            className="text-gray-300 hover:text-[#bff227] transition-colors"
                        >
                            Tarifs
                        </Link>
                        <Link
                            href="/login"
                            className="text-gray-300 hover:text-white transition-colors"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/signup"
                            className="px-5 py-2 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0b0124] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#bff227]/20 transition-all duration-300"
                        >
                            Commencer
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-white p-2"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/5">
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/#features"
                                className="text-gray-300 hover:text-[#bff227] transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Fonctionnalités
                            </Link>
                            <Link
                                href="/#how-it-works"
                                className="text-gray-300 hover:text-[#bff227] transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Comment ça marche
                            </Link>
                            <Link
                                href="/#pricing"
                                className="text-gray-300 hover:text-[#bff227] transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Tarifs
                            </Link>
                            <Link
                                href="/login"
                                className="text-gray-300 hover:text-white transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/signup"
                                className="px-5 py-2 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0b0124] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#bff227]/20 transition-all duration-300 text-center"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Commencer
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
