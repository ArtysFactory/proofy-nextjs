// ============================================
// PROOFY V3 - Music Rights Types
// ============================================
// Compatible with: Allfeat MIDDS, DDEX, CWR
// ============================================

// ===== ROLE TAGS =====

export type RoleTag =
  | 'author'
  | 'composer'
  | 'arranger'
  | 'publisher'
  | 'sub_publisher'
  | 'main_artist'
  | 'featured_artist'
  | 'performer'
  | 'session_musician'
  | 'phonographic_producer'
  | 'label'
  | 'distributor';

// ===== MUSIC PARTY (Ayant droit) =====

export interface MusicParty {
  party_id: string;
  type: 'natural_person' | 'legal_entity';
  display_name: string;
  legal_name?: string;
  role_tags: RoleTag[];
  country?: string;
  tax_residency_country?: string;
  email?: string;
  phone?: string;
  wallet_address?: string;
  // Standard identifiers
  ipi?: string | null;      // Interested Party Information (CISAC)
  isni?: string | null;     // International Standard Name Identifier
  ipn?: string | null;      // International Performer Number
}

// ===== WORK (Oeuvre musicale) =====

export interface WorkContributorRef {
  party_ref: string;        // Reference to MusicParty.party_id
  role: 'author' | 'composer' | 'arranger' | 'publisher' | 'sub_publisher';
  share: number;            // Percentage (0-100)
  territory?: string;       // ISO country code or 'WORLD'
}

export interface MusicWork {
  work_id: string;
  title: string;
  title_alt?: string[];     // Alternative titles
  language?: string;        // ISO 639-1 (fr, en, es...)
  genre?: string;
  subgenre?: string;
  creation_date?: string;   // ISO date
  iswc?: string | null;     // International Standard Musical Work Code
  // Contributors
  authors: WorkContributorRef[];
  composers: WorkContributorRef[];
  arrangers?: WorkContributorRef[];
  publishers: WorkContributorRef[];
  // Lyrics
  has_lyrics?: boolean;
  lyrics_language?: string;
}

// ===== MASTER (Enregistrement) =====

export type VersionType =
  | 'original'
  | 'remix'
  | 'live'
  | 'acoustic'
  | 'instrumental'
  | 'a_cappella'
  | 'radio_edit'
  | 'extended'
  | 'clean'
  | 'explicit'
  | 'demo'
  | 'other';

export interface MasterContributorRef {
  party_ref: string;
  role: 'phonographic_producer' | 'main_artist' | 'featured_artist' | 'performer' | 'session_musician';
  share: number;
  instrument?: string;
}

export interface MusicMaster {
  master_id: string;
  linked_work_id: string;   // Reference to MusicWork.work_id
  title: string;
  title_version?: string;   // e.g., "Radio Edit", "Remix"
  version_type: VersionType;
  isrc?: string | null;     // International Standard Recording Code
  recording_date?: string;
  recording_location?: string;
  release_date?: string | null;
  duration_ms?: number;
  audio_format?: string;    // e.g., "WAV_24_96k", "MP3_320"
  explicit?: boolean;
  // Rights holders
  producers: MasterContributorRef[];
  performers: MasterContributorRef[];
  neighbouring_rights_splits: MasterContributorRef[];
  // Technical
  p_line?: string;          // e.g., "2026 Artys Factory"
  c_line?: string;          // Copyright line
}

// ===== RELEASE (Single, EP, Album) =====

export type ReleaseType = 'single' | 'ep' | 'album' | 'compilation' | 'mixtape' | 'live_album';

export interface MusicReleaseTrackRef {
  track_number: number;
  disc_number?: number;
  master_ref: string;       // Reference to MusicMaster.master_id
  is_main_track?: boolean;
  is_bonus?: boolean;
}

export interface MusicRelease {
  release_id: string;
  title: string;
  release_type: ReleaseType;
  label_party_ref?: string; // Reference to MusicParty.party_id
  upc?: string | null;      // Universal Product Code
  ean?: string | null;      // European Article Number
  catalog_number?: string;
  release_date?: string;
  original_release_date?: string;
  country?: string;
  territories?: string[];   // Distribution territories
  tracklist: MusicReleaseTrackRef[];
  // Artwork
  artwork_url?: string;
  artwork_hash?: string;
}

// ===== MANDATE (Mandat de gestion) =====

export type MandateRightType =
  | 'reproduction_mechanical'
  | 'public_performance'
  | 'digital_streaming'
  | 'synchronization'
  | 'neighbouring_rights'
  | 'lyrics_display'
  | 'all';

