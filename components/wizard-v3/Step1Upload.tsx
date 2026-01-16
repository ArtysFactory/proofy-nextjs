'use client';

// ============================================
// PROOFY V3 - Step 1: Upload & Hash
// ============================================

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWizard } from './WizardContext';
import { Upload, FileAudio, FileImage, FileVideo, File, X, Check, Loader2 } from 'lucide-react';

export default function Step1Upload() {
  const { state, setFile, nextStep } = useWizard();
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate SHA-256 hash
  const calculateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  // Handle file selection
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsHashing(true);

    try {
      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        throw new Error('Le fichier est trop volumineux (max 500 MB)');
      }

      // Calculate hash
      const hash = await calculateHash(file);
      setFile(file, hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement du fichier');
    } finally {
      setIsHashing(false);
    }
  }, [setFile]);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('audio/')) return FileAudio;
    if (type.startsWith('image/')) return FileImage;
    if (type.startsWith('video/')) return FileVideo;
    return File;
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const FileIcon = state.fileType ? getFileIcon(state.fileType) : File;
  const hasFile = !!state.file && !!state.fileHash;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Uploadez votre fichier musical
        </h2>
        <p className="text-gray-400">
          Glissez-déposez ou sélectionnez le fichier à protéger
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          isDragging
            ? 'border-[#bff227] bg-[#bff227]/10'
            : hasFile
            ? 'border-[#bff227]/50 bg-[#bff227]/5'
            : 'border-white/20 hover:border-white/40 bg-white/5'
        }`}
      >
        <input
          type="file"
          accept="audio/*,video/*,image/*,application/pdf"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isHashing}
        />

        <div className="flex flex-col items-center text-center">
          {isHashing ? (
            <>
              <Loader2 className="w-12 h-12 text-[#bff227] animate-spin mb-4" />
              <p className="text-white font-medium">Calcul du hash SHA-256...</p>
              <p className="text-gray-400 text-sm mt-1">
                Veuillez patienter pendant le traitement
              </p>
            </>
          ) : hasFile ? (
            <>
              <div className="w-16 h-16 bg-[#bff227]/20 rounded-2xl flex items-center justify-center mb-4">
                <FileIcon className="w-8 h-8 text-[#bff227]" />
              </div>
              <p className="text-white font-medium">{state.fileName}</p>
              <p className="text-gray-400 text-sm mt-1">{formatSize(state.fileSize)}</p>
              <div className="flex items-center gap-2 mt-3 text-[#bff227]">
                <Check className="w-4 h-4" />
                <span className="text-sm">Hash calculé</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-white font-medium">
                Glissez-déposez votre fichier ici
              </p>
              <p className="text-gray-400 text-sm mt-1">
                ou cliquez pour sélectionner
              </p>
              <p className="text-gray-500 text-xs mt-4">
                Audio, vidéo, image ou PDF • Max 500 MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <X className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Hash Display */}
      {hasFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 border border-white/10 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Empreinte SHA-256</span>
            <button
              onClick={() => navigator.clipboard.writeText(state.fileHash)}
              className="text-xs text-[#bff227] hover:underline"
            >
              Copier
            </button>
          </div>
          <code className="text-xs text-gray-400 break-all font-mono">
            {state.fileHash}
          </code>
        </motion.div>
      )}

      {/* Supported Formats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FileAudio, label: 'Audio', formats: 'MP3, WAV, FLAC, AAC' },
          { icon: FileVideo, label: 'Vidéo', formats: 'MP4, MOV, AVI' },
          { icon: FileImage, label: 'Image', formats: 'JPG, PNG, PDF' },
          { icon: File, label: 'Autres', formats: 'PDF, ZIP' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
          >
            <item.icon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-white">{item.label}</p>
              <p className="text-xs text-gray-500">{item.formats}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          onClick={nextStep}
          disabled={!hasFile}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            hasFile
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
