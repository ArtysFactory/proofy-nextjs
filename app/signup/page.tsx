'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        country: 'FR',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    country: formData.country,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'inscription');
            }

            // Success - redirect to login
            router.push('/login?message=account-created');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="aurora-bg">
                    <div className="aurora-stars"></div>
                    <div className="aurora-layer"></div>
                    <div className="aurora-layer aurora-layer-2"></div>
                </div>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Aurora Background */}
            <div className="aurora-bg">
                <div className="aurora-stars"></div>
                <div className="aurora-layer"></div>
                <div className="aurora-layer aurora-layer-2"></div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key="signup-form"
                    className="w-full max-w-2xl relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-3 mb-8">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl rotate-6"></div>
                        <div className="absolute inset-0 bg-[#0b0124] rounded-xl flex items-center justify-center">
                            <i className="fas fa-shield-halved text-[#bff227] text-xl"></i>
                        </div>
                    </div>
                    <span className="font-display font-bold text-2xl bg-gradient-to-r from-[#bff227] to-white bg-clip-text text-transparent">
                        Proofy
                    </span>
                </Link>

                {/* Signup Card */}
                <div className="glass-card rounded-3xl p-8">
                    <h1 className="font-display text-3xl font-bold text-white mb-2 text-center">
                        Créer un compte
                    </h1>
                    <p className="text-gray-400 text-center mb-8">
                        Commencez à protéger vos créations sur la blockchain
                    </p>

                    {error && (
                        <motion.div
                            className="mb-6 p-4 glass-card border-red-500/30 text-red-400 rounded-xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                                    Prénom
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                    placeholder="Jean"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                                    Nom
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                    placeholder="Dupont"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
                                Pays
                            </label>
                            <select
                                id="country"
                                required
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                            >
                                <option value="FR">France</option>
                                <option value="BE">Belgique</option>
                                <option value="CH">Suisse</option>
                                <option value="CA">Canada</option>
                                <option value="US">États-Unis</option>
                                <option value="OTHER">Autre</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                    placeholder="••••••••"
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-start">
                            <input type="checkbox" required className="mt-1 mr-2" />
                            <span className="text-sm text-gray-400">
                                J'accepte les{' '}
                                <Link href="/terms" className="text-[#bff227] hover:underline">
                                    conditions d'utilisation
                                </Link>{' '}
                                et la{' '}
                                <Link href="/privacy" className="text-[#bff227] hover:underline">
                                    politique de confidentialité
                                </Link>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-aurora font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="loader w-5 h-5 border-2"></div>
                                    Création du compte...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-user-plus"></i>
                                    Créer mon compte
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Vous avez déjà un compte ?{' '}
                            <Link href="/login" className="text-[#bff227] hover:underline font-semibold">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                        <i className="fas fa-arrow-left mr-2"></i>
                        Retour à l'accueil
                    </Link>
                </div>
            </motion.div>
            </AnimatePresence>
        </div>
    );
}
