'use client';

// ============================================
// PROOFY V3 - Signature Tracker Component
// Real-time tracking of co-signature status
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Eye, 
    Mail, 
    ChevronDown, 
    ChevronUp,
    AlertTriangle,
    RefreshCw,
    Rocket,
    Loader2
} from 'lucide-react';

interface Invitation {
    id: number;
    email: string;
    name: string;
    role: string;
    percentage: number;
    status: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'expired';
    createdAt: string;
    viewedAt?: string;
    signedAt?: string;
    expiresAt: string;
    rejectionReason?: string;
}

interface SignatureStats {
    total: number;
    pending: number;
    viewed: number;
    accepted: number;
    rejected: number;
    expired: number;
}

interface SignatureTrackerProps {
    creationId: string;
    creationTitle: string;
    isExpanded?: boolean;
    onToggle?: () => void;
}

export default function SignatureTracker({ 
    creationId, 
    creationTitle,
    isExpanded = false,
    onToggle
}: SignatureTrackerProps) {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [stats, setStats] = useState<SignatureStats | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [finalizeResult, setFinalizeResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

    const loadSignatures = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/creations/${creationId}/signatures`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement');
            }

            const data = await response.json();
            setInvitations(data.invitations || []);
            setStats(data.stats || null);
            setDaysRemaining(data.creation?.daysRemaining || null);
            setLastUpdated(new Date());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Load on mount and when expanded
    useEffect(() => {
        if (isExpanded && invitations.length === 0) {
            loadSignatures();
        }
    }, [isExpanded, creationId]);

    // Auto-refresh every 30 seconds when expanded
    useEffect(() => {
        if (!isExpanded) return;

        const interval = setInterval(() => {
            loadSignatures();
        }, 30000);

        return () => clearInterval(interval);
    }, [isExpanded, creationId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-400" />;
            case 'viewed':
                return <Eye className="w-4 h-4 text-blue-400" />;
            case 'expired':
                return <AlertTriangle className="w-4 h-4 text-amber-400" />;
            default:
                return <Mail className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'Signé';
            case 'rejected':
                return 'Refusé';
            case 'viewed':
                return 'Vu';
            case 'expired':
                return 'Expiré';
            default:
                return 'En attente';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'rejected':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'viewed':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'expired':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    // Progress calculation
    const progress = stats ? Math.round((stats.accepted / stats.total) * 100) : 0;
    const allSigned = stats ? stats.accepted === stats.total && stats.total > 0 : false;
    const hasRejection = stats ? stats.rejected > 0 : false;

    // Finalize deposit (trigger blockchain anchoring)
    const handleFinalize = async () => {
        setIsFinalizing(true);
        setFinalizeResult(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/creations/${creationId}/finalize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la finalisation');
            }

            setFinalizeResult({
                success: true,
                message: data.message,
                txHash: data.txHash
            });

            // Reload page after 2 seconds to show updated status
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err: any) {
            setFinalizeResult({
                success: false,
                message: err.message
            });
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <div className="mt-4 border-t border-white/10 pt-4">
            {/* Toggle Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between text-left hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-white">
                            Suivi des signatures
                        </span>
                        {stats && (
                            <span className="ml-2 text-xs text-gray-400">
                                ({stats.accepted}/{stats.total} signées)
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {daysRemaining !== null && daysRemaining > 0 && (
                        <span className="text-xs text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {daysRemaining}j restants
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 space-y-4">
                            {/* Progress Bar */}
                            {stats && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Progression</span>
                                        <span className={allSigned ? 'text-emerald-400' : 'text-white'}>
                                            {progress}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.5 }}
                                            className={`h-full rounded-full ${
                                                allSigned 
                                                    ? 'bg-emerald-500' 
                                                    : hasRejection 
                                                        ? 'bg-red-500' 
                                                        : 'bg-blue-500'
                                            }`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Stats Summary */}
                            {stats && (
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                                        <div className="text-lg font-bold text-emerald-400">{stats.accepted}</div>
                                        <div className="text-xs text-gray-400">Signés</div>
                                    </div>
                                    <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                                        <div className="text-lg font-bold text-blue-400">{stats.viewed}</div>
                                        <div className="text-xs text-gray-400">Vus</div>
                                    </div>
                                    <div className="bg-gray-500/10 rounded-lg p-2 text-center">
                                        <div className="text-lg font-bold text-gray-400">{stats.pending}</div>
                                        <div className="text-xs text-gray-400">En attente</div>
                                    </div>
                                    <div className="bg-red-500/10 rounded-lg p-2 text-center">
                                        <div className="text-lg font-bold text-red-400">{stats.rejected}</div>
                                        <div className="text-xs text-gray-400">Refusés</div>
                                    </div>
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex items-center justify-center py-4">
                                    <RefreshCw className="w-5 h-5 text-[#bff227] animate-spin" />
                                    <span className="ml-2 text-sm text-gray-400">Chargement...</span>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-red-400 text-sm">{error}</p>
                                    <button
                                        onClick={loadSignatures}
                                        className="text-xs text-red-300 hover:text-white mt-1"
                                    >
                                        Réessayer
                                    </button>
                                </div>
                            )}

                            {/* Invitations List */}
                            {!isLoading && !error && invitations.length > 0 && (
                                <div className="space-y-2">
                                    {invitations.map((inv) => (
                                        <div
                                            key={inv.id}
                                            className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(inv.status)}
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {inv.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {inv.role} • {inv.percentage}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(inv.status)}`}>
                                                    {getStatusLabel(inv.status)}
                                                </span>
                                                {inv.signedAt && (
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(inv.signedAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* No invitations yet */}
                            {!isLoading && !error && invitations.length === 0 && (
                                <div className="text-center py-4 text-gray-400 text-sm">
                                    Aucune invitation envoyée pour le moment.
                                </div>
                            )}

                            {/* Finalize Button - Show when all signed */}
                            {allSigned && !finalizeResult?.success && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-r from-[#bff227]/20 to-emerald-500/20 border border-[#bff227]/50 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold text-[#bff227] flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Toutes les signatures reçues !
                                            </h4>
                                            <p className="text-xs text-gray-300 mt-1">
                                                Cliquez pour ancrer votre dépôt sur la blockchain Polygon.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleFinalize}
                                            disabled={isFinalizing}
                                            className="px-4 py-2 bg-[#bff227] hover:bg-[#a8d620] disabled:bg-gray-600 
                                                     text-black font-semibold rounded-lg transition-colors
                                                     flex items-center gap-2"
                                        >
                                            {isFinalizing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Ancrage...
                                                </>
                                            ) : (
                                                <>
                                                    <Rocket className="w-4 h-4" />
                                                    Finaliser le dépôt
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Finalize Result */}
                            {finalizeResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`rounded-lg p-4 ${
                                        finalizeResult.success 
                                            ? 'bg-emerald-500/20 border border-emerald-500/50' 
                                            : 'bg-red-500/20 border border-red-500/50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {finalizeResult.success ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${
                                                finalizeResult.success ? 'text-emerald-400' : 'text-red-400'
                                            }`}>
                                                {finalizeResult.message}
                                            </p>
                                            {finalizeResult.txHash && (
                                                <a
                                                    href={`https://polygonscan.com/tx/${finalizeResult.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-[#bff227] hover:underline mt-1 inline-block"
                                                >
                                                    Voir sur Polygonscan →
                                                </a>
                                            )}
                                            {finalizeResult.success && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Rechargement de la page dans 2 secondes...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Refresh Button */}
                            {!isLoading && (
                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    <span className="text-xs text-gray-500">
                                        {lastUpdated && `Mis à jour: ${lastUpdated.toLocaleTimeString('fr-FR')}`}
                                    </span>
                                    <button
                                        onClick={loadSignatures}
                                        className="text-xs text-[#bff227] hover:text-white flex items-center gap-1 transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Actualiser
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
