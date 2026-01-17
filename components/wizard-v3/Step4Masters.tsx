'use client';

// ============================================
// PROOFY V3 - Step 3: Masters & Releases
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from './WizardContext';
import { Plus, Trash2, Music, Disc, ChevronDown, ChevronUp, Info, Clock, Hash } from 'lucide-react';
import type { MusicMaster, MusicRelease, VersionType, ReleaseType } from '@/types/music';
import { generateMasterId, generateReleaseId } from '@/lib/music-rights';

const VERSION_TYPES: { value: VersionType; label: string }[] = [
  { value: 'original', label: 'Original' },
  { value: 'radio_edit', label: 'Radio Edit' },
  { value: 'remix', label: 'Remix' },
  { value: 'live', label: 'Live' },
  { value: 'acoustic', label: 'Acoustique' },
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'a_cappella', label: 'A Cappella' },
  { value: 'extended', label: 'Extended' },
  { value: 'clean', label: 'Clean' },
  { value: 'explicit', label: 'Explicit' },
  { value: 'demo', label: 'Demo' },
  { value: 'other', label: 'Autre' },
];

const RELEASE_TYPES: { value: ReleaseType; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'album', label: 'Album' },
  { value: 'compilation', label: 'Compilation' },
  { value: 'mixtape', label: 'Mixtape' },
  { value: 'live_album', label: 'Album Live' },
];