export type MandateStatus =
  | 'draft'
  | 'pending_signature'
  | 'active'
  | 'suspended'
  | 'terminated'
  | 'revoked';

export interface MandateScope {
  rights_types: MandateRightType[];
  catalog_scope: 'this_creation' | 'catalog_subset' | 'full_catalog';
  territories: string[];    // ISO codes or ['WORLD']
  exclusive: boolean;
  duration_years?: number;
}

export interface MandateFinancials {
  commission_rate_percentage: number;
  currency: string;
  collection_minimum_threshold?: number;
  payment_frequency?: 'monthly' | 'quarterly' | 'yearly';
  bank_details_provided?: boolean;
}

export interface MusicMandate {
  mandate_id: string;
  granted_to: 'artys_network' | string;
  scope: MandateScope;
  financials: MandateFinancials;
  effective_from: string;   // ISO date
  effective_until?: string | null;
  status: MandateStatus;
  // Signature
  signed_offchain: boolean;
  signed_at?: string;
  signed_document_url?: string;
  signer_name?: string;
  signer_email?: string;
  // Blockchain proof
  polygon_tx_hash?: string | null;
}

// ===== METADATA QUALITY & AUDIT =====

export type MetadataQualityStatus =
  | 'draft'
  | 'self_declared'
  | 'pending_review'
  | 'verified_artys'
  | 'verified_third_party'
  | 'disputed';

export interface MetadataChangeLog {
  version: number;
  changed_by: string;       // user_id or staff_id
  changed_at: string;       // ISO timestamp
  change_type: string;
  change_summary: string;
  fields_changed?: string[];
}

export interface MetadataQuality {
  status: MetadataQualityStatus;
  completeness_score?: number;  // 0-100
  last_reviewed_by?: string;
  last_reviewed_at?: string;
  review_notes?: string;
  history: MetadataChangeLog[];
}

// ===== AUDIO METADATA =====

export interface AudioMetadata {
  duration_ms: number;
  bpm?: number;
  key?: string;             // e.g., "C#m", "Dm", "G"
  time_signature?: string;  // e.g., "4/4", "3/4"
  bitrate?: number;         // kbps
  sample_rate?: number;     // Hz (44100, 48000, 96000...)
  bit_depth?: number;       // 16, 24, 32
  channels?: number;        // 1 (mono), 2 (stereo)
  codec?: string;           // e.g., "FLAC", "AAC", "MP3"
  loudness_lufs?: number;   // Integrated loudness (LUFS)
  loudness_range?: number;  // LU
  true_peak?: number;       // dBTP
}

// ===== PUBLIC METADATA (Allfeat-compatible) =====

export interface PublicWorkMetadata {
  title: string;
  iswc?: string | null;
  language?: string;
  genre?: string;
  main_authors: Array<{
    display_name: string;
    role: 'author' | 'composer';
    ipi?: string | null;
  }>;
}

export interface PublicMasterMetadata {
  master_id: string;
  title: string;
  isrc?: string | null;
  duration_ms?: number;
  explicit?: boolean;
  version_type?: VersionType;
  main_artists: Array<{
    display_name: string;
    isni?: string | null;
  }>;
}

export interface PublicReleaseMetadata {
  release_id: string;
  title: string;
  release_type: ReleaseType;
  upc?: string | null;
  release_date?: string;
  label_name?: string;
}

export interface PublicPartyMetadata {
  party_id: string;
  display_name: string;
  type: 'natural_person' | 'legal_entity';
  role_tags: RoleTag[];
  country?: string;
}

export interface PublicIdentifiersMetadata {
  work_iswc?: string | null;
  masters_isrc: string[];
  release_upc?: string | null;
  ipi_list: string[];
  isni_list: string[];
}

export interface PublicMetadata {
  schema_version: string;   // e.g., "1.0.0"
  last_updated: string;     // ISO timestamp
  work: PublicWorkMetadata;
  masters: PublicMasterMetadata[];
  releases: PublicReleaseMetadata[];
  parties: PublicPartyMetadata[];
  identifiers: PublicIdentifiersMetadata;
}

// ===== DISTRIBUTION & ROYALTIES =====

export type DistributionStatus =
  | 'not_distributed'
  | 'pending'
  | 'processing'
  | 'distributed'
  | 'failed'
  | 'taken_down';

export interface DistributorInfo {
  distributor_id: string;   // e.g., 'distrokid', 'tunecore', 'cdbaby'
  distributor_name: string;
  release_id?: string;
  submission_date?: string;
  live_date?: string;
  status: DistributionStatus;
}

