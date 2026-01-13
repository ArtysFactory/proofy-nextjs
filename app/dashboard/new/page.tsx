'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Types for rights holders
interface RightsHolder {
  name: string;
  percentage: number;
  role?: string; // For "others" category
}

interface MusicRights {
  mainAuthorPercentage: number;
  authors: RightsHolder[];
  composers: RightsHolder[];
  publishers: RightsHolder[];
}

interface NeighboringRights {
  producers: RightsHolder[];
  labels: RightsHolder[];
  others: RightsHolder[];
}

export default function NewCreationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Section 1: General info
    madeBy: 'human' as 'human' | 'ai' | 'hybrid',
    aiHumanRatio: 50,
    aiTools: '',
    humanContribution: '',
    mainPrompt: '',
    mainPromptPrivate: false,

    // Section 2: Depositor type
    depositorType: 'individual' as 'individual' | 'company',
    individualFirstName: '',
    individualLastName: '',
    individualEmail: '',
    publicPseudo: '',
    companyName: '',
    depositorName: '',
    companyAddress: '',
    registrationNumber: '',
    vatNumber: '',

    // Section 3: Project type
    projectType: '' as string,

    // Section 4: File info
    title: '',
    shortDescription: '',
  });

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);

  // Music rights (Section 5)
  const [musicRights, setMusicRights] = useState<MusicRights>({
    mainAuthorPercentage: 100,
    authors: [],
    composers: [],
    publishers: [],
  });

  // Neighboring rights (Section 6)
  const [neighboringRights, setNeighboringRights] = useState<NeighboringRights>({
    producers: [],
    labels: [],
    others: [],
  });

  // Legal declarations
  const [confirmOwnership, setConfirmOwnership] = useState(false);
  const [confirmAITerms, setConfirmAITerms] = useState(false);
  const [confirmPercentages, setConfirmPercentages] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    // Load user data for pre-filling
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setFormData(prev => ({
        ...prev,
        individualFirstName: user.firstName || '',
        individualLastName: user.lastName || '',
        individualEmail: user.email || '',
      }));
    }
  }, []);

  // Calculate total percentage for authors rights
  const calculateAuthorTotal = () => {
    const holdersTotal = [
      ...musicRights.authors,
      ...musicRights.composers,
      ...musicRights.publishers,
    ].reduce((sum, h) => sum + h.percentage, 0);
    return musicRights.mainAuthorPercentage + holdersTotal;
  };

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
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('Fichier trop volumineux (max 100 MB)');
        return;
      }
      setFile(selectedFile);
      hashFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 100 * 1024 * 1024) {
        setError('Fichier trop volumineux (max 100 MB)');
        return;
      }
      setFile(droppedFile);
      hashFile(droppedFile);
    }
  };

  // Add rights holder
  const addRightsHolder = (category: 'authors' | 'composers' | 'publishers') => {
    setMusicRights(prev => {
      const newMainPercentage = Math.max(10, prev.mainAuthorPercentage - 15);
      return {
        ...prev,
        mainAuthorPercentage: newMainPercentage,
        [category]: [...prev[category], { name: '', percentage: 15 }],
      };
    });
  };

  const removeRightsHolder = (category: 'authors' | 'composers' | 'publishers', index: number) => {
    setMusicRights(prev => {
      const removed = prev[category][index];
      const newArray = prev[category].filter((_, i) => i !== index);
      return {
        ...prev,
        mainAuthorPercentage: Math.min(100, prev.mainAuthorPercentage + removed.percentage),
        [category]: newArray,
      };
    });
  };

  const updateRightsHolder = (category: 'authors' | 'composers' | 'publishers', index: number, field: 'name' | 'percentage', value: string | number) => {
    setMusicRights(prev => ({
      ...prev,
      [category]: prev[category].map((h, i) => i === index ? { ...h, [field]: value } : h),
    }));
  };

  // Add neighboring rights holder
  const addNeighboringHolder = (category: 'producers' | 'labels' | 'others') => {
    setNeighboringRights(prev => ({
      ...prev,
      [category]: [...prev[category], { name: '', percentage: 50, role: category === 'others' ? '' : undefined }],
    }));
  };

  const removeNeighboringHolder = (category: 'producers' | 'labels' | 'others', index: number) => {
    setNeighboringRights(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const updateNeighboringHolder = (category: 'producers' | 'labels' | 'others', index: number, field: 'name' | 'percentage' | 'role', value: string | number) => {
    setNeighboringRights(prev => ({
      ...prev,
      [category]: prev[category].map((h, i) => i === index ? { ...h, [field]: value } : h),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!file || !fileHash) {
      setError('Veuillez sélectionner un fichier');
      return;
    }
    if (!formData.title || !formData.projectType) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (!confirmOwnership) {
      setError('Veuillez confirmer être l\'auteur ou avoir les droits');
      return;
    }
    if ((formData.madeBy === 'ai' || formData.madeBy === 'hybrid') && !confirmAITerms) {
      setError('Veuillez accepter les conditions relatives aux créations IA');
      return;
    }
    if (formData.projectType === 'music') {
      const total = calculateAuthorTotal();
      if (total !== 100) {
        setError(`Le total des droits d'auteur doit être égal à 100% (actuellement ${total}%)`);
        return;
      }
      if (!confirmPercentages) {
        setError('Veuillez confirmer la répartition des droits');
        return;
      }
    }

    setIsSubmitting(true);
    setProcessingStep(1);

    try {
      const token = localStorage.getItem('token');

      // Build request body
      const requestBody: any = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        fileHash,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        projectType: formData.projectType,
        madeBy: formData.madeBy,
        aiHumanRatio: formData.madeBy === 'human' ? 0 : formData.madeBy === 'ai' ? 100 : formData.aiHumanRatio,
        aiTools: formData.aiTools,
        humanContribution: formData.humanContribution,
        mainPrompt: formData.mainPrompt,
        mainPromptPrivate: formData.mainPromptPrivate,
        depositorType: formData.depositorType,
        declaredOwnership: confirmOwnership,
        acceptedAITerms: confirmAITerms,
      };

      // Add depositor info
      if (formData.depositorType === 'company') {
        requestBody.companyInfo = {
          companyName: formData.companyName,
          depositorName: formData.depositorName,
          address: formData.companyAddress,
          registrationNumber: formData.registrationNumber,
          vatNumber: formData.vatNumber || null,
        };
      } else {
        requestBody.publicPseudo = formData.publicPseudo || null;
      }

      // Add music-specific data
      if (formData.projectType === 'music') {
        requestBody.coAuthors = {
          mainAuthorPercentage: musicRights.mainAuthorPercentage,
          authors: musicRights.authors.filter(a => a.name),
          composers: musicRights.composers.filter(c => c.name),
          publishers: musicRights.publishers.filter(p => p.name),
        };
        requestBody.musicProducers = neighboringRights.producers.filter(p => p.name);
        requestBody.musicLabels = neighboringRights.labels.filter(l => l.name);
        requestBody.musicOthers = neighboringRights.others.filter(o => o.name);
      }

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

      // Short delay for UX
      await new Promise(r => setTimeout(r, 1000));

      // Redirect to proof page
      router.push(`/proof/${data.publicId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
      setProcessingStep(0);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('audio/')) return 'fa-music text-rose-400';
    if (type.startsWith('image/')) return 'fa-image text-cyan-400';
    if (type.startsWith('video/')) return 'fa-video text-purple-400';
    return 'fa-file-alt text-[#bff227]';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="aurora-bg">
          <div className="aurora-stars"></div>
          <div className="aurora-layer"></div>
        </div>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-stars"></div>
        <div className="aurora-layer"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[#bff227]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl rotate-6 group-hover:rotate-12 transition-transform"></div>
                <div className="absolute inset-0 bg-[#0b0124] rounded-xl flex items-center justify-center">
                  <i className="fas fa-shield-halved text-[#bff227] text-lg"></i>
                </div>
              </div>
              <span className="font-display font-bold text-xl bg-gradient-to-r from-[#bff227] to-violet-400 bg-clip-text text-transparent">Proofy</span>
            </Link>
            <Link href="/dashboard" className="glass-card px-4 py-2 rounded-xl text-gray-300 hover:text-white transition-colors">
              <i className="fas fa-arrow-left mr-2"></i>Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key="creation-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Header */}
              <motion.div variants={itemVariants} className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-white mb-2">
                  Nouvelle <span className="bg-gradient-to-r from-[#bff227] to-violet-400 bg-clip-text text-transparent">création</span>
                </h1>
                <p className="text-gray-400">Protégez votre œuvre sur la blockchain en quelques clics</p>
              </motion.div>

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

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Informations générales */}
                <motion.div className="glass-card rounded-3xl p-8" variants={itemVariants}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl flex items-center justify-center text-white font-bold">1</div>
                    <h2 className="font-display text-xl font-semibold text-white">Informations générales</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Créé par */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-3">Créé par *</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['human', 'ai', 'hybrid'] as const).map((type) => (
                          <label key={type} className="cursor-pointer">
                            <input
                              type="radio"
                              name="madeBy"
                              value={type}
                              checked={formData.madeBy === type}
                              onChange={(e) => setFormData({ ...formData, madeBy: e.target.value as 'human' | 'ai' | 'hybrid' })}
                              className="hidden peer"
                            />
                            <div className="glass-card rounded-xl p-4 text-center peer-checked:border-[#bff227] peer-checked:bg-[#bff227]/10 transition-all">
                              <i className={`fas ${type === 'human' ? 'fa-user text-emerald-400' : type === 'ai' ? 'fa-robot text-purple-400' : 'fa-hands-helping text-cyan-400'} text-2xl mb-2`}></i>
                              <span className="text-gray-300 text-sm block font-medium">
                                {type === 'human' ? 'Humain' : type === 'ai' ? 'IA' : 'Hybride'}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {type === 'human' ? '100% création humaine' : type === 'ai' ? '100% généré par IA' : 'Humain + IA'}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Hybrid ratio slider */}
                    {formData.madeBy === 'hybrid' && (
                      <div className="glass-card rounded-2xl p-4 bg-[#bff227]/5 border-[#bff227]/20">
                        <label className="block text-gray-300 text-sm font-medium mb-3">
                          Proportion IA vs Humain
                          <span className="text-[#bff227] font-bold ml-2">{formData.aiHumanRatio}%</span> IA /
                          <span className="text-[#bff227] font-bold ml-1">{100 - formData.aiHumanRatio}%</span> Humain
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={formData.aiHumanRatio}
                          onChange={(e) => setFormData({ ...formData, aiHumanRatio: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>10% IA</span>
                          <span>90% IA</span>
                        </div>
                      </div>
                    )}

                    {/* AI details */}
                    {(formData.madeBy === 'ai' || formData.madeBy === 'hybrid') && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Outils IA utilisés</label>
                          <input
                            type="text"
                            value={formData.aiTools}
                            onChange={(e) => setFormData({ ...formData, aiTools: e.target.value })}
                            className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                            placeholder="Ex: Midjourney v6, ChatGPT-4, Stable Diffusion XL..."
                          />
                          <p className="text-gray-500 text-xs mt-1">Séparez par des virgules</p>
                        </div>

                        {formData.madeBy === 'hybrid' && (
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Description de la contribution humaine</label>
                            <textarea
                              value={formData.humanContribution}
                              onChange={(e) => setFormData({ ...formData, humanContribution: e.target.value })}
                              rows={2}
                              className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none"
                              placeholder="Ex: Direction artistique, idée originale, retouches finales..."
                            />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-gray-300 text-sm font-medium">Prompt principal <span className="text-gray-500">(optionnel)</span></label>
                            <label className="flex items-center gap-2 text-gray-500 text-xs cursor-pointer ml-auto">
                              <input
                                type="checkbox"
                                checked={formData.mainPromptPrivate}
                                onChange={(e) => setFormData({ ...formData, mainPromptPrivate: e.target.checked })}
                                className="rounded border-gray-600 bg-gray-800 text-cyan-500"
                              />
                              Garder privé
                            </label>
                          </div>
                          <textarea
                            value={formData.mainPrompt}
                            onChange={(e) => setFormData({ ...formData, mainPrompt: e.target.value })}
                            rows={3}
                            className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none font-mono text-sm"
                            placeholder="Collez votre prompt principal ici..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Section 2: Type de déposant */}
                <motion.div className="glass-card rounded-3xl p-8" variants={itemVariants}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">2</div>
                    <h2 className="font-display text-xl font-semibold text-white">Type de déposant</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {(['individual', 'company'] as const).map((type) => (
                      <label key={type} className="cursor-pointer">
                        <input
                          type="radio"
                          name="depositorType"
                          value={type}
                          checked={formData.depositorType === type}
                          onChange={(e) => setFormData({ ...formData, depositorType: e.target.value as 'individual' | 'company' })}
                          className="hidden peer"
                        />
                        <div className="glass-card rounded-xl p-6 text-center peer-checked:border-cyan-400 peer-checked:bg-[#bff227]/10 transition-all">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#bff227]/20 to-[#9dcc1e]/20 rounded-2xl flex items-center justify-center">
                            <i className={`fas ${type === 'individual' ? 'fa-user' : 'fa-building'} text-3xl text-[#bff227]`}></i>
                          </div>
                          <span className="text-white font-semibold block mb-1">
                            {type === 'individual' ? 'Particulier' : 'Entreprise'}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {type === 'individual' ? 'Personne physique' : 'Personne morale'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Individual Fields */}
                  {formData.depositorType === 'individual' && (
                    <div className="space-y-4 p-6 glass-card rounded-2xl bg-[#bff227]/5 border-[#bff227]/20">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <i className="fas fa-user text-[#bff227]"></i>
                        Informations personnelles
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Prénom *</label>
                          <input
                            type="text"
                            required
                            value={formData.individualFirstName}
                            onChange={(e) => setFormData({ ...formData, individualFirstName: e.target.value })}
                            className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                            placeholder="Votre prénom"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Nom *</label>
                          <input
                            type="text"
                            required
                            value={formData.individualLastName}
                            onChange={(e) => setFormData({ ...formData, individualLastName: e.target.value })}
                            className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                            placeholder="Votre nom"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Adresse email *</label>
                        <input
                          type="email"
                          required
                          value={formData.individualEmail}
                          onChange={(e) => setFormData({ ...formData, individualEmail: e.target.value })}
                          className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                          placeholder="votre@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Pseudonyme public <span className="text-gray-500">(optionnel)</span></label>
                        <input
                          type="text"
                          value={formData.publicPseudo}
                          onChange={(e) => setFormData({ ...formData, publicPseudo: e.target.value })}
                          className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                          placeholder="Nom affiché sur la page de preuve"
                        />
                        <p className="text-gray-500 text-xs mt-1">Laissez vide pour utiliser votre nom complet</p>
                      </div>
                    </div>
                  )}

                  {/* Company Fields */}
                  {formData.depositorType === 'company' && (
                    <div className="space-y-4 p-6 glass-card rounded-2xl bg-[#bff227]/5 border-[#bff227]/20">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <i className="fas fa-building text-[#bff227]"></i>
                        Informations entreprise
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Nom de l'entreprise *</label>
                          <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                            placeholder="Ex: Ma Société SAS"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Nom du déposant *</label>
                          <input
                            type="text"
                            required
                            value={formData.depositorName}
                            onChange={(e) => setFormData({ ...formData, depositorName: e.target.value })}
                            className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                            placeholder="Ex: Jean Dupont"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Adresse du siège social *</label>
                        <textarea
                          required
                          value={formData.companyAddress}
                          onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                          rows={2}
                          className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none"
                          placeholder="Ex: 123 Rue de la Paix, 75001 Paris, France"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">N° d'enregistrement (SIRET/SIREN) *</label>
                          <input
                            type="text"
                            required
                            value={formData.registrationNumber}
                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                            className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                            placeholder="Ex: 123 456 789 00012"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">N° TVA intracommunautaire</label>
                          <input
                            type="text"
                            value={formData.vatNumber}
                            onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                            className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                            placeholder="Ex: FR12345678901"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Section 3: Type de projet */}
                <motion.div className="glass-card rounded-3xl p-8" variants={itemVariants}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bff227] to-rose-500 rounded-xl flex items-center justify-center text-white font-bold">3</div>
                    <h2 className="font-display text-xl font-semibold text-white">Type de projet</h2>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {[
                      { value: 'music', icon: 'fa-music', label: 'Musique', color: 'rose' },
                      { value: 'image', icon: 'fa-image', label: 'Image', color: 'cyan' },
                      { value: 'video', icon: 'fa-video', label: 'Vidéo', color: 'purple' },
                      { value: 'document', icon: 'fa-file-contract', label: 'Document', color: 'emerald' },
                      { value: 'other', icon: 'fa-shapes', label: 'Autre', color: 'amber' },
                    ].map(({ value, icon, label, color }) => (
                      <label key={value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="projectType"
                          value={value}
                          checked={formData.projectType === value}
                          onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                          className="hidden peer"
                          required
                        />
                        <div className={`glass-card rounded-xl p-4 text-center peer-checked:border-${color}-400 peer-checked:bg-${color}-500/10 transition-all`}>
                          <i className={`fas ${icon} text-2xl text-${color}-400 mb-2`}></i>
                          <span className="text-gray-300 text-sm block">{label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>

                {/* Section 4: Fichier */}
                <motion.div className="glass-card rounded-3xl p-8" variants={itemVariants}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl flex items-center justify-center text-white font-bold">4</div>
                    <h2 className="font-display text-xl font-semibold text-white">Votre fichier</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Titre de l'œuvre *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                        placeholder="Ex: Ma composition originale"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Description courte</label>
                      <textarea
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        rows={3}
                        className="w-full input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none"
                        placeholder="Décrivez brièvement votre création..."
                      />
                    </div>

                    {/* Upload Zone */}
                    <div
                      className="upload-zone rounded-2xl p-12 text-center cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.md"
                      />

                      {!file ? (
                        <>
                          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#bff227]/20 to-[#9dcc1e]/20 rounded-3xl flex items-center justify-center">
                            <i className="fas fa-cloud-upload-alt text-4xl text-[#bff227]"></i>
                          </div>
                          <p className="text-white font-medium mb-2">Glissez-déposez votre fichier ici</p>
                          <p className="text-gray-500 text-sm mb-4">ou cliquez pour sélectionner</p>
                          <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
                            <span><i className="fas fa-music mr-1"></i>Audio</span>
                            <span><i className="fas fa-image mr-1"></i>Image</span>
                            <span><i className="fas fa-video mr-1"></i>Vidéo</span>
                            <span><i className="fas fa-file-alt mr-1"></i>Document</span>
                          </div>
                          <p className="text-gray-600 text-xs mt-4">Max 100 MB</p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 justify-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#bff227]/20 to-[#9dcc1e]/20 rounded-2xl flex items-center justify-center">
                              <i className={`fas ${getFileIcon(file.type)} text-3xl`}></i>
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
                              className="ml-4 w-10 h-10 glass-card rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Hash Preview */}
                    {file && (
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          <i className="fas fa-fingerprint mr-2 text-[#bff227]"></i>Hash SHA-256
                        </label>
                        {isHashing ? (
                          <div className="flex items-center gap-2 text-[#bff227]">
                            <div className="loader w-4 h-4"></div>
                            <span>Calcul du hash en cours...</span>
                          </div>
                        ) : (
                          <div className="hash-display">{fileHash}</div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Section 5: Droits d'auteur (Music only) */}
                {formData.projectType === 'music' && (
                  <motion.div className="glass-card rounded-3xl p-8" variants={itemVariants}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#bff227] to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">5</div>
                      <div>
                        <h2 className="font-display text-xl font-semibold text-white">Droits d'auteur</h2>
                        <p className="text-gray-400 text-sm">Auteurs, Compositeurs, Éditeurs</p>
                      </div>
                      <span className="ml-auto text-sm text-gray-400">
                        <i className="fas fa-percentage mr-1"></i>Répartition des droits
                      </span>
                    </div>

                    <div className="space-y-6 mt-6">
                      {/* Main author percentage */}
                      <div className="glass-card rounded-2xl p-4 bg-[#bff227]/5 border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#bff227]/20 rounded-xl flex items-center justify-center">
                              <i className="fas fa-user-check text-[#bff227]"></i>
                            </div>
                            <div>
                              <span className="text-white font-medium">Titulaire principal (vous)</span>
                              <p className="text-gray-500 text-xs">Votre part des droits d'auteur</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={musicRights.mainAuthorPercentage}
                              onChange={(e) => setMusicRights({ ...musicRights, mainAuthorPercentage: parseInt(e.target.value) || 0 })}
                              min="0"
                              max="100"
                              className="w-20 input-aurora rounded-lg px-3 py-2 text-white text-center font-bold"
                            />
                            <span className="text-[#bff227] font-bold">%</span>
                          </div>
                        </div>
                      </div>

                      {/* Authors */}
                      <div className="glass-card rounded-2xl p-4 bg-[#bff227]/5 border-[#bff227]/20">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                            <i className="fas fa-pen-fancy text-[#bff227]"></i>Auteur(s) <span className="text-gray-500">(paroliers, textes)</span>
                          </label>
                          <button type="button" onClick={() => addRightsHolder('authors')} className="glass-card px-3 py-1 rounded-lg text-[#bff227] hover:bg-[#bff227]/10 transition-colors text-sm">
                            <i className="fas fa-plus mr-1"></i>Ajouter
                          </button>
                        </div>
                        <div className="space-y-2">
                          {musicRights.authors.map((author, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={author.name}
                                onChange={(e) => updateRightsHolder('authors', idx, 'name', e.target.value)}
                                className="flex-1 input-aurora rounded-lg px-3 py-2 text-white placeholder-gray-500"
                                placeholder="Nom complet"
                              />
                              <input
                                type="number"
                                value={author.percentage}
                                onChange={(e) => updateRightsHolder('authors', idx, 'percentage', parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-20 input-aurora rounded-lg px-3 py-2 text-white text-center"
                              />
                              <span className="text-cyan-400 font-bold">%</span>
                              <button type="button" onClick={() => removeRightsHolder('authors', idx)} className="glass-card w-10 h-10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Composers */}
                      <div className="glass-card rounded-2xl p-4 bg-rose-500/5 border-rose-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                            <i className="fas fa-music text-rose-400"></i>Compositeur(s) <span className="text-gray-500">(musique)</span>
                          </label>
                          <button type="button" onClick={() => addRightsHolder('composers')} className="glass-card px-3 py-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-sm">
                            <i className="fas fa-plus mr-1"></i>Ajouter
                          </button>
                        </div>
                        <div className="space-y-2">
                          {musicRights.composers.map((composer, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={composer.name}
                                onChange={(e) => updateRightsHolder('composers', idx, 'name', e.target.value)}
                                className="flex-1 input-aurora rounded-lg px-3 py-2 text-white placeholder-gray-500"
                                placeholder="Nom complet"
                              />
                              <input
                                type="number"
                                value={composer.percentage}
                                onChange={(e) => updateRightsHolder('composers', idx, 'percentage', parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-20 input-aurora rounded-lg px-3 py-2 text-white text-center"
                              />
                              <span className="text-rose-400 font-bold">%</span>
                              <button type="button" onClick={() => removeRightsHolder('composers', idx)} className="glass-card w-10 h-10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Publishers */}
                      <div className="glass-card rounded-2xl p-4 bg-amber-500/5 border-amber-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                            <i className="fas fa-file-signature text-amber-400"></i>Éditeur(s) <span className="text-gray-500">(droits d'édition)</span>
                          </label>
                          <button type="button" onClick={() => addRightsHolder('publishers')} className="glass-card px-3 py-1 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors text-sm">
                            <i className="fas fa-plus mr-1"></i>Ajouter
                          </button>
                        </div>
                        <div className="space-y-2">
                          {musicRights.publishers.map((publisher, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={publisher.name}
                                onChange={(e) => updateRightsHolder('publishers', idx, 'name', e.target.value)}
                                className="flex-1 input-aurora rounded-lg px-3 py-2 text-white placeholder-gray-500"
                                placeholder="Nom complet"
                              />
                              <input
                                type="number"
                                value={publisher.percentage}
                                onChange={(e) => updateRightsHolder('publishers', idx, 'percentage', parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-20 input-aurora rounded-lg px-3 py-2 text-white text-center"
                              />
                              <span className="text-amber-400 font-bold">%</span>
                              <button type="button" onClick={() => removeRightsHolder('publishers', idx)} className="glass-card w-10 h-10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Percentage total indicator */}
                      <div className={`glass-card rounded-xl p-4 flex items-center justify-between ${calculateAuthorTotal() === 100 ? 'border-[#bff227]/20' : 'border-red-500/50'}`}>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-chart-pie text-[#bff227]"></i>
                          <span className="text-gray-300">Total des droits d'auteur</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${calculateAuthorTotal() === 100 ? 'text-[#bff227]' : 'text-red-400'}`}>
                            {calculateAuthorTotal()}
                          </span>
                          <span className="text-gray-400">%</span>
                          <span className="ml-2">
                            {calculateAuthorTotal() === 100 ? (
                              <i className="fas fa-check-circle text-[#bff227]"></i>
                            ) : (
                              <i className="fas fa-exclamation-circle text-red-400"></i>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Section 6: Droits voisins (Music only) */}
                {formData.projectType === 'music' && (
                  <motion.div className="glass-card rounded-3xl p-8" variants={itemVariants}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-[#9dcc1e] rounded-xl flex items-center justify-center text-white font-bold">6</div>
                      <div>
                        <h2 className="font-display text-xl font-semibold text-white">Droits voisins</h2>
                        <p className="text-gray-400 text-sm">Producteur, Label, Autre</p>
                      </div>
                      <span className="ml-auto text-sm text-gray-400">
                        <i className="fas fa-coins mr-1"></i>Répartition des royalties
                      </span>
                    </div>

                    <div className="space-y-6 mt-6">
                      {/* Producers */}
                      <div className="glass-card rounded-2xl p-4 bg-rose-500/5 border-rose-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                            <i className="fas fa-sliders-h text-rose-400"></i>Producteur(s)
                          </label>
                          <button type="button" onClick={() => addNeighboringHolder('producers')} className="glass-card px-3 py-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-sm">
                            <i className="fas fa-plus mr-1"></i>Ajouter
                          </button>
                        </div>
                        <div className="space-y-2">
                          {neighboringRights.producers.map((producer, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={producer.name}
                                onChange={(e) => updateNeighboringHolder('producers', idx, 'name', e.target.value)}
                                className="flex-1 input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                                placeholder="Nom du producteur"
                              />
                              <input
                                type="number"
                                value={producer.percentage}
                                onChange={(e) => updateNeighboringHolder('producers', idx, 'percentage', parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-20 input-aurora rounded-xl px-3 py-3 text-white text-center"
                              />
                              <span className="text-rose-400 font-bold">%</span>
                              <button type="button" onClick={() => removeNeighboringHolder('producers', idx)} className="glass-card px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="glass-card rounded-2xl p-4 bg-[#bff227]/5 border-[#bff227]/20">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                            <i className="fas fa-compact-disc text-[#bff227]"></i>Label(s)
                          </label>
                          <button type="button" onClick={() => addNeighboringHolder('labels')} className="glass-card px-3 py-1 rounded-lg text-[#bff227] hover:bg-[#bff227]/10 transition-colors text-sm">
                            <i className="fas fa-plus mr-1"></i>Ajouter
                          </button>
                        </div>
                        <div className="space-y-2">
                          {neighboringRights.labels.map((label, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={label.name}
                                onChange={(e) => updateNeighboringHolder('labels', idx, 'name', e.target.value)}
                                className="flex-1 input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                                placeholder="Nom du label"
                              />
                              <input
                                type="number"
                                value={label.percentage}
                                onChange={(e) => updateNeighboringHolder('labels', idx, 'percentage', parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-20 input-aurora rounded-xl px-3 py-3 text-white text-center"
                              />
                              <span className="text-[#bff227] font-bold">%</span>
                              <button type="button" onClick={() => removeNeighboringHolder('labels', idx)} className="glass-card px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Others */}
                      <div className="glass-card rounded-2xl p-4 bg-teal-500/5 border-teal-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                            <i className="fas fa-user-plus text-teal-400"></i>Autre(s)
                          </label>
                          <button type="button" onClick={() => addNeighboringHolder('others')} className="glass-card px-3 py-1 rounded-lg text-teal-400 hover:bg-teal-500/10 transition-colors text-sm">
                            <i className="fas fa-plus mr-1"></i>Ajouter
                          </button>
                        </div>
                        <div className="space-y-2">
                          {neighboringRights.others.map((other, idx) => (
                            <div key={idx} className="flex gap-2 items-center flex-wrap">
                              <input
                                type="text"
                                value={other.role || ''}
                                onChange={(e) => updateNeighboringHolder('others', idx, 'role', e.target.value)}
                                className="w-32 input-aurora rounded-xl px-3 py-3 text-white placeholder-gray-500"
                                placeholder="Rôle"
                              />
                              <input
                                type="text"
                                value={other.name}
                                onChange={(e) => updateNeighboringHolder('others', idx, 'name', e.target.value)}
                                className="flex-1 input-aurora rounded-xl px-4 py-3 text-white placeholder-gray-500"
                                placeholder="Nom"
                              />
                              <input
                                type="number"
                                value={other.percentage}
                                onChange={(e) => updateNeighboringHolder('others', idx, 'percentage', parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-20 input-aurora rounded-xl px-3 py-3 text-white text-center"
                              />
                              <span className="text-teal-400 font-bold">%</span>
                              <button type="button" onClick={() => removeNeighboringHolder('others', idx)} className="glass-card px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-card rounded-xl p-4 bg-amber-500/5 border-amber-500/20">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-info-circle text-amber-400 mt-0.5"></i>
                          <div className="text-sm text-gray-400">
                            <p className="font-medium text-amber-400 mb-1">Note sur les droits voisins</p>
                            <p>Ces pourcentages représentent la répartition des royalties entre les producteurs, labels et autres intervenants. Ils sont indépendants des droits d'auteur.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Section finale: Déclarations légales */}
                <motion.div className="glass-card rounded-3xl p-8" variants={itemVariants}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl flex items-center justify-center text-white">
                      <i className="fas fa-gavel"></i>
                    </div>
                    <h2 className="font-display text-xl font-semibold text-white">Déclarations légales</h2>
                  </div>

                  <div className="glass-card rounded-2xl p-6 bg-[#bff227]/5 border-[#bff227]/20 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#bff227]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-info-circle text-[#bff227] text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Ce qui va se passer</h4>
                        <ul className="text-gray-400 text-sm space-y-1">
                          <li><i className="fas fa-check text-[#bff227] mr-2"></i>Le hash SHA-256 de votre fichier sera calculé</li>
                          <li><i className="fas fa-check text-[#bff227] mr-2"></i>La preuve sera ancrée sur Polygon</li>
                          <li><i className="fas fa-check text-[#bff227] mr-2"></i>Vous recevrez votre certificat</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmOwnership}
                        onChange={(e) => setConfirmOwnership(e.target.checked)}
                        required
                        className="w-4 h-4 mt-1 rounded border-[#bff227]/30 bg-[#0b0124] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                      />
                      <span className="text-gray-400 text-sm">
                        Je confirme être l'auteur ou avoir les droits sur cette création, et j'accepte que le hash soit enregistré de façon permanente sur la blockchain.
                      </span>
                    </label>

                    {(formData.madeBy === 'ai' || formData.madeBy === 'hybrid') && (
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmAITerms}
                          onChange={(e) => setConfirmAITerms(e.target.checked)}
                          className="w-4 h-4 mt-1 rounded border-[#bff227]/30 bg-[#0b0124] text-[#bff227] focus:ring-[#bff227] focus:ring-offset-0"
                        />
                        <span className="text-gray-400 text-sm">
                          J'accepte les conditions spécifiques relatives aux créations générées ou assistées par IA et je confirme la véracité des informations fournies concernant la contribution humaine.
                        </span>
                      </label>
                    )}

                    {formData.projectType === 'music' && (
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmPercentages}
                          onChange={(e) => setConfirmPercentages(e.target.checked)}
                          className="w-4 h-4 mt-1 rounded border-emerald-500/30 bg-[#0b0124] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <span className="text-gray-400 text-sm">
                          Je confirme que la répartition des droits (pourcentages) est correcte et reflète l'accord entre tous les ayants droit.
                        </span>
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isHashing || !file || !fileHash}
                    className="w-full btn-aurora text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 group text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loader w-5 h-5"></div>
                        {processingStep === 1 && 'Upload en cours...'}
                        {processingStep === 2 && 'Ancrage blockchain...'}
                        {processingStep === 3 && 'Finalisation...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shield-alt"></i>
                        <span>Protéger ma création</span>
                        <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Processing Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative glass-card rounded-3xl p-8 max-w-md w-full text-center mx-4">
            <div className="loader mx-auto mb-6"></div>
            <h3 className="font-display text-xl font-semibold text-white mb-2">
              {processingStep === 3 ? 'Création enregistrée !' : 'Traitement en cours...'}
            </h3>
            <p className="text-gray-400">
              {processingStep === 1 && 'Préparation des données...'}
              {processingStep === 2 && 'Ancrage sur la blockchain Polygon...'}
              {processingStep === 3 && 'Redirection...'}
            </p>
            <div className="mt-8 space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${processingStep >= 1 ? 'bg-[#bff227]/20' : 'bg-gray-700'} flex items-center justify-center`}>
                  {processingStep > 1 ? (
                    <i className="fas fa-check text-[#bff227] text-xs"></i>
                  ) : processingStep === 1 ? (
                    <i className="fas fa-spinner fa-spin text-[#bff227] text-xs"></i>
                  ) : (
                    <i className="fas fa-circle text-gray-600 text-xs"></i>
                  )}
                </div>
                <span className={processingStep >= 1 ? 'text-gray-300 text-sm' : 'text-gray-500 text-sm'}>Préparation des données</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${processingStep >= 2 ? 'bg-[#bff227]/20' : 'bg-gray-700'} flex items-center justify-center`}>
                  {processingStep > 2 ? (
                    <i className="fas fa-check text-[#bff227] text-xs"></i>
                  ) : processingStep === 2 ? (
                    <i className="fas fa-spinner fa-spin text-[#bff227] text-xs"></i>
                  ) : (
                    <i className="fas fa-circle text-gray-600 text-xs"></i>
                  )}
                </div>
                <span className={processingStep >= 2 ? 'text-gray-300 text-sm' : 'text-gray-500 text-sm'}>Ancrage blockchain</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${processingStep >= 3 ? 'bg-[#bff227]/20' : 'bg-gray-700'} flex items-center justify-center`}>
                  {processingStep >= 3 ? (
                    <i className="fas fa-check text-[#bff227] text-xs"></i>
                  ) : (
                    <i className="fas fa-circle text-gray-600 text-xs"></i>
                  )}
                </div>
                <span className={processingStep >= 3 ? 'text-[#bff227] text-sm' : 'text-gray-500 text-sm'}>Certificat généré</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
