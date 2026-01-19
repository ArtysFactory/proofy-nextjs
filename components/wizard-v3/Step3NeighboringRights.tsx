'use client';

// ============================================
// PROOFY V3 - Step 3: Droits voisins (Neighboring Rights)
// Producteurs, Interprètes, Labels
// Optionnel - Total = 100% (si activé)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard, NeighboringRightsHolder } from './WizardContext';
import { Plus, Trash2, Mic2, Disc3, Building2, Users, Info, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

type RoleType = 'producer' | 'performer' | 'label' | 'other';

const ROLE_CONFIG: Record<RoleType, { label: string; sublabel: string; icon: React.ElementType; color: string }> = {
  producer: { label: 'Producteur(s) phonographique', sublabel: 'financement master', icon: Disc3, color: 'text-purple-400' },
  performer: { label: 'Artiste(s)-interprète(s)', sublabel: 'voix, instruments', icon: Mic2, color: 'text-cyan-400' },
  label: { label: 'Label(s)', sublabel: 'distribution', icon: Building2, color: 'text-green-400' },
  other: { label: 'Autre(s)', sublabel: 'autres ayants droit', icon: Users, color: 'text-orange-400' },
};

// ===== ROLE SECTION COMPONENT (extracted outside) =====
interface RoleSectionProps {
  role: RoleType;
  holders: NeighboringRightsHolder[];
  onAddClick: (role: RoleType) => void;
  onRemove: (role: RoleType, id: string) => void;
  onUpdatePercentage: (role: RoleType, id: string, percentage: number) => void;
}

function RoleSection({ role, holders, onAddClick, onRemove, onUpdatePercentage }: RoleSectionProps) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  const handleAddClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddClick(role);
  }, [role, onAddClick]);

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
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#bff227]/10 border border-[#bff227]/30 rounded-lg text-[#bff227] text-sm hover:bg-[#bff227]/20 transition-colors cursor-pointer z-10"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {holders.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">Aucun ajouté</p>
      ) : (
        <div className="space-y-2">
          {holders.map((holder) => (
            <div key={holder.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{holder.name}</p>
                {holder.role && <p className="text-gray-500 text-xs">{holder.role}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={holder.percentage}
                  onChange={(e) => onUpdatePercentage(role, holder.id, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm text-center"
                />
                <span className="text-gray-400 text-sm">%</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(role, holder.id)}
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
}

// ===== ADD HOLDER MODAL =====
interface AddHolderModalProps {
  role: RoleType;
  onClose: () => void;
  onAdd: (role: RoleType, holder: Omit<NeighboringRightsHolder, 'id'>) => void;
}

function AddHolderModal({ role, onClose, onAdd }: AddHolderModalProps) {
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [email, setEmail] = useState('');
  const [ipn, setIpn] = useState('');
  const [holderRole, setHolderRole] = useState('');

  const config = ROLE_CONFIG[role];

  const handleSubmit = useCallback(() => {
    if (!name || percentage <= 0) return;
    if (role === 'other' && !holderRole) return;
    
    onAdd(role, { 
      name, 
      percentage, 
      email: email || undefined, 
      ipn: ipn || undefined,
      role: role === 'other' ? holderRole : undefined,
    });
  }, [role, name, percentage, email, ipn, holderRole, onAdd]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white mb-4">
          Ajouter - {config.label}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Nom *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet ou pseudonyme"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
              autoFocus
            />
          </div>

          {role === 'other' && (
            <div>
              <label className="block text-sm text-gray-300 mb-2">Rôle *</label>
              <input
                type="text"
                value={holderRole}
                onChange={(e) => setHolderRole(e.target.value)}
                placeholder="Ex: Ingénieur son, Mixeur..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-2">Pourcentage *</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#bff227] focus:outline-none"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              IPN <span className="text-gray-500">(optionnel)</span>
            </label>
            <input
              type="text"
              value={ipn}
              onChange={(e) => setIpn(e.target.value)}
              placeholder="International Performer Number"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name || percentage <= 0 || (role === 'other' && !holderRole)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajouter
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== MAIN COMPONENT =====
export default function Step3NeighboringRights() {
  const { state, setNeighboringRights, nextStep, prevStep } = useWizard();
  
  // Do they want to register neighboring rights?
  const [wantsNeighboringRights, setWantsNeighboringRights] = useState<boolean | null>(
    state.neighboringRights.enabled ? true : null
  );
  
  // Local state synced with context
  const [producers, setProducers] = useState<NeighboringRightsHolder[]>(state.neighboringRights.producers);
  const [performers, setPerformers] = useState<NeighboringRightsHolder[]>(state.neighboringRights.performers);
  const [labels, setLabels] = useState<NeighboringRightsHolder[]>(state.neighboringRights.labels);
  const [others, setOthers] = useState<NeighboringRightsHolder[]>(state.neighboringRights.others);
  
  // Modal state
  const [modalRole, setModalRole] = useState<RoleType | null>(null);

  // Calculate totals
  const totalProducers = producers.reduce((sum, h) => sum + h.percentage, 0);
  const totalPerformers = performers.reduce((sum, h) => sum + h.percentage, 0);
  const totalLabels = labels.reduce((sum, h) => sum + h.percentage, 0);
  const totalOthers = others.reduce((sum, h) => sum + h.percentage, 0);
  const grandTotal = totalProducers + totalPerformers + totalLabels + totalOthers;
  
  // Validation
  const isValid = wantsNeighboringRights === false || 
    (wantsNeighboringRights === true && grandTotal === 100);

  // Sync to context when local state changes
  useEffect(() => {
    setNeighboringRights({
      enabled: wantsNeighboringRights === true,
      producers,
      performers,
      labels,
      others,
    });
  }, [wantsNeighboringRights, producers, performers, labels, others, setNeighboringRights]);

  // Handlers
  const handleAddClick = useCallback((role: RoleType) => {
    setModalRole(role);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalRole(null);
  }, []);

  const handleAddHolder = useCallback((role: RoleType, holderData: Omit<NeighboringRightsHolder, 'id'>) => {
    const holder: NeighboringRightsHolder = {
      id: Date.now().toString(),
      ...holderData,
    };

    switch (role) {
      case 'producer':
        setProducers(prev => [...prev, holder]);
        break;
      case 'performer':
        setPerformers(prev => [...prev, holder]);
        break;
      case 'label':
        setLabels(prev => [...prev, holder]);
        break;
      case 'other':
        setOthers(prev => [...prev, holder]);
        break;
    }

    setModalRole(null);
  }, []);

  const handleRemoveHolder = useCallback((role: RoleType, id: string) => {
    switch (role) {
      case 'producer':
        setProducers(prev => prev.filter(h => h.id !== id));
        break;
      case 'performer':
        setPerformers(prev => prev.filter(h => h.id !== id));
        break;
      case 'label':
        setLabels(prev => prev.filter(h => h.id !== id));
        break;
      case 'other':
        setOthers(prev => prev.filter(h => h.id !== id));
        break;
    }
  }, []);

  const handleUpdatePercentage = useCallback((role: RoleType, id: string, percentage: number) => {
    const update = (holders: NeighboringRightsHolder[]) =>
      holders.map(h => h.id === id ? { ...h, percentage } : h);

    switch (role) {
      case 'producer':
        setProducers(update);
        break;
      case 'performer':
        setPerformers(update);
        break;
      case 'label':
        setLabels(update);
        break;
      case 'other':
        setOthers(update);
        break;
    }
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Droits voisins</h2>
          <p className="text-gray-400">
            Répartition des royalties sur l'enregistrement (master)
          </p>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-300">
            <p className="font-medium mb-1">Droits voisins ≠ Droits d'auteur</p>
            <p className="text-purple-300/80">
              Les droits voisins concernent l'<strong>enregistrement</strong> (master), pas l'œuvre. 
              Ils sont répartis entre producteurs, interprètes et labels. 
              En France, la SPRE répartit : <strong>50% interprètes / 50% producteurs</strong>.
            </p>
          </div>
        </div>

        {/* Question: Do you want to register neighboring rights? */}
        {wantsNeighboringRights === null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#bff227]/10 to-transparent border border-[#bff227]/30 rounded-2xl p-6 text-center"
          >
            <HelpCircle className="w-12 h-12 text-[#bff227] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Voulez-vous enregistrer des droits voisins ?
            </h3>
            <p className="text-gray-400 mb-6">
              Si vous êtes uniquement auteur/compositeur sans enregistrement, vous pouvez passer cette étape.
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setWantsNeighboringRights(false)}
                className="px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-colors"
              >
                Non, passer
              </button>
              <button
                type="button"
                onClick={() => setWantsNeighboringRights(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] font-semibold rounded-xl"
              >
                Oui, ajouter
              </button>
            </div>
          </motion.div>
        )}

        {/* Rights sections (if yes) */}
        {wantsNeighboringRights === true && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <RoleSection 
              role="producer" 
              holders={producers}
              onAddClick={handleAddClick}
              onRemove={handleRemoveHolder}
              onUpdatePercentage={handleUpdatePercentage}
            />
            <RoleSection 
              role="performer" 
              holders={performers}
              onAddClick={handleAddClick}
              onRemove={handleRemoveHolder}
              onUpdatePercentage={handleUpdatePercentage}
            />
            <RoleSection 
              role="label" 
              holders={labels}
              onAddClick={handleAddClick}
              onRemove={handleRemoveHolder}
              onUpdatePercentage={handleUpdatePercentage}
            />
            <RoleSection 
              role="other" 
              holders={others}
              onAddClick={handleAddClick}
              onRemove={handleRemoveHolder}
              onUpdatePercentage={handleUpdatePercentage}
            />

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
                <span className="text-white font-medium">Total des droits voisins</span>
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

            {/* Change answer button */}
            <button
              type="button"
              onClick={() => setWantsNeighboringRights(null)}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Revenir à la question
            </button>
          </motion.div>
        )}

        {/* Skipped message */}
        {wantsNeighboringRights === false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Droits voisins ignorés
            </h3>
            <p className="text-gray-400 mb-4">
              Vous pourrez les ajouter plus tard via le bouton "Gérer les droits".
            </p>
            <button
              type="button"
              onClick={() => setWantsNeighboringRights(null)}
              className="text-[#bff227] hover:underline text-sm"
            >
              Changer d'avis
            </button>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <button
            type="button"
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
      </motion.div>

      {/* Modal - OUTSIDE of motion.div */}
      <AnimatePresence>
        {modalRole && (
          <AddHolderModal
            role={modalRole}
            onClose={handleCloseModal}
            onAdd={handleAddHolder}
          />
        )}
      </AnimatePresence>
    </>
  );
}
