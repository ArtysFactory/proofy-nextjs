'use client';

// ============================================
// PROOFY V3 - Step 2: Work & Parties
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from './WizardContext';
import { Plus, Trash2, User, Building2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { MusicParty, WorkContributorRef, RoleTag } from '@/types/music';
import { generatePartyId } from '@/lib/music-rights';

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Jazz', 'Classical',
  'Reggae', 'Country', 'Folk', 'Metal', 'Punk', 'Soul', 'Funk',
  'Blues', 'Latin', 'World', 'Ambient', 'House', 'Techno', 'Trap', 'Other'
];

const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
];

const ROLE_OPTIONS: { value: RoleTag; label: string; description: string }[] = [
  { value: 'author', label: 'Auteur', description: 'Écrit les paroles' },
  { value: 'composer', label: 'Compositeur', description: 'Compose la musique' },
  { value: 'arranger', label: 'Arrangeur', description: 'Arrange la musique' },
  { value: 'publisher', label: 'Éditeur', description: 'Publie l\'œuvre' },
  { value: 'main_artist', label: 'Artiste principal', description: 'Interprète principal' },
  { value: 'performer', label: 'Interprète', description: 'Musicien / Chanteur' },
  { value: 'phonographic_producer', label: 'Producteur phonographique', description: 'Produit l\'enregistrement' },
];

