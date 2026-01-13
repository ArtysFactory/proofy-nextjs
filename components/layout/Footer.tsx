'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative z-10 border-t border-white/5 bg-[#0b0124]/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#bff227] to-[#9dd11e] rounded-lg flex items-center justify-center">
                                <span className="text-[#0b0124] font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Proofy
                            </span>
                        </Link>
                        <p className="text-gray-400 max-w-md mb-4">
                            Protégez vos créations avec la blockchain. Une preuve d'antériorité immuable et vérifiable pour tous vos contenus.
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
                        <h3 className="text-white font-semibold mb-4">Produit</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/#features" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    Fonctionnalités
                                </Link>
                            </li>
                            <li>
                                <Link href="/#how-it-works" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    Comment ça marche
                                </Link>
                            </li>
                            <li>
                                <Link href="/#pricing" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    Tarifs
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Légal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    Conditions d'utilisation
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    Politique de confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    Mentions légales
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-[#bff227] transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} Proofy. Tous droits réservés.
                        </p>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            Ancré sur
                            <span className="text-[#bff227] font-semibold">Polygon</span>
                            <span className="w-2 h-2 bg-[#bff227] rounded-full animate-pulse"></span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
