'use client';

// ============================================
// PROOFY V3 - Step 2: Informations générales + Droits d'auteur
// - Créé par (Humain/IA/Hybride)
// - Type de déposant (Particulier/Entreprise)
// - Droits d'auteur (Auteurs, Compositeurs, Éditeurs)
// Total = 100%
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard, CopyrightHolder, MadeByType, DepositorType, CompanyInfo } from './WizardContext';
import { 
  Plus, Trash2, PenLine, Music2, BookOpen, Info, AlertTriangle, CheckCircle2,
  User, Bot, Sparkles, Building2, UserCircle
} from 'lucide-react';

type RoleType = 'author' | 'composer' | 'publisher';

const ROLE_CONFIG: Record<RoleType, { label: string; sublabel: string; icon: React.ElementType; color: string }> = {
  author: { label: 'Auteur(s)', sublabel: 'paroliers, textes', icon: PenLine, color: 'text-yellow-400' },
  composer: { label: 'Compositeur(s)', sublabel: 'musique', icon: Music2, color: 'text-pink-400' },
  publisher: { label: 'Éditeur(s)', sublabel: 'droits d\'édition', icon: BookOpen, color: 'text-orange-400' },
};

export default function Step2CopyrightRights() {
  const { state, setWorkTitle, setCopyrightRights, setGeneralInfo, nextStep, prevStep } = useWizard();
  
  // General Info state
  const [madeBy, setMadeBy] = useState<MadeByType>(state.madeBy);
  const [aiHumanRatio, setAiHumanRatio] = useState(state.aiHumanRatio);
  const [aiTools, setAiTools] = useState(state.aiTools);
  const [humanContribution, setHumanContribution] = useState(state.humanContribution);
  const [depositorType, setDepositorType] = useState<DepositorType>(state.depositorType);
  const [publicPseudo, setPublicPseudo] = useState(state.publicPseudo);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(state.companyInfo || {
    companyName: '',
    depositorName: '',
    address: '',
    registrationNumber: '',
    vatNumber: '',
  });
  
  // Copyright state synced with context
  const [authors, setAuthors] = useState<CopyrightHolder[]>(state.copyrightRights.authors);
  const [composers, setComposers] = useState<CopyrightHolder[]>(state.copyrightRights.composers);
  const [publishers, setPublishers] = useState<CopyrightHolder[]>(state.copyrightRights.publishers);
  const [workTitle, setLocalWorkTitle] = useState(state.workTitle);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState<RoleType | null>(null);
  const [newHolder, setNewHolder] = useState({ name: '', percentage: 0, email: '', ipi: '' });

  // Calculate totals
  const totalAuthors = authors.reduce((sum, h) => sum + h.percentage, 0);
  const totalComposers = composers.reduce((sum, h) => sum + h.percentage, 0);
  const totalPublishers = publishers.reduce((sum, h) => sum + h.percentage, 0);
  const grandTotal = totalAuthors + totalComposers + totalPublishers;
  
  const isValid = grandTotal === 100 && workTitle.trim().length > 0;

  // Sync general info to context
  useEffect(() => {
    setGeneralInfo({
      madeBy,
      aiHumanRatio,
      aiTools,
      humanContribution,
      depositorType,
      publicPseudo,
      companyInfo: depositorType === 'company' ? companyInfo : null,
    });
  }, [madeBy, aiHumanRatio, aiTools, humanContribution, depositorType, publicPseudo, companyInfo, setGeneralInfo]);

  // Sync copyright to context when local state changes
  useEffect(() => {
    setCopyrightRights({ authors, composers, publishers });
  }, [authors, composers, publishers, setCopyrightRights]);

  // Handlers
  const handleTitleChange = (title: string) => {
    setLocalWorkTitle(title);
    setWorkTitle(title);
  };

  const addHolder = (role: RoleType) => {
    if (!newHolder.name) return;
    
    const holder: CopyrightHolder = {
      id: Date.now().toString(),
      name: newHolder.name,
      percentage: newHolder.percentage,
      email: newHolder.email || undefined,
      ipi: newHolder.ipi || undefined,
    };

    switch (role) {
      case 'author':
        setAuthors([...authors, holder]);
        break;
      case 'composer':
        setComposers([...composers, holder]);
        break;
      case 'publisher':
        setPublishers([...publishers, holder]);
        break;
    }

    setNewHolder({ name: '', percentage: 0, email: '', ipi: '' });
    setShowAddModal(null);
  };

  const removeHolder = (role: RoleType, id: string) => {
    switch (role) {
      case 'author':
        setAuthors(authors.filter(h => h.id !== id));
        break;
      case 'composer':
        setComposers(composers.filter(h => h.id !== id));
        break;
      case 'publisher':
        setPublishers(publishers.filter(h => h.id !== id));
        break;
    }
  };

  const updateHolderField = (role: RoleType, id: string, field: keyof CopyrightHolder, value: string | number) => {
    const update = (holders: CopyrightHolder[]) =>
      holders.map(h => h.id === id ? { ...h, [field]: value } : h);

    switch (role) {
      case 'author':
        setAuthors(update(authors));
        break;
      case 'composer':
        setComposers(update(composers));
        break;
      case 'publisher':
        setPublishers(update(publishers));
        break;
    }
  };

  // Render a role section
  const RoleSection = ({ role, holders }: { role: RoleType; holders: CopyrightHolder[] }) => {
    const config = ROLE_CONFIG[role];
    const Icon = config.icon;

    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <div>
              <span className="text-white font-medium">{config.label}</span>
              <span className="text-gray-500 text-sm ml-2">({config.sublabel})</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(role)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#bff227]/10 border border-[#bff227]/30 rounded-lg text-[#bff227] text-sm hover:bg-[#bff227]/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {holders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Aucun {config.label.toLowerCase()} ajouté</p>
        ) : (
          <div className="space-y-2">
            {holders.map((holder) => (
              <div key={holder.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={holder.name}
                    onChange={(e) => updateHolderField(role, holder.id, 'name', e.target.value)}
                    placeholder="Nom"
                    className="w-full bg-transparent text-white text-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={holder.percentage}
                    onChange={(e) => updateHolderField(role, holder.id, 'percentage', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm text-center"
                  />
                  <span className="text-gray-400 text-sm">%</span>
                </div>
                <button
                  onClick={() => removeHolder(role, holder.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Auteurs & Droits d'auteur</h2>
        <p className="text-gray-400">
          Informations sur la création et répartition des droits
        </p>
      </div>

      {/* ==================== SECTION 1: Informations générales ==================== */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl flex items-center justify-center text-white font-bold">
            1
          </div>
          <h3 className="text-lg font-semibold text-white">Informations générales</h3>
        </div>

        {/* Créé par */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-3">Créé par *</label>
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
                <Icon className={`w-8 h-8 mx-auto mb-2 ${madeBy === value ? `text-${color}-400` : 'text-gray-400'}`} />
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
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Outils IA utilisés</label>
              <input
                type="text"
                value={aiTools}
                onChange={(e) => setAiTools(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
                placeholder="Ex: Midjourney v6, Suno, Udio..."
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
      </div>

      {/* ==================== SECTION 2: Type de déposant ==================== */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
            2
          </div>
          <h3 className="text-lg font-semibold text-white">Type de déposant</h3>
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
          <div className="p-4 bg-[#bff227]/5 border border-[#bff227]/20 rounded-xl">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Pseudonyme public <span className="text-gray-500">(optionnel)</span>
            </label>
            <input
              type="text"
              value={publicPseudo}
              onChange={(e) => setPublicPseudo(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
              placeholder="Nom affiché sur la preuve"
            />
            <p className="text-gray-500 text-xs mt-1">Laissez vide pour utiliser votre nom complet</p>
          </div>
        )}

        {/* Company fields */}
        {depositorType === 'company' && (
          <div className="space-y-4 p-4 bg-[#bff227]/5 border border-[#bff227]/20 rounded-xl">
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
          </div>
        )}
      </div>

      {/* ==================== SECTION 3: Droits d'auteur ==================== */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#bff227] to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
            3
          </div>
          <h3 className="text-lg font-semibold text-white">Droits d'auteur</h3>
        </div>

        {/* Work Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titre de l'œuvre *
          </label>
          <input
            type="text"
            value={workTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ex: Ma Chanson"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none transition-colors"
          />
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Total = 100%</p>
            <p className="text-blue-300/80">
              La somme des pourcentages (auteurs + compositeurs + éditeurs) doit égaler <strong>100%</strong>.
            </p>
          </div>
        </div>

        {/* Rights Sections */}
        <div className="space-y-4">
          <RoleSection role="author" holders={authors} />
          <RoleSection role="composer" holders={composers} />
          <RoleSection role="publisher" holders={publishers} />
        </div>

        {/* Total Display */}
        <div className={`mt-4 flex items-center justify-between p-4 rounded-xl border-2 ${
          grandTotal === 100 
            ? 'bg-green-500/10 border-green-500/50' 
            : grandTotal > 100 
            ? 'bg-red-500/10 border-red-500/50'
            : 'bg-yellow-500/10 border-yellow-500/50'
        }`}>
          <div className="flex items-center gap-3">
            {grandTotal === 100 ? (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            )}
            <span className="text-white font-medium">Total des droits d'auteur</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${
              grandTotal === 100 ? 'text-green-400' : grandTotal > 100 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {grandTotal}
            </span>
            <span className="text-gray-400">%</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-white/10">
        <button
          onClick={prevStep}
          className="px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <button
          onClick={nextStep}
          disabled={!isValid}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            isValid
              ? 'bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#bff227]/30'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          Continuer
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Add Modal - Direct render without portal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={() => setShowAddModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">
                Ajouter un {ROLE_CONFIG[showAddModal].label.slice(0, -1).toLowerCase()}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={newHolder.name}
                    onChange={(e) => setNewHolder({ ...newHolder, name: e.target.value })}
                    placeholder="Nom complet ou pseudonyme"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Pourcentage *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newHolder.percentage}
                      onChange={(e) => setNewHolder({ ...newHolder, percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Email <span className="text-gray-500">(optionnel)</span>
                  </label>
                  <input
                    type="email"
                    value={newHolder.email}
                    onChange={(e) => setNewHolder({ ...newHolder, email: e.target.value })}
                    placeholder="email@exemple.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    IPI/CAE <span className="text-gray-500">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={newHolder.ipi}
                    onChange={(e) => setNewHolder({ ...newHolder, ipi: e.target.value })}
                    placeholder="00000000000"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(null)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => addHolder(showAddModal)}
                  disabled={!newHolder.name || newHolder.percentage <= 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