export default function Step2WorkParties() {
  const { state, updateWork, addParty, updateParty, removeParty, nextStep, prevStep } = useWizard();
  const [expandedParty, setExpandedParty] = useState<string | null>(null);
  const [showAddParty, setShowAddParty] = useState(false);

  // New party form state
  const [newParty, setNewParty] = useState<Partial<MusicParty>>({
    type: 'natural_person',
    display_name: '',
    role_tags: ['author'],
  });

  const handleAddParty = () => {
    if (!newParty.display_name) return;

    addParty({
      party_id: generatePartyId(),
      type: newParty.type || 'natural_person',
      display_name: newParty.display_name,
      legal_name: newParty.legal_name,
      role_tags: newParty.role_tags || ['author'],
      email: newParty.email,
      country: newParty.country,
      ipi: newParty.ipi,
      isni: newParty.isni,
    });

    // Auto-add as author/composer to work
    const partyId = generatePartyId();
    if (newParty.role_tags?.includes('author')) {
      updateWork({
        authors: [
          ...state.work.authors,
          { party_ref: partyId, role: 'author', share: 100 / (state.work.authors.length + 1) },
        ],
      });
    }
    if (newParty.role_tags?.includes('composer')) {
      updateWork({
        composers: [
          ...state.work.composers,
          { party_ref: partyId, role: 'composer', share: 100 / (state.work.composers.length + 1) },
        ],
      });
    }

    // Reset form
    setNewParty({
      type: 'natural_person',
      display_name: '',
      role_tags: ['author'],
    });
    setShowAddParty(false);
  };

  const totalAuthorsShare = state.work.authors.reduce((sum, a) => sum + (a.share || 0), 0);
  const totalComposersShare = state.work.composers.reduce((sum, c) => sum + (c.share || 0), 0);

  const canContinue = state.work.title && state.parties.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Work Information */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-[#bff227]/20 rounded-lg flex items-center justify-center text-[#bff227] text-sm font-bold">1</span>
          Informations sur l'œuvre
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de l'œuvre *
            </label>
            <input
              type="text"
              value={state.work.title}
              onChange={(e) => updateWork({ title: e.target.value })}
              placeholder="Ex: Ma Chanson"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none transition-colors"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genre musical
            </label>
            <select
              value={state.work.genre || ''}
              onChange={(e) => updateWork({ genre: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#bff227] focus:outline-none transition-colors"
            >
              <option value="">Sélectionner un genre</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre.toLowerCase()}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Langue des paroles
            </label>
            <select
              value={state.work.language || 'fr'}
              onChange={(e) => updateWork({ language: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#bff227] focus:outline-none transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* ISWC (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ISWC <span className="text-gray-500">(optionnel)</span>
            </label>
            <input
              type="text"
              value={state.work.iswc || ''}
              onChange={(e) => updateWork({ iswc: e.target.value || null })}
              placeholder="T-123456789-0"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#bff227] focus:outline-none transition-colors"
            />
          </div>

          {/* Creation Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date de création
            </label>
            <input
              type="date"
              value={state.work.creation_date || ''}
              onChange={(e) => updateWork({ creation_date: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#bff227] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Parties (Ayants droit) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-[#bff227]/20 rounded-lg flex items-center justify-center text-[#bff227] text-sm font-bold">2</span>
            Ayants droit
          </h2>
          <button
            onClick={() => setShowAddParty(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#bff227]/10 border border-[#bff227]/30 rounded-xl text-[#bff227] hover:bg-[#bff227]/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-4">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">
            Ajoutez tous les ayants droit de l'œuvre : auteurs, compositeurs, éditeurs, artistes, producteurs...
          </p>
        </div>

        {/* Parties List */}
        <div className="space-y-3">
          {state.parties.length === 0 ? (
            <div className="text-center py-8 bg-white/5 border border-white/10 rounded-xl">
              <User className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Aucun ayant droit ajouté</p>
              <button
                onClick={() => setShowAddParty(true)}
                className="mt-3 text-[#bff227] hover:underline text-sm"
              >
                Ajouter un ayant droit
              </button>
            </div>
          ) : (
            state.parties.map((party) => (
              <motion.div
                key={party.party_id}
                layout
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                {/* Party Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedParty(expandedParty === party.party_id ? null : party.party_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      party.type === 'legal_entity' ? 'bg-purple-500/20' : 'bg-[#bff227]/20'
                    }`}>
                      {party.type === 'legal_entity' ? (
                        <Building2 className="w-5 h-5 text-purple-400" />
                      ) : (
                        <User className="w-5 h-5 text-[#bff227]" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{party.display_name}</p>
                      <div className="flex gap-2 mt-1">
                        {party.role_tags.map((role) => (
                          <span
                            key={role}
                            className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-300"
                          >
                            {ROLE_OPTIONS.find((r) => r.value === role)?.label || role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeParty(party.party_id);
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedParty === party.party_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Party Details (Expanded) */}
                <AnimatePresence>
                  {expandedParty === party.party_id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Email</label>
                          <input
                            type="email"
                            value={party.email || ''}
                            onChange={(e) => updateParty(party.party_id, { email: e.target.value })}
                            placeholder="email@exemple.com"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Pays</label>
                          <input
                            type="text"
                            value={party.country || ''}
                            onChange={(e) => updateParty(party.party_id, { country: e.target.value })}
                            placeholder="FR"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">IPI</label>
                          <input
                            type="text"
                            value={party.ipi || ''}
                            onChange={(e) => updateParty(party.party_id, { ipi: e.target.value || null })}
                            placeholder="00000000000"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">ISNI</label>
                          <input
                            type="text"
                            value={party.isni || ''}
                            onChange={(e) => updateParty(party.party_id, { isni: e.target.value || null })}
                            placeholder="0000000000000000"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Party Modal */}
        <AnimatePresence>
          {showAddParty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddParty(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-white mb-4">Ajouter un ayant droit</h3>

                <div className="space-y-4">
                  {/* Type */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setNewParty({ ...newParty, type: 'natural_person' })}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                        newParty.type === 'natural_person'
                          ? 'border-[#bff227] bg-[#bff227]/10 text-[#bff227]'
                          : 'border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Personne
                    </button>
                    <button
                      onClick={() => setNewParty({ ...newParty, type: 'legal_entity' })}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                        newParty.type === 'legal_entity'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                          : 'border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Entreprise
                    </button>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      {newParty.type === 'legal_entity' ? 'Raison sociale' : 'Nom d\'artiste / Pseudonyme'} *
                    </label>
                    <input
                      type="text"
                      value={newParty.display_name || ''}
                      onChange={(e) => setNewParty({ ...newParty, display_name: e.target.value })}
                      placeholder={newParty.type === 'legal_entity' ? 'Ma Société SARL' : 'Nom Artiste'}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  {/* Legal Name */}
                  {newParty.type === 'natural_person' && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Nom légal <span className="text-gray-500">(optionnel)</span>
                      </label>
                      <input
                        type="text"
                        value={newParty.legal_name || ''}
                        onChange={(e) => setNewParty({ ...newParty, legal_name: e.target.value })}
                        placeholder="Prénom Nom"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                      />
                    </div>
                  )}

                  {/* Roles */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Rôles *</label>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_OPTIONS.map((role) => (
                        <button
                          key={role.value}
                          onClick={() => {
                            const currentRoles = newParty.role_tags || [];
                            const newRoles = currentRoles.includes(role.value)
                              ? currentRoles.filter((r) => r !== role.value)
                              : [...currentRoles, role.value];
                            setNewParty({ ...newParty, role_tags: newRoles });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            newParty.role_tags?.includes(role.value)
                              ? 'bg-[#bff227]/20 border border-[#bff227] text-[#bff227]'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Email <span className="text-gray-500">(optionnel)</span>
                    </label>
                    <input
                      type="email"
                      value={newParty.email || ''}
                      onChange={(e) => setNewParty({ ...newParty, email: e.target.value })}
                      placeholder="email@exemple.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddParty(false)}
                    className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddParty}
                    disabled={!newParty.display_name || !newParty.role_tags?.length}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

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
          disabled={!canContinue}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            canContinue
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
  );
}
