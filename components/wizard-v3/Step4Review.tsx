'use client';

// ============================================
// PROOFY V3 - Step 4: Review & Submit
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from './WizardContext';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Users,
  Music,
  Disc,
  FileCheck,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Hash,
  Clock,
  User,
  Building,
} from 'lucide-react';

export default function Step4Review() {
  const router = useRouter();
  const { state, prevStep, goToStep, dispatch } = useWizard();
  const [expandedSection, setExpandedSection] = useState<string | null>('file');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMandate, setAcceptMandate] = useState(false);

  // Validation checks
  const validations = {
    file: state.fileHash && state.fileName,
    work: state.work.title && state.parties.length > 0,
    masters: state.masters.length > 0,
  };

  const allValid = Object.values(validations).every(Boolean);
  const canSubmit = allValid && acceptTerms;

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build the payload
      const payload = {
        // Basic creation data
        title: state.work.title,
        description: state.work.subtitle || '',
        projectType: 'music',
        fileHash: state.fileHash,
        fileName: state.fileName,
        fileSize: state.fileSize,
        fileType: state.fileType,
        
        // V3 Music Rights data
        musicWork: state.work,
        musicMasters: state.masters,
        musicReleases: state.releases,
        musicParties: state.parties,
        musicMandates: state.mandates,
        audioMetadata: state.audioMetadata,
        
        // Authors (flatten for backward compatibility)
        authors: state.parties
          .filter(p => p.role_tags.some(t => ['author', 'composer', 'main_artist'].includes(t)))
          .map(p => p.full_name)
          .join(', '),
      };

      const response = await fetch('/api/creations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du dépôt');
      }

      // Success! Store result and redirect
      dispatch({ type: 'SET_CREATION_RESULT', creationId: data.id, publicId: data.publicId });
      
      // Redirect to proof page
      router.push(`/proof/${data.publicId}`);
    } catch (error: any) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Section component
  const ReviewSection = ({
    id,
    title,
    icon: Icon,
    isValid,
    editStep,
    children,
  }: {
    id: string;
    title: string;
    icon: React.ElementType;
    isValid: boolean;
    editStep: number;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSection === id;

    return (
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isValid ? 'bg-[#bff227]/20 text-[#bff227]' : 'bg-red-500/20 text-red-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">{title}</p>
              <p className={`text-xs ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                {isValid ? '✓ Complet' : '⚠ Incomplet'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToStep(editStep);
              }}
              className="p-2 text-[#bff227] hover:bg-[#bff227]/10 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10"
            >
              <div className="p-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
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
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#bff227]/20 rounded-2xl mb-4">
          <FileCheck className="w-8 h-8 text-[#bff227]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Vérification et Dépôt</h2>
        <p className="text-gray-400">
          Vérifiez les informations avant de créer votre preuve d'antériorité
        </p>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        {/* File Section */}
        <ReviewSection
          id="file"
          title="Fichier"
          icon={FileText}
          isValid={validations.file}
          editStep={1}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">Nom du fichier</span>
              <span className="text-white font-mono text-sm">{state.fileName || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">Taille</span>
              <span className="text-white text-sm">{formatFileSize(state.fileSize)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">Type</span>
              <span className="text-white text-sm">{state.fileType || '—'}</span>
            </div>
            <div className="py-2">
              <span className="text-gray-400 text-sm block mb-2">Empreinte SHA-256</span>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3">
                <code className="text-[#bff227] text-xs font-mono break-all">
                  {state.fileHash || '—'}
                </code>
              </div>
            </div>
          </div>
        </ReviewSection>

        {/* Work & Parties Section */}
        <ReviewSection
          id="work"
          title="Œuvre & Parties"
          icon={Users}
          isValid={validations.work}
          editStep={2}
        >
          <div className="space-y-4">
            {/* Work Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Titre</span>
                <span className="text-white font-medium">{state.work.title || '—'}</span>
              </div>
              {state.work.iswc && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">ISWC</span>
                  <span className="text-white font-mono text-sm">{state.work.iswc}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Genre</span>
                <span className="text-white text-sm">{state.work.genre || '—'}</span>
              </div>
            </div>

            {/* Parties */}
            {state.parties.length > 0 && (
              <div>
                <p className="text-[#bff227] text-xs font-semibold uppercase tracking-wider mb-3">
                  Parties prenantes ({state.parties.length})
                </p>
                <div className="space-y-2">
                  {state.parties.map((party) => (
                    <div
                      key={party.party_id}
                      className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                    >
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        {party.party_type === 'person' ? (
                          <User className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Building className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{party.display_name}</p>
                        <p className="text-gray-400 text-xs">
                          {party.role_tags.map(r => 
                            r === 'author' ? 'Auteur' :
                            r === 'composer' ? 'Compositeur' :
                            r === 'main_artist' ? 'Artiste principal' :
                            r === 'performer' ? 'Interprète' :
                            r === 'producer' ? 'Producteur' :
                            r === 'publisher' ? 'Éditeur' : r
                          ).join(', ')}
                        </p>
                      </div>
                      {/* Share percentage could be shown here if calculated */}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ReviewSection>

        {/* Masters Section */}
        <ReviewSection
          id="masters"
          title="Enregistrements"
          icon={Music}
          isValid={validations.masters}
          editStep={3}
        >
          <div className="space-y-3">
            {state.masters.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Aucun enregistrement configuré
              </p>
            ) : (
              state.masters.map((master) => (
                <div
                  key={master.master_id}
                  className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                >
                  <div className="w-10 h-10 bg-[#bff227]/20 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-[#bff227]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{master.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="px-2 py-0.5 bg-white/10 rounded-full capitalize">
                        {master.version_type}
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
                          {Math.floor(master.duration_ms / 60000)}:
                          {String(Math.floor((master.duration_ms % 60000) / 1000)).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Releases */}
            {state.releases.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[#bff227] text-xs font-semibold uppercase tracking-wider mb-3">
                  Sorties ({state.releases.length})
                </p>
                {state.releases.map((release) => (
                  <div
                    key={release.release_id}
                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                  >
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Disc className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{release.title}</p>
                      <p className="text-gray-400 text-xs capitalize">
                        {release.release_type} • {release.tracklist.length} piste(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ReviewSection>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#bff227]" />
          Conditions de dépôt
        </h3>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-[#bff227] focus:ring-[#bff227]"
          />
          <span className="text-gray-300 text-sm">
            J'atteste être titulaire des droits sur cette création et j'accepte les{' '}
            <a href="/terms" className="text-[#bff227] hover:underline" target="_blank">
              conditions générales d'utilisation
            </a>{' '}
            de Proofy.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={acceptMandate}
            onChange={(e) => setAcceptMandate(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-[#bff227] focus:ring-[#bff227]"
          />
          <span className="text-gray-300 text-sm">
            J'autorise Artys Network à gérer les métadonnées de cette œuvre conformément au{' '}
            <a href="/mandate" className="text-[#bff227] hover:underline" target="_blank">
              mandat de gestion
            </a>
            . <span className="text-gray-500">(Optionnel)</span>
          </span>
        </label>
      </div>

      {/* Submit Error */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{submitError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-[#bff227]/10 to-[#bff227]/5 border border-[#bff227]/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Résumé du dépôt</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              allValid
                ? 'bg-green-500/20 text-green-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {allValid ? 'Prêt à déposer' : 'Informations manquantes'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{state.parties.length}</p>
            <p className="text-xs text-gray-400">Parties</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{state.masters.length}</p>
            <p className="text-xs text-gray-400">Enregistrements</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{state.releases.length}</p>
            <p className="text-xs text-gray-400">Sorties</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#bff227]">0.001 $</p>
            <p className="text-xs text-gray-400">Coût blockchain</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-white/10">
        <button
          onClick={prevStep}
          disabled={isSubmitting}
          className="px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            canSubmit && !isSubmitting
              ? 'bg-gradient-to-r from-[#bff227] to-[#9dd11e] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#bff227]/30'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Dépôt en cours...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Déposer ma création
            </>
          )}
        </button>
      </div>

      {/* Blockchain Info */}
      <div className="text-center pt-4">
        <p className="text-xs text-gray-500">
          Votre preuve sera enregistrée sur{' '}
          <a
            href="https://polygonscan.com/address/0x33623122f8B30c6988bb27Dd865e95A38Fe0Ef48"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#bff227] hover:underline inline-flex items-center gap-1"
          >
            Polygon Mainnet
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </motion.div>
  );
}
