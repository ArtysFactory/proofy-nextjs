'use client';

// ============================================
// PROOFY V3 - Rights Management Page
// Modifier les droits d'auteur et voisins d'une création
// ============================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Save,
  CheckCircle2,
  AlertTriangle,
  PenLine,
  Music2,
  BookOpen,
  Mic2,
  Disc3,
  Building2,
  Users,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';

// Types
interface RightsHolder {
  id: string;
  name: string;
  percentage: number;
  email?: string;
  ipi?: string;
  ipn?: string;
  role?: string;
}

interface CopyrightRights {
  authors: RightsHolder[];
  composers: RightsHolder[];
  publishers: RightsHolder[];
}

interface NeighboringRights {
  enabled: boolean;
  producers: RightsHolder[];
  performers: RightsHolder[];
  labels: RightsHolder[];
  others: RightsHolder[];
}

interface CreationData {
  id: number;
  publicId: string;
  title: string;
  fileHash?: string;
  projectType?: string;
  status?: string;
  createdAt?: string;
  txHash?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  copyrightRights?: CopyrightRights;
  neighboringRights?: NeighboringRights;
}

// Default values
const defaultCopyrightRights: CopyrightRights = {
  authors: [{ id: '1', name: '', percentage: 100 }],
  composers: [],
  publishers: [],
};

const defaultNeighboringRights: NeighboringRights = {
  enabled: false,
  producers: [],
  performers: [],
  labels: [],
  others: [],
};

