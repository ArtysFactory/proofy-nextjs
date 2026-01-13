'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ProofData {
    id: number;
    publicId: string;
    title: string;
    description: string;
    fileHash: string;
    projectType: string;
    authors: string;
    status: string;
    createdAt: string;
    txHash?: string;
    blockNumber?: number;
    firstName: string;
    lastName: string;
}

export default function ProofPage() {
    const params = useParams();
    const [proof, setProof] = useState<ProofData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadProof();
    }, [params.id]);

    const loadProof = async () => {
        try {
            const response = await fetch(`/api/proof/${params.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Preuve introuvable');
            }

            setProof(data.creation);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: 'easeOut' },
        },
    };

    if (isLoading || !isMounted) {
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

    if (error || !proof) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="aurora-bg">
                    <div className="aurora-stars"></div>
                    <div className="aurora-layer"></div>
                    <div className="aurora-layer aurora-layer-2"></div>
                </div>
                <div className="glass-card rounded-3xl p-12 text-center max-w-md relative z-10">
                    <i className="fas fa-exclamation-triangle text-6xl text-amber-400 mb-4"></i>
                    <h1 className="font-display text-2xl font-bold text-white mb-2">
                        Preuve introuvable
                    </h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Link href="/" className="btn-aurora inline-block px-6 py-3 rounded-xl">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Aurora Background */}
            <div className="aurora-bg">
                <div className="aurora-stars"></div>
                <div className="aurora-layer"></div>
                <div className="aurora-layer aurora-layer-2"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[#bff227]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl"></div>
                                <div className="absolute inset-0 bg-[#0b0124] rounded-xl flex items-center justify-center m-0.5">
                                    <i className="fas fa-shield-halved text-[#bff227] text-lg"></i>
                                </div>
                            </div>
                            <span className="font-display font-bold text-xl bg-gradient-to-r from-[#bff227] to-white bg-clip-text text-transparent">
                                Proofy
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="proof-content"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Header */}
                            <motion.div className="text-center mb-12" variants={itemVariants}>
                                <div className="inline-block mb-4">
                                    <span
                                        className={`px-6 py-3 rounded-full text-sm font-medium ${proof.status === 'confirmed'
                                            ? 'status-confirmed'
                                            : proof.status === 'pending'
                                                ? 'status-pending'
                                                : 'status-failed'
                                            }`}
                                    >
                                        <i
                                            className={`fas ${proof.status === 'confirmed'
                                                ? 'fa-check-circle'
                                                : proof.status === 'pending'
                                                    ? 'fa-clock'
                                                    : 'fa-times-circle'
                                                } mr-2`}
                                        ></i>
                                        {proof.status === 'confirmed'
                                            ? 'Confirmé sur la blockchain'
                                            : proof.status === 'pending'
                                                ? 'En attente de confirmation'
                                                : 'Échec'}
                                    </span>
                                </div>

                                <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                    {proof.title}
                                </h1>

                                <p className="text-gray-400 text-lg">
                                    Preuve d'antériorité vérifiable publiquement
                                </p>
                            </motion.div>

                            {/* Main Info Card */}
                            <motion.div className="glass-card rounded-3xl p-8 mb-8" variants={itemVariants}>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">Type de projet</h3>
                                        <p className="text-white font-semibold capitalize">{proof.projectType}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">Date de dépôt</h3>
                                        <p className="text-white font-semibold">
                                            {new Date(proof.createdAt).toLocaleString('fr-FR')}
                                        </p>
                                    </div>

                                    {proof.authors && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-400 mb-2">Auteur(s)</h3>
                                            <p className="text-white font-semibold">{proof.authors}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">Déposant</h3>
                                        <p className="text-white font-semibold">
                                            {proof.firstName} {proof.lastName}
                                        </p>
                                    </div>
                                </div>

                                {proof.description && (
                                    <div className="mt-6 pt-6 border-t border-[#bff227]/10">
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                                        <p className="text-white">{proof.description}</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* Hash Card */}
                            <motion.div className="glass-card rounded-3xl p-8 mb-8" variants={itemVariants}>
                                <h3 className="font-display text-xl font-bold text-white mb-4">
                                    Empreinte SHA-256
                                </h3>
                                <div className="hash-display text-sm">{proof.fileHash}</div>
                                <p className="text-gray-400 text-sm mt-4">
                                    Cette empreinte unique prouve l'existence du fichier à cette date. Impossible à falsifier ou à modifier.
                                </p>
                            </motion.div>

                            {/* Blockchain Info */}
                            {proof.txHash && (
                                <motion.div className="glass-card rounded-3xl p-8 mb-8" variants={itemVariants}>
                                    <h3 className="font-display text-xl font-bold text-white mb-4">
                                        Informations blockchain
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Transaction Hash</h4>
                                            <div className="hash-display text-sm">{proof.txHash}</div>
                                        </div>

                                        {proof.blockNumber && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Bloc</h4>
                                                <p className="text-white font-mono">#{proof.blockNumber}</p>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <a
                                                href={`https://polygonscan.com/tx/${proof.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 btn-aurora px-6 py-3 rounded-xl"
                                            >
                                                <i className="fas fa-external-link-alt"></i>
                                                Voir sur Polygonscan
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Actions */}
                            <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                                <a
                                    href={`/api/certificate/${proof.publicId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-aurora flex items-center justify-center gap-2 px-6 py-3 rounded-xl flex-1"
                                >
                                    <i className="fas fa-download"></i>
                                    Télécharger le certificat
                                </a>

                                <Link
                                    href="/"
                                    className="glass-card flex items-center justify-center gap-2 px-6 py-3 rounded-xl hover:border-[#bff227]/50 transition-all flex-1 text-center"
                                >
                                    <i className="fas fa-home"></i>
                                    Retour à l'accueil
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