export default function Step3Masters() {
  const { state, addMaster, updateMaster, removeMaster, addRelease, updateRelease, removeRelease, nextStep, prevStep } = useWizard();
  const [expandedMaster, setExpandedMaster] = useState<string | null>(null);
  const [expandedRelease, setExpandedRelease] = useState<string | null>(null);
  const [showAddMaster, setShowAddMaster] = useState(false);
  const [showAddRelease, setShowAddRelease] = useState(false);

  // New master form state
  const [newMaster, setNewMaster] = useState<Partial<MusicMaster>>({
    title: state.work.title,
    version_type: 'original',
    linked_work_id: state.work.work_id,
    producers: [],
    performers: [],
    neighbouring_rights_splits: [],
  });

  // New release form state
  const [newRelease, setNewRelease] = useState<Partial<MusicRelease>>({
    title: '',
    release_type: 'single',
    tracklist: [],
  });

  const handleAddMaster = () => {
    if (!newMaster.title) return;

    const masterId = generateMasterId();
    addMaster({
      master_id: masterId,
      title: newMaster.title || '',
      version_type: newMaster.version_type || 'original',
      linked_work_id: state.work.work_id,
      isrc: newMaster.isrc,
      duration_ms: newMaster.duration_ms,
      explicit: newMaster.explicit || false,
      producers: newMaster.producers || [],
      performers: state.parties
        .filter((p) => p.role_tags.includes('main_artist') || p.role_tags.includes('performer'))
        .map((p) => ({
          party_ref: p.party_id,
          role: p.role_tags.includes('main_artist') ? 'main_artist' as const : 'performer' as const,
          share: 100 / state.parties.filter((p) => p.role_tags.includes('main_artist') || p.role_tags.includes('performer')).length,
        })),
      neighbouring_rights_splits: [],
    });

    setNewMaster({
      title: state.work.title,
      version_type: 'original',
      linked_work_id: state.work.work_id,
      producers: [],
      performers: [],
      neighbouring_rights_splits: [],
    });
    setShowAddMaster(false);
  };

  const handleAddRelease = () => {
    if (!newRelease.title) return;

    const releaseId = generateReleaseId();
    addRelease({
      release_id: releaseId,
      title: newRelease.title || '',
      release_type: newRelease.release_type || 'single',
      upc: newRelease.upc,
      release_date: newRelease.release_date,
      tracklist: state.masters.map((m, i) => ({
        track_number: i + 1,
        master_ref: m.master_id,
        is_main_track: i === 0,
      })),
    });

    setNewRelease({
      title: '',
      release_type: 'single',
      tracklist: [],
    });
    setShowAddRelease(false);
  };

  // Format duration
  const formatDuration = (ms: number | undefined) => {
    if (!ms) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canContinue = state.masters.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Masters Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-[#bff227]/20 rounded-lg flex items-center justify-center text-[#bff227] text-sm font-bold">1</span>
            Enregistrements (Masters)
          </h2>
          <button
            onClick={() => setShowAddMaster(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#bff227]/10 border border-[#bff227]/30 rounded-xl text-[#bff227] hover:bg-[#bff227]/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-4">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">
            Un master est un enregistrement audio spécifique de l'œuvre. Une même œuvre peut avoir plusieurs masters (original, remix, live, etc.)
          </p>
        </div>

        {/* Masters List */}
        <div className="space-y-3">
          {state.masters.length === 0 ? (
            <div className="text-center py-8 bg-white/5 border border-white/10 rounded-xl">
              <Music className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Aucun enregistrement ajouté</p>
              <button
                onClick={() => setShowAddMaster(true)}
                className="mt-3 text-[#bff227] hover:underline text-sm"
              >
                Ajouter un enregistrement
              </button>
            </div>
          ) : (
            state.masters.map((master) => (
              <motion.div
                key={master.master_id}
                layout
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedMaster(expandedMaster === master.master_id ? null : master.master_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#bff227]/20 rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5 text-[#bff227]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{master.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="px-2 py-0.5 bg-white/10 rounded-full">
                          {VERSION_TYPES.find((v) => v.value === master.version_type)?.label}
                        </span>
                        {master.isrc && (
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {master.isrc}
                          </span>
                        )}
                        {master.duration_ms && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(master.duration_ms)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMaster(master.master_id);
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedMaster === master.master_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Master Details */}
                <AnimatePresence>
                  {expandedMaster === master.master_id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">ISRC</label>
                          <input
                            type="text"
                            value={master.isrc || ''}
                            onChange={(e) => updateMaster(master.master_id, { isrc: e.target.value || null })}
                            placeholder="FR-AB1-23-45678"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Durée (secondes)</label>
                          <input
                            type="number"
                            value={master.duration_ms ? Math.floor(master.duration_ms / 1000) : ''}
                            onChange={(e) => updateMaster(master.master_id, { duration_ms: e.target.value ? parseInt(e.target.value) * 1000 : undefined })}
                            placeholder="180"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Version</label>
                          <select
                            value={master.version_type}
                            onChange={(e) => updateMaster(master.master_id, { version_type: e.target.value as VersionType })}
                            className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm appearance-none cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                          >
                            {VERSION_TYPES.map((v) => (
                              <option key={v.value} value={v.value} className="bg-[#1a1a1a] text-white">{v.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={master.explicit || false}
                              onChange={(e) => updateMaster(master.master_id, { explicit: e.target.checked })}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#bff227] focus:ring-[#bff227]"
                            />
                            <span className="text-sm text-gray-300">Contenu explicite</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Releases Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-[#bff227]/20 rounded-lg flex items-center justify-center text-[#bff227] text-sm font-bold">2</span>
            Sorties (Releases)
          </h2>
          <button
            onClick={() => setShowAddRelease(true)}
            disabled={state.masters.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              state.masters.length === 0
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-[#bff227]/10 border border-[#bff227]/30 text-[#bff227] hover:bg-[#bff227]/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Releases List */}
        <div className="space-y-3">
          {state.releases.length === 0 ? (
            <div className="text-center py-8 bg-white/5 border border-white/10 rounded-xl">
              <Disc className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Aucune sortie configurée</p>
              <p className="text-gray-500 text-sm mt-1">Optionnel - Ajoutez un single, EP ou album</p>
            </div>
          ) : (
            state.releases.map((release) => (
              <motion.div
                key={release.release_id}
                layout
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedRelease(expandedRelease === release.release_id ? null : release.release_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Disc className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{release.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="px-2 py-0.5 bg-purple-500/20 rounded-full text-purple-300">
                          {RELEASE_TYPES.find((r) => r.value === release.release_type)?.label}
                        </span>
                        {release.upc && <span>UPC: {release.upc}</span>}
                        <span>{release.tracklist.length} piste(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRelease(release.release_id);
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedRelease === release.release_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Release Details */}
                <AnimatePresence>
                  {expandedRelease === release.release_id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">UPC / EAN</label>
                          <input
                            type="text"
                            value={release.upc || ''}
                            onChange={(e) => updateRelease(release.release_id, { upc: e.target.value || null })}
                            placeholder="123456789012"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Date de sortie</label>
                          <input
                            type="date"
                            value={release.release_date || ''}
                            onChange={(e) => updateRelease(release.release_id, { release_date: e.target.value })}
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
      </section>

      {/* Add Master Modal */}
      <AnimatePresence>
        {showAddMaster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddMaster(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">Ajouter un enregistrement</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Titre *</label>
                  <input
                    type="text"
                    value={newMaster.title || ''}
                    onChange={(e) => setNewMaster({ ...newMaster, title: e.target.value })}
                    placeholder="Titre de l'enregistrement"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Type de version</label>
                  <select
                    value={newMaster.version_type || 'original'}
                    onChange={(e) => setNewMaster({ ...newMaster, version_type: e.target.value as VersionType })}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white appearance-none cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  >
                    {VERSION_TYPES.map((v) => (
                      <option key={v.value} value={v.value} className="bg-[#1a1a1a] text-white">{v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    ISRC <span className="text-gray-500">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={newMaster.isrc || ''}
                    onChange={(e) => setNewMaster({ ...newMaster, isrc: e.target.value || undefined })}
                    placeholder="FR-AB1-23-45678"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddMaster(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddMaster}
                  disabled={!newMaster.title}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Release Modal */}
      <AnimatePresence>
        {showAddRelease && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddRelease(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">Ajouter une sortie</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Titre *</label>
                  <input
                    type="text"
                    value={newRelease.title || ''}
                    onChange={(e) => setNewRelease({ ...newRelease, title: e.target.value })}
                    placeholder="Titre de la sortie"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Type</label>
                  <select
                    value={newRelease.release_type || 'single'}
                    onChange={(e) => setNewRelease({ ...newRelease, release_type: e.target.value as ReleaseType })}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white appearance-none cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  >
                    {RELEASE_TYPES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-[#1a1a1a] text-white">{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    UPC / EAN <span className="text-gray-500">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={newRelease.upc || ''}
                    onChange={(e) => setNewRelease({ ...newRelease, upc: e.target.value || undefined })}
                    placeholder="123456789012"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Date de sortie</label>
                  <input
                    type="date"
                    value={newRelease.release_date || ''}
                    onChange={(e) => setNewRelease({ ...newRelease, release_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddRelease(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddRelease}
                  disabled={!newRelease.title}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
