'use client';

// ============================================
// PROOFY V3 - New Creation Wizard (Music Rights)
// ============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Dynamic import to avoid SSR issues with client components
const WizardV3 = dynamic(() => import('@/components/wizard-v3/WizardV3'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#bff227] animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Chargement du formulaire...</p>
      </div>
    </div>
  ),
});

export default function NewCreationV3Page() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/login?redirect=/dashboard/new-v3');
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.push('/login?redirect=/dashboard/new-v3');
      }
    };

    checkAuth();
  }, [router]);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#bff227] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Retour au tableau de bord</span>
            </Link>

            {/* Center: Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#bff227] to-[#9dcc1e] rounded-xl"></div>
                <div className="absolute inset-0 bg-[#0a0a0a] rounded-xl flex items-center justify-center m-0.5">
                  <span className="text-[#bff227] text-lg">🛡️</span>
                </div>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-[#bff227] to-white bg-clip-text text-transparent">
                Proofy
              </span>
            </Link>

            {/* Right: V3 Badge */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#bff227]/20 text-[#bff227] text-xs font-semibold rounded-full">
                V3 BETA
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with padding for fixed nav */}
      <main className="pt-16">
        <WizardV3 />
      </main>
    </div>
  );
}
