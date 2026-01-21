'use client';

// ============================================
// PROOFY - Certificate Download Component
// ============================================

import { useState } from 'react';
import { Download, FileText, Loader2, ExternalLink } from 'lucide-react';

interface CertificateDownloadProps {
  publicId: string;
  title: string;
  className?: string;
}

export default function CertificateDownload({ publicId, title, className = '' }: CertificateDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      // Open certificate in new window for printing
      const certificateUrl = `/api/certificate/${publicId}`;
      const printWindow = window.open(certificateUrl, '_blank');
      
      if (printWindow) {
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Erreur lors de la génération du certificat');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewCertificate = () => {
    window.open(`/api/certificate/${publicId}`, '_blank');
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 bg-[#bff227] text-black font-semibold px-6 py-3 rounded-xl hover:bg-[#d4ff4d] transition-colors disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Génération...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Télécharger le certificat
          </>
        )}
      </button>
      
      <button
        onClick={handleViewCertificate}
        className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
      >
        <ExternalLink className="w-5 h-5" />
        Voir le certificat
      </button>
    </div>
  );
}
