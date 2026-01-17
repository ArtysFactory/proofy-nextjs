'use client';

// ============================================
// PROOFY - Page de sélection du type de création
// Dashboard → Nouvelle création → Choix du type
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Music,
  Video,
  Image,
  FileText,
  Sparkles,
  Shield,
  ArrowRight,
  Loader2,
} from 'lucide-react';

// Types de création disponibles
const creationTypes = [
  {
    id: 'music',
    icon: Music,
    label: 'Musique',
    description: 'Audio, compositions, samples',
    formats: 'MP3, WAV, FLAC, AAC',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400',
    route: '/dashboard/new-v3',
    features: ['Droits d\'auteur', 'Droits voisins', 'ISRC', 'Masters'],
  },
  {
    id: 'video',
    icon: Video,
    label: 'Vidéo',
    description: 'Films, clips, contenus vidéo',
    formats: 'MP4, MOV, AVI',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    route: '/dashboard/new-v3',
    features: ['Droits d\'auteur', 'Droits voisins', 'Réalisateur', 'Producteur'],
  },
  {
    id: 'image',
    icon: Image,
    label: 'Image',
    description: 'Photos, illustrations, designs',
    formats: 'JPG, PNG, PDF',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    route: '/dashboard/new-simple',
    features: ['Preuve d\'antériorité', 'Hash SHA-256', 'Certificat'],
  },
  {
    id: 'other',
    icon: FileText,
    label: 'Autres',
    description: 'Documents, code, textes',
    formats: 'PDF, ZIP, TXT',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    route: '/dashboard/new-simple',
    features: ['Preuve d\'antériorité', 'Hash SHA-256', 'Certificat'],
  },
];

export default function NewCreationPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/dashboard/new');
    }
  }, [router]);

  const handleSelectType = (type: typeof creationTypes[0]) => {
    setSelectedType(type.id);
    setIsNavigating(true);
    
    // Navigate to the appropriate wizard
    setTimeout(() => {
      router.push(type.route);
    }, 300);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#bff227] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
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
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#bff227]/20 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-[#bff227]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Nouveau dépôt
            </h1>
            <p className="text-gray-400 text-lg">
              Enregistrez votre création sur la blockchain Polygon
            </p>
          </motion.div>

          {/* Creation Types Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            {creationTypes.map((type, index) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => handleSelectType(type)}
                  disabled={isNavigating}
                  className={`
                    relative group p-6 rounded-2xl border-2 text-left transition-all duration-300
                    ${isSelected 
                      ? `${type.borderColor} ${type.bgColor}` 
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }
                    ${isNavigating && !isSelected ? 'opacity-50' : ''}
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center mb-4
                    bg-gradient-to-br ${type.color}
                  `}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-1">
                    {type.label}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {type.description}
                  </p>
                  
                  {/* Formats */}
                  <p className="text-gray-500 text-xs mb-4">
                    {type.formats}
                  </p>

                  {/* Features Tags */}
                  <div className="flex flex-wrap gap-2">
                    {type.features.map((feature) => (
                      <span
                        key={feature}
                        className={`
                          px-2 py-1 rounded-md text-xs font-medium
                          ${type.bgColor} ${type.textColor}
                        `}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Arrow indicator */}
                  <div className={`
                    absolute top-6 right-6 w-8 h-8 rounded-lg flex items-center justify-center
                    transition-all duration-300
                    ${isSelected ? type.bgColor : 'bg-white/5 group-hover:bg-white/10'}
                  `}>
                    {isNavigating && isSelected ? (
                      <Loader2 className={`w-4 h-4 animate-spin ${type.textColor}`} />
                    ) : (
                      <ArrowRight className={`w-4 h-4 ${isSelected ? type.textColor : 'text-gray-500 group-hover:text-white'}`} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#bff227]/10 to-[#bff227]/5 border border-[#bff227]/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#bff227]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#bff227]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">
                  Comment ça marche ?
                </h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#bff227]/20 text-[#bff227] text-xs flex items-center justify-center font-bold">1</span>
                    Sélectionnez le type de création ci-dessus
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#bff227]/20 text-[#bff227] text-xs flex items-center justify-center font-bold">2</span>
                    Uploadez votre fichier (le hash SHA-256 est calculé localement)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#bff227]/20 text-[#bff227] text-xs flex items-center justify-center font-bold">3</span>
                    Renseignez les informations sur les droits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#bff227]/20 text-[#bff227] text-xs flex items-center justify-center font-bold">4</span>
                    Validez pour ancrer sur la blockchain Polygon
                  </li>
                </ul>
                <p className="text-gray-500 text-xs mt-4">
                  💡 Votre fichier n'est jamais uploadé — seul le hash cryptographique est enregistré.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