export default function RightsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const publicId = params.id as string;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [creation, setCreation] = useState<CreationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rights state
  const [copyrightRights, setCopyrightRights] = useState<CopyrightRights>(defaultCopyrightRights);
  const [neighboringRights, setNeighboringRights] = useState<NeighboringRights>(defaultNeighboringRights);

  // Modal state
  const [showAddModal, setShowAddModal] = useState<{ type: 'copyright' | 'neighboring'; role: string } | null>(null);
  const [newHolder, setNewHolder] = useState({ name: '', percentage: 0, email: '', ipi: '', ipn: '', role: '' });

  // Load creation data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadCreation();
  }, [publicId]);

  const loadCreation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/proof/${publicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Création introuvable');
      }

      const data = await response.json();
      const creationData = data.creation;
      setCreation(creationData);

      // Load existing rights or initialize with depositor info
      if (creationData.copyrightRights) {
        setCopyrightRights(creationData.copyrightRights);
      } else {
        // Initialize with depositor as default author
        const depositorName = [creationData.firstName, creationData.lastName].filter(Boolean).join(' ') || 'Déposant';
        setCopyrightRights({
          authors: [{ id: '1', name: depositorName, percentage: 100, email: creationData.email || '' }],
          composers: [],
          publishers: [],
        });
      }
      
      if (creationData.neighboringRights) {
        setNeighboringRights(creationData.neighboringRights);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const copyrightTotal =
    copyrightRights.authors.reduce((sum, h) => sum + h.percentage, 0) +
    copyrightRights.composers.reduce((sum, h) => sum + h.percentage, 0) +
    copyrightRights.publishers.reduce((sum, h) => sum + h.percentage, 0);

  const neighboringTotal = neighboringRights.enabled
    ? neighboringRights.producers.reduce((sum, h) => sum + h.percentage, 0) +
      neighboringRights.performers.reduce((sum, h) => sum + h.percentage, 0) +
      neighboringRights.labels.reduce((sum, h) => sum + h.percentage, 0) +
      neighboringRights.others.reduce((sum, h) => sum + h.percentage, 0)
    : 0;

  const isValid =
    copyrightTotal === 100 && (!neighboringRights.enabled || neighboringTotal === 100);

  // Save rights
  const handleSave = async () => {
    if (!isValid) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/creations/${publicId}/rights`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          copyrightRights,
          neighboringRights,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSuccessMessage('Droits mis à jour avec succès !');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Add holder
  const addHolder = () => {
    if (!showAddModal || !newHolder.name) return;

    const holder: RightsHolder = {
      id: Date.now().toString(),
      name: newHolder.name,
      percentage: newHolder.percentage,
      email: newHolder.email || undefined,
      ipi: newHolder.ipi || undefined,
      ipn: newHolder.ipn || undefined,
      role: newHolder.role || undefined,
    };

    if (showAddModal.type === 'copyright') {
      const role = showAddModal.role as 'authors' | 'composers' | 'publishers';
      setCopyrightRights({
        ...copyrightRights,
        [role]: [...copyrightRights[role], holder],
      });
    } else {
      const role = showAddModal.role as 'producers' | 'performers' | 'labels' | 'others';
      setNeighboringRights({
        ...neighboringRights,
        [role]: [...neighboringRights[role], holder],
      });
    }

    setNewHolder({ name: '', percentage: 0, email: '', ipi: '', ipn: '', role: '' });
    setShowAddModal(null);
  };

  // Remove holder
  const removeHolder = (type: 'copyright' | 'neighboring', role: string, id: string) => {
    if (type === 'copyright') {
      const r = role as 'authors' | 'composers' | 'publishers';
      setCopyrightRights({
        ...copyrightRights,
        [r]: copyrightRights[r].filter((h) => h.id !== id),
      });
    } else {
      const r = role as 'producers' | 'performers' | 'labels' | 'others';
      setNeighboringRights({
        ...neighboringRights,
        [r]: neighboringRights[r].filter((h) => h.id !== id),
      });
    }
  };

  // Update holder percentage
  const updatePercentage = (type: 'copyright' | 'neighboring', role: string, id: string, percentage: number) => {
    if (type === 'copyright') {
      const r = role as 'authors' | 'composers' | 'publishers';
      setCopyrightRights({
        ...copyrightRights,
        [r]: copyrightRights[r].map((h) => (h.id === id ? { ...h, percentage } : h)),
      });
    } else {
      const r = role as 'producers' | 'performers' | 'labels' | 'others';
      setNeighboringRights({
        ...neighboringRights,
        [r]: neighboringRights[r].map((h) => (h.id === id ? { ...h, percentage } : h)),
      });
    }
  };

  // Update holder name
  const updateName = (type: 'copyright' | 'neighboring', role: string, id: string, name: string) => {
    if (type === 'copyright') {
      const r = role as 'authors' | 'composers' | 'publishers';
      setCopyrightRights({
        ...copyrightRights,
        [r]: copyrightRights[r].map((h) => (h.id === id ? { ...h, name } : h)),
      });
    } else {
      const r = role as 'producers' | 'performers' | 'labels' | 'others';
      setNeighboringRights({
        ...neighboringRights,
        [r]: neighboringRights[r].map((h) => (h.id === id ? { ...h, name } : h)),
      });
    }
  };

  // Section component
  const RoleSection = ({
    type,
    role,
    label,
    sublabel,
    icon: Icon,
    color,
    holders,
  }: {
    type: 'copyright' | 'neighboring';
    role: string;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    color: string;
    holders: RightsHolder[];
  }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${color}`} />
          <div>
            <span className="text-white font-medium">{label}</span>
            <span className="text-gray-500 text-sm ml-2">({sublabel})</span>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal({ type, role })}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#bff227]/10 border border-[#bff227]/30 rounded-lg text-[#bff227] text-sm hover:bg-[#bff227]/20 transition-colors"
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
                <input
                  type="text"
                  value={holder.name}
                  onChange={(e) => updateName(type, role, holder.id, e.target.value)}
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
                  onChange={(e) =>
                    updatePercentage(type, role, holder.id, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))
                  }
                  className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm text-center"
                />
                <span className="text-gray-400 text-sm">%</span>
              </div>
              <button
                onClick={() => removeHolder(type, role, holder.id)}
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#bff227] animate-spin" />
      </div>
    );
  }

  // Error state
  if (error && !creation) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Erreur</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/dashboard" className="text-[#bff227] hover:underline">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/" className="text-xl font-bold text-[#bff227]">
            Proofy
          </Link>
          <div className="w-24" />
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Gérer les droits</h1>
            <p className="text-gray-400">{creation?.title}</p>
          </motion.div>

          {/* Creation Info Card */}
          {creation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-br from-[#bff227]/10 to-[#bff227]/5 border border-[#bff227]/30 rounded-2xl p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#bff227]" />
                Informations du dépôt
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Titre de l'œuvre</p>
                  <p className="text-white font-medium">{creation.title}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Type de projet</p>
                  <p className="text-white capitalize">{creation.projectType || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Déposant</p>
                  <p className="text-white">
                    {[creation.firstName, creation.lastName].filter(Boolean).join(' ') || 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Date de dépôt</p>
                  <p className="text-white">
                    {creation.createdAt 
                      ? new Date(creation.createdAt).toLocaleDateString('fr-FR', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })
                      : 'Non spécifié'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Empreinte SHA-256</p>
                  <p className="text-[#bff227] font-mono text-xs break-all">{creation.fileHash || 'Non disponible'}</p>
                </div>
                {creation.txHash && (
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Transaction Blockchain</p>
                    <a 
                      href={`https://polygonscan.com/tx/${creation.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#bff227] font-mono text-xs break-all hover:underline"
                    >
                      {creation.txHash}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Success/Error Messages */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl"
              >
                <CheckCircle2 className="w-5 h-5" />
                <p>{successMessage}</p>
              </motion.div>
            )}
            {error && creation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl"
              >
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Copyright Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <PenLine className="w-5 h-5 text-[#bff227]" />
              Droits d'auteur
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Répartition des droits sur l'œuvre (paroles, composition, édition) — Total = 100%
            </p>

            <div className="space-y-4">
              <RoleSection
                type="copyright"
                role="authors"
                label="Auteur(s)"
                sublabel="paroliers, textes"
                icon={PenLine}
                color="text-yellow-400"
                holders={copyrightRights.authors}
              />
              <RoleSection
                type="copyright"
                role="composers"
                label="Compositeur(s)"
                sublabel="musique"
                icon={Music2}
                color="text-pink-400"
                holders={copyrightRights.composers}
              />
              <RoleSection
                type="copyright"
                role="publishers"
                label="Éditeur(s)"
                sublabel="droits d'édition"
                icon={BookOpen}
                color="text-orange-400"
                holders={copyrightRights.publishers}
              />
            </div>

            {/* Total */}
            <div
              className={`mt-4 flex items-center justify-between p-4 rounded-xl border-2 ${
                copyrightTotal === 100
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-red-500/10 border-red-500/50'
              }`}
            >
              <span className="text-white font-medium">Total droits d'auteur</span>
              <span className={`text-2xl font-bold ${copyrightTotal === 100 ? 'text-green-400' : 'text-red-400'}`}>
                {copyrightTotal}%
              </span>
            </div>
          </motion.div>

          {/* Neighboring Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mic2 className="w-5 h-5 text-purple-400" />
                  Droits voisins
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Répartition des royalties sur l'enregistrement (master)
                </p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-gray-400 text-sm">{neighboringRights.enabled ? 'Activés' : 'Désactivés'}</span>
                <div
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    neighboringRights.enabled ? 'bg-[#bff227]' : 'bg-white/20'
                  }`}
                  onClick={() => setNeighboringRights({ ...neighboringRights, enabled: !neighboringRights.enabled })}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      neighboringRights.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>
            </div>

            {neighboringRights.enabled ? (
              <>
                <div className="space-y-4">
                  <RoleSection
                    type="neighboring"
                    role="producers"
                    label="Producteur(s) phonographique"
                    sublabel="financement master"
                    icon={Disc3}
                    color="text-purple-400"
                    holders={neighboringRights.producers}
                  />
                  <RoleSection
                    type="neighboring"
                    role="performers"
                    label="Artiste(s)-interprète(s)"
                    sublabel="voix, instruments"
                    icon={Mic2}
                    color="text-cyan-400"
                    holders={neighboringRights.performers}
                  />
                  <RoleSection
                    type="neighboring"
                    role="labels"
                    label="Label(s)"
                    sublabel="distribution"
                    icon={Building2}
                    color="text-green-400"
                    holders={neighboringRights.labels}
                  />
                  <RoleSection
                    type="neighboring"
                    role="others"
                    label="Autre(s)"
                    sublabel="autres ayants droit"
                    icon={Users}
                    color="text-orange-400"
                    holders={neighboringRights.others}
                  />
                </div>

                {/* Total */}
                <div
                  className={`mt-4 flex items-center justify-between p-4 rounded-xl border-2 ${
                    neighboringTotal === 100
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-red-500/10 border-red-500/50'
                  }`}
                >
                  <span className="text-white font-medium">Total droits voisins</span>
                  <span className={`text-2xl font-bold ${neighboringTotal === 100 ? 'text-green-400' : 'text-red-400'}`}>
                    {neighboringTotal}%
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-300">
                  Activez les droits voisins si vous avez un enregistrement (master) avec des producteurs, interprètes
                  ou labels à rémunérer.
                </p>
              </div>
            )}
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSave}
              disabled={!isValid || isSaving}
              className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                isValid && !isSaving
                  ? 'bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#bff227]/30'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Sauvegarder les droits
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>

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
              <h3 className="text-lg font-bold text-white mb-4">Ajouter un ayant droit</h3>

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
                      onChange={(e) =>
                        setNewHolder({ ...newHolder, percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                      }
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
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(null)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={addHolder}
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
    </div>
  );
}