export interface PlatformPresence {
  platform: string;         // e.g., 'spotify', 'apple_music', 'deezer'
  url?: string;
  platform_id?: string;     // Platform-specific ID
  live_since?: string;
}

export interface DistributionMetadata {
  distributors: DistributorInfo[];
  platforms: PlatformPresence[];
  territories: string[];
  status: DistributionStatus;
}

export interface StreamingData {
  platform: string;
  country?: string;
  streams: number;
  revenue: number;
  currency: string;
  period_start: string;
  period_end: string;
  last_updated: string;
}

export interface RoyaltyTracking {
  total_streams: number;
  total_revenue: number;
  currency: string;
  platforms: {
    [platform: string]: StreamingData;
  };
  last_sync: string;
}

// ===== NFT & WEB3 =====

export type NftStandard = 'ERC721' | 'ERC1155';

export interface NftRoyalty {
  recipient: string;        // Wallet address
  percentage: number;       // Basis points (e.g., 500 = 5%)
}

export interface NftMetadata {
  contract_address: string;
  token_id: string;
  standard: NftStandard;
  chain_id: number;
  chain_name: string;
  royalty_eip2981?: NftRoyalty;
  metadata_uri?: string;    // IPFS or Arweave URI
  minted_at: string;
  minted_by: string;
  transaction_hash: string;
}

export interface SplitBeneficiary {
  address: string;
  share_percentage: number;
  party_ref?: string;       // Reference to MusicParty
  label?: string;           // Display label
}

export interface OnChainSplits {
  contract_address: string;
  chain_id: number;
  chain_name: string;
  beneficiaries: SplitBeneficiary[];
  deployed_at: string;
  deployed_by: string;
  transaction_hash: string;
  total_distributed?: number;
  currency?: string;
}

// ===== AGGREGATE TYPE (V3) =====

export type MusicRightsStatus = 'draft' | 'active' | 'locked' | 'disputed';
export type FullMusicRightsStatus = 'incomplete' | 'ready' | 'publishing' | 'published' | 'archived';

export interface ArtysMusicRights {
  // Core rights data
  work: MusicWork;
  masters: MusicMaster[];
  releases: MusicRelease[];
  parties: MusicParty[];
  mandates: MusicMandate[];
  
  // Public layer
  publicMetadata: PublicMetadata;
  
  // Quality
  metadataQuality: MetadataQuality;
  musicRightsStatus: MusicRightsStatus;
  fullMusicRightsStatus: FullMusicRightsStatus;
  
  // Audio
  audioFingerprint?: string;
  audioMetadata?: AudioMetadata;
  
  // Distribution
  distributionMetadata?: DistributionMetadata;
  royaltyTracking?: RoyaltyTracking;
  
  // Web3
  nftMetadata?: NftMetadata;
  onChainSplits?: OnChainSplits;
}

// ===== CREATION V3 (Extended) =====

export interface CreationV3 {
  // Base fields (from V2)
  id: number;
  user_id: number;
  public_id: string;
  title: string;
  description?: string;
  file_hash: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  project_type: 'music' | 'image' | 'video' | 'document' | 'other';
  status: 'pending' | 'confirmed' | 'failed';
  tx_hash?: string;
  block_number?: number;
  created_at: string;
  updated_at: string;
  
  // V3 Music Rights fields
  music_work?: MusicWork;
  music_masters?: MusicMaster[];
  music_releases?: MusicRelease[];
  music_parties?: MusicParty[];
  music_mandates?: MusicMandate[];
  music_rights_status?: MusicRightsStatus;
  public_metadata?: PublicMetadata;
  metadata_quality?: MetadataQuality;
  metadata_version?: number;
  audio_fingerprint?: string;
  audio_metadata?: AudioMetadata;
  waveform_data?: any;
  distribution_status?: DistributionStatus;
  distribution_metadata?: DistributionMetadata;
  royalty_tracking?: RoyaltyTracking;
  nft_metadata?: NftMetadata;
  on_chain_splits?: OnChainSplits;
  full_music_rights_status?: FullMusicRightsStatus;
}

// ===== API TYPES =====

export interface MusicRightsUpdatePayload {
  work?: Partial<MusicWork>;
  masters?: MusicMaster[];
  releases?: MusicRelease[];
  parties?: MusicParty[];
  mandates?: MusicMandate[];
}

export interface MusicRightsResponse {
  success: boolean;
  musicRightsStatus: MusicRightsStatus;
  fullMusicRightsStatus: FullMusicRightsStatus;
  publicMetadata?: PublicMetadata;
  errors?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  completeness_score: number;
}
