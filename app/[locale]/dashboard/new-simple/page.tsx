'use client';

// ============================================
// PROOFY - Formulaire simplifié pour Image/Autre
// Preuve d'antériorité sans gestion des droits complexes
// ============================================

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  FileText,
  Fingerprint,
  Shield,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Image as ImageIcon,
  FileArchive,
  User,
  Bot,
  Sparkles,
  UserCircle,
  Building2,
} from 'lucide-react';

// Types from the initial form
interface InitialFormData {
  madeBy: 'human' | 'ai' | 'hybrid';
  aiHumanRatio: number;
  aiTools: string;
  humanContribution: string;
  depositorType: 'individual' | 'company';
  individualInfo: {
    firstName: string;
    lastName: string;
    email: string;
    publicPseudo: string;
  } | null;
  companyInfo: {
    companyName: string;
    depositorName: string;
    address: string;
    registrationNumber: string;
    vatNumber?: string;
  } | null;
  projectType: 'image' | 'document' | 'other';
}

export default function NewSimpleCreationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initial form data from /dashboard/new
  const [initialData, setInitialData] = useState<InitialFormData | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<'image' | 'document' | 'other'>('image');
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  
  // Legal
  const [confirmOwnership, setConfirmOwnership] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/dashboard/new-simple');
      return;
    }

    // Load initial data from sessionStorage (from /dashboard/new)
    try {
      const savedData = sessionStorage.getItem('proofy_new_creation');
      if (savedData) {
        const data = JSON.parse(savedData) as InitialFormData;
        setInitialData(data);
        setProjectType(data.projectType as 'image' | 'document' | 'other');
      } else {
        // No initial data, redirect back to the first form
        router.push('/dashboard/new');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      router.push('/dashboard/new');
    }
  }, [router]);

  // Calculate SHA-256 hash
  const hashFile = async (file: File) => {
    setIsHashing(true);
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
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError('Fichier trop volumineux (max 500 MB)');
        return;
      }
      setFile(selectedFile);
      hashFile(selectedFile);
      
      // Auto-detect project type
      if (selectedFile.type.startsWith('image/')) {
        setProjectType('image');
      } else if (selectedFile.type === 'application/pdf' || selectedFile.type.includes('document')) {
        setProjectType('document');
      } else {
        setProjectType('other');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 500 * 1024 * 1024) {
        setError('Fichier trop volumineux (max 500 MB)');
        return;
      }
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
    if (!title) {
      setError('Veuillez entrer un titre');
      return;
    }
    if (!confirmOwnership) {
      setError('Veuillez confirmer être l\'auteur ou avoir les droits');
      return;
    }

    setIsSubmitting(true);
    setProcessingStep(1);

    try {
      const token = localStorage.getItem('token');

      const requestBody = {
        title: title.trim(),
        shortDescription: description.trim(),
        fileHash,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        projectType,
        madeBy: initialData?.madeBy || 'human',
        aiHumanRatio: initialData?.aiHumanRatio || 0,
        aiTools: initialData?.aiTools || '',
        humanContribution: initialData?.humanContribution || '',
        depositorType: initialData?.depositorType || 'individual',
        publicPseudo: initialData?.individualInfo?.publicPseudo || '',
        companyInfo: initialData?.companyInfo || null,
        declaredOwnership: confirmOwnership,
      };

      setProcessingStep(2);

      const response = await fetch('/api/creations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      setProcessingStep(3);
      await new Promise(r => setTimeout(r, 1000));
      router.push(`/proof/${data.publicId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
      setProcessingStep(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const canSubmit = file && fileHash && title && confirmOwnership && !isHashing;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#bff227] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard/new" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <Link href="/" className="text-xl font-bold text-[#bff227]">
            Proofy
          </Link>
          <div className="w-24" />
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-2xl mb-4">
              <ImageIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Nouveau dépôt
            </h1>
            <p className="text-gray-400">
              Créez une preuve d'antériorité pour votre fichier
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl"
              >
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
                <button onClick={() => setError('')} className="ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Initial Data Summary */}
          {initialData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#bff227]" />
                Récapitulatif
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Créé par */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  {initialData.madeBy === 'human' ? (
                    <User className="w-5 h-5 text-emerald-400" />
                  ) : initialData.madeBy === 'ai' ? (
                    <Bot className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  )}
                  <div>
                    <p className="text-gray-400 text-xs">Créé par</p>
                    <p className="text-white text-sm font-medium">
                      {initialData.madeBy === 'human' ? 'Humain (100%)' : 
                       initialData.madeBy === 'ai' ? 'IA (100%)' : 
                       `Hybride (${initialData.aiHumanRatio}% IA)`}
                    </p>
                  </div>
                </div>

                {/* Déposant */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  {initialData.depositorType === 'individual' ? (
                    <UserCircle className="w-5 h-5 text-[#bff227]" />
                  ) : (
                    <Building2 className="w-5 h-5 text-[#bff227]" />
                  )}
                  <div>
                    <p className="text-gray-400 text-xs">Déposant</p>
                    <p className="text-white text-sm font-medium">
                      {initialData.depositorType === 'individual' 
                        ? `${initialData.individualInfo?.firstName} ${initialData.individualInfo?.lastName}`
                        : initialData.companyInfo?.companyName}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Tools (if applicable) */}
              {initialData.aiTools && (
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <p className="text-gray-400 text-xs mb-1">Outils IA utilisés</p>
                  <p className="text-purple-300 text-sm">{initialData.aiTools}</p>
                </div>
              )}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#bff227]" />
                Votre fichier
              </h2>

              <div
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${file 
                    ? 'border-[#bff227]/50 bg-[#bff227]/5' 
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                  }
                `}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.md,.zip"
                />

                {!file ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-white font-medium mb-2">Glissez-déposez votre fichier ici</p>
                    <p className="text-gray-500 text-sm mb-4">ou cliquez pour sélectionner</p>
                    <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" /> Image
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" /> PDF
                      </span>
                      <span className="flex items-center gap-1">
                        <FileArchive className="w-4 h-4" /> ZIP
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mt-4">Max 500 MB</p>
                  </>
                ) : (
                  <div className="flex items-center gap-4 justify-center">
                    <div className="w-14 h-14 bg-[#bff227]/20 rounded-xl flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-7 h-7 text-[#bff227]" />
                      ) : (
                        <FileText className="w-7 h-7 text-[#bff227]" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-500 text-sm">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFileHash('');
                      }}
                      className="ml-4 p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Hash Display */}
              {file && (
                <div className="mt-4">
                  <label className="text-gray-400 text-sm flex items-center gap-2 mb-2">
                    <Fingerprint className="w-4 h-4 text-[#bff227]" />
                    Empreinte SHA-256
                  </label>
                  {isHashing ? (
                    <div className="flex items-center gap-2 text-[#bff227]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Calcul en cours...</span>
                    </div>
                  ) : (
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3">
                      <code className="text-[#bff227] text-xs font-mono break-all">
                        {fileHash}
                      </code>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Title & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#bff227]" />
                Informations
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Titre de l'œuvre *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#bff227]/50"
                    placeholder="Ex: Logo de mon entreprise"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description <span className="text-gray-500">(optionnel)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#bff227]/50 resize-none"
                    placeholder="Décrivez brièvement votre création..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Legal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#bff227]" />
                Confirmation
              </h2>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmOwnership}
                  onChange={(e) => setConfirmOwnership(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-[#bff227] focus:ring-[#bff227]"
                />
                <span className="text-gray-300 text-sm">
                  Je confirme être l'auteur ou avoir les droits sur cette création, et j'accepte que le hash soit enregistré de façon permanente sur la blockchain Polygon.
                </span>
              </label>
            </motion.div>

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`
                w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3
                ${canSubmit && !isSubmitting
                  ? 'bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#bff227]/30'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {processingStep === 1 && 'Préparation...'}
                  {processingStep === 2 && 'Ancrage blockchain...'}
                  {processingStep === 3 && 'Finalisation...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Créer ma preuve d'antériorité
                </>
              )}
            </motion.button>
          </form>
        </div>
      </main>

      {/* Processing Modal */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 text-center"
            >
              <Loader2 className="w-12 h-12 text-[#bff227] animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {processingStep === 3 ? 'Création enregistrée !' : 'Traitement en cours...'}
              </h3>
              <p className="text-gray-400">
                {processingStep === 1 && 'Préparation des données...'}
                {processingStep === 2 && 'Ancrage sur la blockchain Polygon...'}
                {processingStep === 3 && 'Redirection vers votre certificat...'}
              </p>

              <div className="mt-6 space-y-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center
                      ${processingStep >= step ? 'bg-[#bff227]/20' : 'bg-white/10'}
                    `}>
                      {processingStep > step ? (
                        <CheckCircle2 className="w-4 h-4 text-[#bff227]" />
                      ) : processingStep === step ? (
                        <Loader2 className="w-4 h-4 text-[#bff227] animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                      )}
                    </div>
                    <span className={`text-sm ${processingStep >= step ? 'text-gray-300' : 'text-gray-500'}`}>
                      {step === 1 && 'Préparation'}
                      {step === 2 && 'Blockchain'}
                      {step === 3 && 'Certificat'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
