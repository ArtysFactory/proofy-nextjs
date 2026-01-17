'use client';

// ============================================
// PROOFY - Formulaire de nouvelle création (Étape 1)
// 1. Informations générales (Humain/IA/Hybride)
// 2. Type de déposant (Particulier/Entreprise)
// 3. Type de projet (Musique, Image, Vidéo, Document, Autre)
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LocaleLink from '@/components/LocaleLink';
import {
  ArrowLeft,
  User,
  Bot,
  Sparkles,
  UserCircle,
  Building2,
  Music,
  Image as ImageIcon,
  Video,
  FileText,
  Shapes,
  ArrowRight,
  Loader2,
} from 'lucide-react';

type MadeByType = 'human' | 'ai' | 'hybrid';
type DepositorType = 'individual' | 'company';
type ProjectType = 'music' | 'image' | 'video' | 'document' | 'other';

interface CompanyInfo {
  companyName: string;
  depositorName: string;
  address: string;
  registrationNumber: string;
  vatNumber: string;
}

interface IndividualInfo {
  firstName: string;
  lastName: string;
  email: string;
  publicPseudo: string;
}

export default function NewCreationPage() {
  const router = useRouter();
  const t = useTranslations('newCreation');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Section 1: Informations générales
  const [madeBy, setMadeBy] = useState<MadeByType>('human');
  const [aiHumanRatio, setAiHumanRatio] = useState(50);
  const [aiTools, setAiTools] = useState('');
  const [humanContribution, setHumanContribution] = useState('');

  // Section 2: Type de déposant
  const [depositorType, setDepositorType] = useState<DepositorType>('individual');
  const [individualInfo, setIndividualInfo] = useState<IndividualInfo>({
    firstName: '',
    lastName: '',
    email: '',
    publicPseudo: '',
  });
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    depositorName: '',
    address: '',
    registrationNumber: '',
    vatNumber: '',
  });

  // Section 3: Type de projet
  const [projectType, setProjectType] = useState<ProjectType | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push(`/${locale}/login?redirect=/${locale}/dashboard/new`);
      return;
    }

    // Pre-fill individual info from user data
    if (userData) {
      const user = JSON.parse(userData);
      setIndividualInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        publicPseudo: '',
      });
    }
  }, [router]);

  // Validation
  const isIndividualValid = depositorType === 'individual' && 
    individualInfo.firstName.trim() && 
    individualInfo.lastName.trim() && 
    individualInfo.email.trim();
  
  const isCompanyValid = depositorType === 'company' && 
    companyInfo.companyName.trim() && 
    companyInfo.depositorName.trim() && 
    companyInfo.registrationNumber.trim();

  const isValid = projectType && (isIndividualValid || isCompanyValid);

  // Handle continue
  const handleContinue = () => {
    if (!isValid || !projectType) return;

    setIsNavigating(true);

    // Store the form data in sessionStorage for the next step
    const formData = {
      madeBy,
      aiHumanRatio: madeBy === 'human' ? 0 : madeBy === 'ai' ? 100 : aiHumanRatio,
      aiTools,
      humanContribution,
      depositorType,
      individualInfo: depositorType === 'individual' ? individualInfo : null,
      companyInfo: depositorType === 'company' ? companyInfo : null,
      projectType,
    };
    sessionStorage.setItem('proofy_new_creation', JSON.stringify(formData));

    // Navigate based on project type
    if (projectType === 'music' || projectType === 'video') {
      // Go to Wizard V3 for music/video
      router.push(`/${locale}/dashboard/new-v3`);
    } else {
      // Go to simple form for image/document/other
      router.push(`/${locale}/dashboard/new-simple`);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#bff227] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#bff227]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <LocaleLink href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{tCommon('back')}</span>
          </LocaleLink>
          <LocaleLink href="/" className="text-xl font-bold text-[#bff227]">
            Proofy
          </LocaleLink>
          <div className="w-24" />
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-gray-400">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* ==================== SECTION 1: Informations générales ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl flex items-center justify-center text-[#0a0a0a] font-bold">
                1
              </div>
              <h2 className="text-lg font-semibold text-white">{t('section1.title')}</h2>
            </div>

            {/* Créé par */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-3">{t('section1.madeBy')} *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'human', icon: User, label: 'Humain', sublabel: '100% création humaine', color: 'emerald' },
                  { value: 'ai', icon: Bot, label: 'IA', sublabel: '100% généré par IA', color: 'purple' },
                  { value: 'hybrid', icon: Sparkles, label: 'Hybride', sublabel: 'Humain + IA', color: 'cyan' },
                ].map(({ value, icon: Icon, label, sublabel, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMadeBy(value as MadeByType)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      madeBy === value
                        ? `border-${color}-400 bg-${color}-500/10`
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      madeBy === value ? `text-${color}-400` : 'text-gray-400'
                    }`} />
                    <span className="text-white text-sm font-medium block">{label}</span>
                    <span className="text-gray-500 text-xs">{sublabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hybrid ratio slider */}
            {madeBy === 'hybrid' && (
              <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Proportion IA vs Humain: <span className="text-[#bff227] font-bold">{aiHumanRatio}%</span> IA / <span className="text-[#bff227] font-bold">{100 - aiHumanRatio}%</span> Humain
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={aiHumanRatio}
                  onChange={(e) => setAiHumanRatio(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#bff227]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>10% IA</span>
                  <span>90% IA</span>
                </div>
              </div>
            )}

            {/* AI details */}
            {(madeBy === 'ai' || madeBy === 'hybrid') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Outils IA utilisés</label>
                  <input
                    type="text"
                    value={aiTools}
                    onChange={(e) => setAiTools(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
                    placeholder="Ex: Midjourney v6, Suno, ChatGPT..."
                  />
                  <p className="text-gray-500 text-xs mt-1">Séparez par des virgules</p>
                </div>

                {madeBy === 'hybrid' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Contribution humaine</label>
                    <textarea
                      value={humanContribution}
                      onChange={(e) => setHumanContribution(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none resize-none"
                      placeholder="Ex: Paroles originales, arrangement, mixage..."
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ==================== SECTION 2: Type de déposant ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                2
              </div>
              <h2 className="text-lg font-semibold text-white">Type de déposant</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { value: 'individual', icon: UserCircle, label: 'Particulier', sublabel: 'Personne physique' },
                { value: 'company', icon: Building2, label: 'Entreprise', sublabel: 'Personne morale' },
              ].map(({ value, icon: Icon, label, sublabel }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDepositorType(value as DepositorType)}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    depositorType === value
                      ? 'border-[#bff227] bg-[#bff227]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                    depositorType === value ? 'bg-[#bff227]/20' : 'bg-white/10'
                  }`}>
                    <Icon className={`w-7 h-7 ${depositorType === value ? 'text-[#bff227]' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-white font-semibold block mb-1">{label}</span>
                  <span className="text-gray-500 text-sm">{sublabel}</span>
                </button>
              ))}
            </div>

            {/* Individual fields */}
            {depositorType === 'individual' && (
              <div className="p-4 bg-[#bff227]/5 border border-[#bff227]/20 rounded-xl space-y-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-[#bff227]" />
                  Informations personnelles
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={individualInfo.firstName}
                      onChange={(e) => setIndividualInfo({ ...individualInfo, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Nom *</label>
                    <input
                      type="text"
                      value={individualInfo.lastName}
                      onChange={(e) => setIndividualInfo({ ...individualInfo, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Adresse email *</label>
                  <input
                    type="email"
                    value={individualInfo.email}
                    onChange={(e) => setIndividualInfo({ ...individualInfo, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Pseudonyme public <span className="text-gray-500">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={individualInfo.publicPseudo}
                    onChange={(e) => setIndividualInfo({ ...individualInfo, publicPseudo: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
                    placeholder="Nom affiché sur la page de preuve"
                  />
                  <p className="text-gray-500 text-xs mt-1">Laissez vide pour utiliser votre nom complet</p>
                </div>
              </div>
            )}

            {/* Company fields */}
            {depositorType === 'company' && (
              <div className="p-4 bg-[#bff227]/5 border border-[#bff227]/20 rounded-xl space-y-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#bff227]" />
                  Informations entreprise
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      value={companyInfo.companyName}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
                      placeholder="Ex: Ma Société SAS"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Nom du déposant *</label>
                    <input
                      type="text"
                      value={companyInfo.depositorName}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, depositorName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">N° SIRET/SIREN *</label>
                  <input
                    type="text"
                    value={companyInfo.registrationNumber}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, registrationNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
                    placeholder="Ex: 123 456 789 00012"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Adresse du siège social</label>
                  <textarea
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none resize-none"
                    placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* ==================== SECTION 3: Type de projet ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                3
              </div>
              <h2 className="text-lg font-semibold text-white">Type de projet</h2>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[
                { value: 'music', icon: Music, label: 'Musique', color: 'rose' },
                { value: 'image', icon: ImageIcon, label: 'Image', color: 'cyan' },
                { value: 'video', icon: Video, label: 'Vidéo', color: 'purple' },
                { value: 'document', icon: FileText, label: 'Document', color: 'emerald' },
                { value: 'other', icon: Shapes, label: 'Autre', color: 'amber' },
              ].map(({ value, icon: Icon, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setProjectType(value as ProjectType)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    projectType === value
                      ? `border-${color}-400 bg-${color}-500/10`
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${
                    projectType === value ? `text-${color}-400` : 'text-gray-400'
                  }`} />
                  <span className="text-white text-sm block">{label}</span>
                </button>
              ))}
            </div>

            {/* Info about what happens next */}
            {projectType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
              >
                <p className="text-blue-300 text-sm">
                  {projectType === 'music' || projectType === 'video' ? (
                    <>
                      <strong>Prochaine étape :</strong> Upload du fichier, puis gestion des droits d'auteur et droits voisins.
                    </>
                  ) : (
                    <>
                      <strong>Prochaine étape :</strong> Upload du fichier et création de la preuve d'antériorité.
                    </>
                  )}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <button
              onClick={handleContinue}
              disabled={!isValid || isNavigating}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 ${
                isValid && !isNavigating
                  ? 'bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#bff227]/30'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
