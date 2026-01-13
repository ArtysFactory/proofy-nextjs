'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCreationPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectType: 'music',
        authors: '',
    });

    const [file, setFile] = useState<File | null>(null);
    const [fileHash, setFileHash] = useState('');
    const [isHashing, setIsHashing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Calculate SHA-256 hash of file
    const hashFile = async (file: File) => {
        setIsHashing(true);
        setError('');

        try {
            const buffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

            setFileHash(hash);
        } catch (err) {
            setError('Erreur lors du calcul du hash');
            console.error(err);
        } finally {
            setIsHashing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            hashFile(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            hashFile(droppedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!file || !fileHash) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        if (!formData.title || !formData.projectType) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/creations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    fileHash,
                    projectType: formData.projectType,
                    authors: formData.authors,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création');
            }

            // Redirect to proof page
            router.push(`/proof/${data.publicId}`);
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Aurora Background */}
            <div className="aurora-bg">
                <div className="aurora-stars"></div>
                <div className="aurora-layer"></div>
                <div className="aurora-layer aurora-layer-2"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#bff227]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <i className="fas fa-arrow-left text-gray-400 hover:text-white"></i>
                            <span className="font-display font-bold text-xl bg-gradient-to-r from-[#bff227] to-white bg-clip-text text-transparent">
                                Proofy
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                            Nouvelle création
                        </h1>
                        <p className="text-gray-400 text-lg mb-12">
                            Protégez votre création sur la blockchain Polygon
                        </p>

                        {error && (
                            <div className="mb-6 p-4 glass-card border-red-500/30 text-red-400 rounded-xl">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* File Upload Zone */}
                            <div className="glass-card rounded-3xl p-8">
                                <h2 className="font-display text-xl font-bold text-white mb-4">
                                    1. Fichier à protéger
                                </h2>

                                <div
                                    className="upload-zone"
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                    {!file ? (
                                        <>
                                            <i className="fas fa-cloud-upload-alt text-6xl text-[#bff227] mb-4"></i>
                                            <p className="text-white text-lg font-medium mb-2">
                                                Glissez-déposez votre fichier ici
                                            </p>
                                            <p className="text-gray-400 mb-4">
                                                ou cliquez pour sélectionner
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                Tous types de fichiers acceptés : musique, images, vidéos, documents...
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-file-alt text-6xl text-[#bff227] mb-4"></i>
                                            <p className="text-white text-lg font-medium mb-2">{file.name}</p>
                                            <p className="text-gray-400 mb-4">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            {isHashing ? (
                                                <div className="flex items-center gap-2 text-[#bff227]">
                                                    <div className="loader w-4 h-4"></div>
                                                    <span>Calcul du hash SHA-256...</span>
                                                </div>
                                            ) : (
                                                <div className="hash-display text-xs max-w-md mx-auto">
                                                    {fileHash}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFile(null);
                                                    setFileHash('');
                                                }}
                                                className="mt-4 text-gray-400 hover:text-white text-sm"
                                            >
                                                <i className="fas fa-times mr-2"></i>
                                                Changer de fichier
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Form */}
                            <div className="glass-card rounded-3xl p-8">
                                <h2 className="font-display text-xl font-bold text-white mb-6">
                                    2. Informations
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Titre de la création <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                            placeholder="Ma chanson incroyable"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-aurora w-full px-4 py-3 rounded-xl text-white h-32 resize-none"
                                            placeholder="Décrivez votre création..."
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Type de projet <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                required
                                                value={formData.projectType}
                                                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                                className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                            >
                                                <option value="music">Musique</option>
                                                <option value="image">Image</option>
                                                <option value="video">Vidéo</option>
                                                <option value="document">Document</option>
                                                <option value="code">Code source</option>
                                                <option value="other">Autre</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Auteur(s)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.authors}
                                                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                                                className="input-aurora w-full px-4 py-3 rounded-xl text-white"
                                                placeholder="John Doe, Jane Smith"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="glass-card rounded-3xl p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#bff227]/20 to-purple-600/10 rounded-2xl flex items-center justify-center">
                                        <i className="fas fa-info-circle text-[#bff227]"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-white mb-1">
                                            Prêt à ancrer sur la blockchain
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Coût estimé : <span className="text-[#bff227]">~0.001$</span> • Confirmation : <span className="text-white">&lt;30s</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isHashing || !file || !fileHash}
                                    className="w-full btn-aurora font-semibold py-4 rounded-xl flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="loader w-5 h-5"></div>
                                            Enregistrement en cours...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-shield-alt"></i>
                                            Protéger ma création
                                        </>
                                    )}
                                </button>

                                <p className="text-gray-500 text-xs text-center mt-4">
                                    En cliquant, vous acceptez que le hash SHA-256 de votre fichier soit enregistré sur la blockchain Polygon
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
