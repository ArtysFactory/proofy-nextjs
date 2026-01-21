// ============================================
// PROOFY - Certificate Types
// ============================================

export interface CertificateData {
  // Blockchain info
  blockchain_name: string; // "Polygon", "Ethereum", etc.
  tx_hash?: string;
  block_number?: number;
  
  // Project details
  project_title: string;
  project_type: string; // "music", "video", "document", "image", "software", "nft"
  deposit_date: string; // Format: "20 janvier 2026 à 00:55"
  depositor_name: string;
  
  // Security
  public_identifier: string; // Public ID
  sha256_hash: string; // File hash
  
  // Verification
  wallet_address: string;
  verification_url: string; // Polygonscan URL
  
  // Metadata
  signature_date: string; // Format: "20/01/2026"
  certificate_id?: string;
}

export const PROJECT_TYPES: Record<string, { icon: string; label: string }> = {
  music: { icon: '🎵', label: 'Composition Musicale / Enregistrement Audio' },
  video: { icon: '🎬', label: 'Production Vidéo / Film' },
  document: { icon: '📄', label: 'Document / Texte' },
  image: { icon: '🖼️', label: 'Œuvre Visuelle / Photographie' },
  software: { icon: '💻', label: 'Code Source / Application' },
  nft: { icon: '🎨', label: 'NFT / Actif Numérique' },
};

export function getProjectTypeInfo(type: string): { icon: string; label: string } {
  return PROJECT_TYPES[type.toLowerCase()] || PROJECT_TYPES.document;
}

export function formatDepositDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatSignatureDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR');
}
