'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Users, 
  AlertTriangle,
  Loader2,
  Music,
  Image as ImageIcon,
  Video,
  FileCode,
  File,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';

interface InvitationData {
  invitation: {
    id: number;
    email: string;
    role: string;
    percentage: number;
    status: string;
    expiresAt: string;
  };
  creation: {
    id: number;
    title: string;
    projectType: string;
    fileHash: string;
    createdAt: string;
  };
  depositor: {
    name: string;
  };
  allSignatories: Array<{
    email: string;
    role: string;
    percentage: number;
    status: string;
    signedAt: string | null;
  }>;
}

const projectTypeIcons: Record<string, typeof Music> = {
  music: Music,
  visual: ImageIcon,
  video: Video,
  code: FileCode,
  other: File
};

export default function SignPage() {
  const t = useTranslations('cosign');
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const locale = params.locale as string;

  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [success, setSuccess] = useState<'signed' | 'rejected' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!token && !!user);
    setCheckingAuth(false);
  }, []);

  // Charger les données de l'invitation
  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/sign/${token}`);
        const result = await response.json();
        
        if (!response.ok) {
          setError(result.error || 'Invitation not found');
          return;
        }
        
        setData(result);
      } catch (err) {
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    }
    
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleSign = async () => {
    if (!isAuthenticated) {
      // Rediriger vers signup avec un redirect back
      router.push(`/${locale}/signup?redirect=/sign/${token}`);
      return;
    }

    setSigning(true);
    try {
      const authToken = localStorage.getItem('token');
      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ action: 'sign' })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign');
      }

      setSuccess('signed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/signup?redirect=/sign/${token}`);
      return;
    }

    setRejecting(true);
    try {
      const authToken = localStorage.getItem('token');
      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          action: 'reject',
          reason: rejectReason || undefined
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject');
      }

      setSuccess('rejected');
      setShowRejectModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRejecting(false);
    }
  };

  const ProjectIcon = data ? (projectTypeIcons[data.creation.projectType] || File) : File;
  const daysRemaining = data ? Math.ceil((new Date(data.invitation.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  // Loading state
  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-[#bff227]" />
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md w-full text-center border border-red-500/30"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{t('error.title')}</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#bff227] text-black font-semibold rounded-xl hover:bg-[#d4ff4d] transition-colors"
          >
            {t('error.backHome')}
          </Link>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md w-full text-center border border-[#bff227]/30"
        >
          {success === 'signed' ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <CheckCircle2 className="w-20 h-20 text-[#bff227] mx-auto mb-4" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">{t('success.signedTitle')}</h1>
              <p className="text-gray-400 mb-6">{t('success.signedMessage')}</p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <XCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">{t('success.rejectedTitle')}</h1>
              <p className="text-gray-400 mb-6">{t('success.rejectedMessage')}</p>
            </>
          )}
          <Link 
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#bff227] text-black font-semibold rounded-xl hover:bg-[#d4ff4d] transition-colors"
          >
            {t('success.goToDashboard')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // Already processed - handle signed, accepted (legacy), rejected, expired, viewed statuses
  const isPending = data?.invitation.status === 'pending' || data?.invitation.status === 'viewed';
  
  if (data && !isPending) {
    const status = data.invitation.status;
    const isSigned = status === 'signed' || status === 'accepted';
    const isRejected = status === 'rejected';
    // If not signed and not rejected, it's expired
    
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md w-full text-center border border-gray-700"
        >
          {isSigned ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-[#bff227] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">{t('alreadySigned.title')}</h1>
              <p className="text-gray-400">{t('alreadySigned.message')}</p>
            </>
          ) : isRejected ? (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">{t('alreadyRejected.title')}</h1>
              <p className="text-gray-400">{t('alreadyRejected.message')}</p>
            </>
          ) : (
            <>
              <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">{t('expired.title')}</h1>
              <p className="text-gray-400">{t('expired.message')}</p>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-[#bff227] hover:text-white transition-colors">
          <Shield className="w-8 h-8" />
          <span className="text-xl font-bold">UnlmtdProof</span>
        </Link>
      </div>

      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Alert: Expiration warning */}
        {daysRemaining <= 3 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 flex items-start gap-3"
          >
            <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-400 font-medium">{t('warning.expiresIn', { days: daysRemaining })}</p>
              <p className="text-orange-400/70 text-sm">{t('warning.expiresMessage')}</p>
            </div>
          </motion.div>
        )}

        {/* Card principale */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#bff227]/10 to-transparent p-6 border-b border-gray-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-[#bff227]/20 flex items-center justify-center">
                <ProjectIcon className="w-7 h-7 text-[#bff227]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{data?.creation.title}</h1>
                <p className="text-gray-400">{t('invitedBy', { name: data?.depositor.name })}</p>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-6">
            {/* Votre rôle */}
            <div className="bg-[#252525] rounded-xl p-4">
              <h2 className="text-sm font-medium text-gray-400 mb-3">{t('yourRole')}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#bff227]" />
                  <span className="text-white font-medium">{data?.invitation.role}</span>
                </div>
                <div className="px-3 py-1 bg-[#bff227]/10 rounded-full">
                  <span className="text-[#bff227] font-bold">{data?.invitation.percentage}%</span>
                </div>
              </div>
            </div>

            {/* Détails de l'œuvre */}
            <div className="bg-[#252525] rounded-xl p-4">
              <h2 className="text-sm font-medium text-gray-400 mb-3">{t('workDetails')}</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('type')}</span>
                  <span className="text-white">{data?.creation.projectType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('hash')}</span>
                  <span className="text-white font-mono text-sm">{data?.creation.fileHash.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('createdAt')}</span>
                  <span className="text-white">{new Date(data?.creation.createdAt || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Co-signataires */}
            <div className="bg-[#252525] rounded-xl p-4">
              <h2 className="text-sm font-medium text-gray-400 mb-3">{t('allSignatories')}</h2>
              <div className="space-y-2">
                {data?.allSignatories.map((sig, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      {sig.status === 'signed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : sig.status === 'rejected' ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-500" />
                      )}
                      <div>
                        <span className="text-white">{sig.role}</span>
                        <span className="text-gray-500 text-sm ml-2">({sig.percentage}%)</span>
                      </div>
                    </div>
                    <span className={`text-sm ${
                      sig.status === 'signed' ? 'text-green-500' : 
                      sig.status === 'rejected' ? 'text-red-500' : 
                      'text-orange-500'
                    }`}>
                      {sig.status === 'signed' ? t('status.signed') : 
                       sig.status === 'rejected' ? t('status.rejected') : 
                       t('status.pending')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Règle des 7 jours */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-400 font-medium">{t('rule7days.title')}</p>
                  <p className="text-blue-400/70 text-sm">{t('rule7days.description')}</p>
                </div>
              </div>
            </div>

            {/* Auth required */}
            {!isAuthenticated && (
              <div className="bg-[#bff227]/10 border border-[#bff227]/30 rounded-xl p-4">
                <p className="text-[#bff227] text-center mb-4">{t('authRequired')}</p>
                <div className="flex gap-3 justify-center">
                  <Link 
                    href={`/${locale}/login?redirect=/sign/${token}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('login')}
                  </Link>
                  <Link 
                    href={`/${locale}/signup?redirect=/sign/${token}`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#bff227] text-black rounded-xl hover:bg-[#d4ff4d] transition-colors font-semibold"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('signup')}
                  </Link>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={rejecting || !isAuthenticated}
                className="flex-1 px-6 py-4 border border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-gray-800 hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('reject')}
              </button>
              <button
                onClick={handleSign}
                disabled={signing || !isAuthenticated}
                className="flex-1 px-6 py-4 bg-[#bff227] text-black font-semibold rounded-xl hover:bg-[#d4ff4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {signing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {t('sign')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de refus */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">{t('rejectModal.title')}</h2>
              <p className="text-gray-400 mb-4">{t('rejectModal.description')}</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('rejectModal.placeholder')}
                className="w-full px-4 py-3 bg-[#252525] border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none h-32 focus:outline-none focus:border-[#bff227]"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  {t('rejectModal.cancel')}
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejecting}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {rejecting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t('rejectModal.confirm')
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
