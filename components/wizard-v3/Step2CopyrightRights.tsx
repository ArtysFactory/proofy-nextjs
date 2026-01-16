'use client';

// ============================================
// PROOFY V3 - Step 2: Droits d'auteur (Copyright)
// Auteurs, Compositeurs, Éditeurs
// Total = 100%
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard, CopyrightHolder, CopyrightRights } from './WizardContext';
import { Plus, Trash2, PenLine, Music2, BookOpen, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

type RoleType = 'author' | 'composer' | 'publisher';

const ROLE_CONFIG: Record<RoleType, { label: string; sublabel: string; icon: React.ElementType; color: string }> = {
  author: { label: 'Auteur(s)', sublabel: 'paroliers, textes', icon: PenLine, color: 'text-yellow-400' },
  composer: { label: 'Compositeur(s)', sublabel: 'musique', icon: Music2, color: 'text-pink-400' },
  publisher: { label: 'Éditeur(s)', sublabel: 'droits d\'édition', icon: BookOpen, color: 'text-orange-400' },
};

export default function Step2CopyrightRights() {
  const { state, setWorkTitle, setCopyrightRights, nextStep, prevStep } = useWizard();
  
  // Local state synced with context
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

  // Sync to context when local state changes
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
              <div
                key={holder.id}
                className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
              >
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
        <h2 className="text-2xl font-bold text-white mb-2">Droits d'auteur</h2>
        <p className="text-gray-400">
          Répartition des droits sur l'œuvre (paroles, composition, édition)
        </p>
      </div>

      {/* Work Title */}
      <div>
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
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-medium mb-1">Droits d'auteur = protection de l'œuvre</p>
          <p className="text-blue-300/80">
            Le total des pourcentages (auteurs + compositeurs + éditeurs) doit égaler <strong>100%</strong>.
            Ces droits sont gérés par la SACEM en France.
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
      <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${
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
          {grandTotal === 100 && <CheckCircle2 className="w-5 h-5 text-green-400 ml-2" />}
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

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
                  onClick={() => setShowAddModal(null)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
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
