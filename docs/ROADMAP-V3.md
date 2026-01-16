# Proofy V3 — Roadmap Complète Artys Rights Registry
## Fusion des recommandations CTO + Allfeat + Gestion des Droits

**Document créé** : 16 janvier 2026  
**Stack technique actuelle** : Next.js 15.x + React 19.x + Neon PostgreSQL + Polygon Mainnet  
**Objectif** : Transformer Proofy en registre de droits musicaux complet et interopérable type MIDDS/Allfeat.

---

## 1. Vue d'ensemble & Positionnement

### 1.1 Où tu en es (V2)

**Proofy V2** (actuellement en production) = plateforme de **preuve d'antériorité + dépôt multi-média** :
- Horodatage SHA-256 + ancrage Polygon Mainnet ✓
- Dashboard utilisateur, certificat PDF + page de vérification publique ✓
- Métadonnées musique basiques (titre, artiste, album, genre, ISRC, ISWC) ✓
- Gestion des co-auteurs avec répartition en % ✓
- Stack moderne : Next.js 15, Neon PostgreSQL, Edge Runtime ✓

### 1.2 Où tu dois aller (V3 = Artys Rights Registry)

**Proofy V3** = transformer en **registre de droits musicaux pro** compatible avec l'écosystème Allfeat :

1. **Modèle MIDDS complet** : Parties → Songs (Works) → Tracks (Masters) → Releases. [web:49]
2. **Gestion avancée des droits** : Splits détaillés, mandats de gestion collective Artys Network, historique d'audit. [web:52]
3. **Métadonnées publiques vs privées** : Couche publique interopérable + couche privée (contrats, financials, royalties). [web:52]
4. **Quality & Governance** : Statuts de validation (draft/self-declared/verified), historique des modifications. [web:45]
5. **Distribution & Royalties** : Export DDEX, intégration distributeurs, gestion des flux de royalties. [file:59]
6. **Audio Processing avancé** : Extraction ID3, fingerprinting, détection de tonalité, waveform. [file:59]
7. **Web3 enrichi** : NFT minting (ERC-1155), smart contract de splits automatiques, fractional ownership. [file:59]

### 1.3 Architecture conceptuelle V3

```
┌─────────────────────────────────────────────────────────────┐
│  Artys Rights Registry (Proofy V3)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: CORE (existant, à stabiliser)                    │
│  ├─ Upload SHA-256 + Polygon ancrage                       │
│  └─ Certificate PDF + Public proof page                    │
│                                                              │
│  Layer 2: MUSIC RIGHTS (nouveau)                           │
│  ├─ Modèle MIDDS : Parties / Songs / Tracks / Releases    │
│  ├─ Splits & Mandates : gestion collective Artys          │
│  ├─ Identifiants : ISRC / ISWC / IPI / ISNI / UPC         │
│  └─ Qualité & Audit : statuts, historique de modifs       │
│                                                              │
│  Layer 3: PUBLIC METADATA (interop)                        │
│  ├─ Sous-ensemble Allfeat-compatible                       │
│  ├─ Export DDEX/CWR                                        │
│  └─ API publique (futur bridge)                            │
│                                                              │
│  Layer 4: ADVANCED (roadmap)                               │
│  ├─ Audio processing : ID3, fingerprint, tonalité          │
│  ├─ Distribution : APIs DistroKid, TuneCore, etc.         │
│  ├─ Royalties : tracking streams, dashboard analytics     │
│  ├─ Web3 : NFT minting, splits on-chain, fractional       │
│  └─ Collaboration : workspaces, versioning, multi-sig      │
│                                                              │
│  Infrastructure                                             │
│  ├─ Frontend : Next.js 15, Framer Motion, Tailwind 4      │
│  ├─ Backend : Next.js API Routes (Edge Runtime)           │
│  ├─ DB : Neon PostgreSQL (serverless)                     │
│  ├─ Blockchain : Polygon Mainnet (viem)                   │
│  ├─ Storage : IPFS (Pinata) ou Arweave                    │
│  └─ Deployment : Vercel (Edge Functions)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Schéma de données V3 (PostgreSQL)

### 2.1 Migrations SQL pour Proofy V3

Les colonnes musique existantes restent, mais on **normalise et enrichit** avec des colonnes JSONB pour la couche "rights".

```sql
-- ===== TABLE: creations (mise à jour V3) =====

ALTER TABLE creations
  -- =========== Nouvelles colonnes pour Rights Management ===========
  ADD COLUMN music_work JSONB DEFAULT NULL,           -- MusicWork (œuvre)
  ADD COLUMN music_masters JSONB DEFAULT NULL,        -- MusicMaster[] (enregistrements)
  ADD COLUMN music_releases JSONB DEFAULT NULL,       -- MusicRelease[] (singles/albums)
  ADD COLUMN music_parties JSONB DEFAULT NULL,        -- MusicParty[] (ayants droit normalisés)
  ADD COLUMN music_mandates JSONB DEFAULT NULL,       -- MusicMandate[] (mandats Artys)
  ADD COLUMN music_rights_status VARCHAR(20) DEFAULT 'draft',  -- draft|active|locked
  
  -- =========== Métadonnées publiques (interop) ===========
  ADD COLUMN public_metadata JSONB DEFAULT NULL,      -- PublicMetadata (Allfeat-compatible)
  
  -- =========== Qualité & Audit ===========
  ADD COLUMN metadata_quality JSONB DEFAULT NULL,     -- MetadataQuality (statut + historique)
  ADD COLUMN metadata_version INTEGER DEFAULT 1,      -- version de la structure
  
  -- =========== Audio Processing ===========
  ADD COLUMN audio_fingerprint VARCHAR(255),          -- Chromaprint/AcoustID (sha256 raccourci)
  ADD COLUMN audio_metadata JSONB DEFAULT NULL,       -- {bpm, key, duration, bitrate, channels, ...}
  ADD COLUMN waveform_data JSONB DEFAULT NULL,        -- données précalculées waveform (optionnel)
  
  -- =========== Distribution & Royalties ===========
  ADD COLUMN distribution_status VARCHAR(50) DEFAULT 'not_distributed', -- not_distributed|pending|distributed
  ADD COLUMN distribution_metadata JSONB DEFAULT NULL, -- {distributor_ids, release_ids, streams_tracking}
  ADD COLUMN royalty_tracking JSONB DEFAULT NULL,     -- {platform: {streams, revenue, last_updated}}
  
  -- =========== Web3 Avancé ===========
  ADD COLUMN nft_metadata JSONB DEFAULT NULL,         -- {contract_addr, token_id, standard, royalty_eip2981, ...}
  ADD COLUMN on_chain_splits JSONB DEFAULT NULL,      -- {contract_addr, splits_data, beneficiaries}
  
  -- =========== Statut général ===========
  ADD COLUMN full_music_rights_status VARCHAR(50) DEFAULT 'incomplete'; -- incomplete|ready|publishing|published

-- Index pour requêtes rapides
CREATE INDEX idx_music_rights_status ON creations(music_rights_status);
CREATE INDEX idx_audio_fingerprint ON creations(audio_fingerprint);
CREATE INDEX idx_distribution_status ON creations(distribution_status);
CREATE INDEX idx_public_metadata ON creations USING GIN (public_metadata);

-- ===== TABLE: music_mandates (optionnel, normalisation) =====
-- Si tu veux une table dédiée aux mandats (plus rapide pour les requêtes)

CREATE TABLE IF NOT EXISTS music_mandates (
  id SERIAL PRIMARY KEY,
  creation_id INTEGER REFERENCES creations(id) ON DELETE CASCADE,
  mandate_id VARCHAR(50) UNIQUE NOT NULL,
  granted_to VARCHAR(100) NOT NULL,                    -- 'artys_network'
  scope JSONB NOT NULL,                                -- {rights_types, territories, exclusive}
  financials JSONB NOT NULL,                           -- {commission_rate, currency, threshold}
  status VARCHAR(50) DEFAULT 'pending_signature',      -- pending_signature|active|terminated|revoked
  signed_at TIMESTAMP,
  signed_document_url VARCHAR(500),
  polygon_tx_hash VARCHAR(66),                         -- proof on blockchain
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mandate_creation ON music_mandates(creation_id);
CREATE INDEX idx_mandate_status ON music_mandates(status);

-- ===== TABLE: metadata_audit_log (audit complet) =====
-- Trace de chaque modification pour la gouvernance ANA

CREATE TABLE IF NOT EXISTS metadata_audit_log (
  id SERIAL PRIMARY KEY,
  creation_id INTEGER REFERENCES creations(id) ON DELETE CASCADE,
  changed_by VARCHAR(100) NOT NULL,                    -- user_id ou staff_id
  change_type VARCHAR(100),                            -- 'work_updated', 'mandate_signed', 'quality_verified', ...
  old_value JSONB,
  new_value JSONB,
  change_summary TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_creation ON metadata_audit_log(creation_id);
CREATE INDEX idx_audit_timestamp ON metadata_audit_log(timestamp);

-- ===== TABLE: distribution_events (tracking flows) =====
-- Pour tracker les événements de distribution / streaming

CREATE TABLE IF NOT EXISTS distribution_events (
  id SERIAL PRIMARY KEY,
  creation_id INTEGER REFERENCES creations(id) ON DELETE CASCADE,
  event_type VARCHAR(50),                              -- 'distributor_sent', 'streams_reported', 'royalty_paid'
  distributor_name VARCHAR(100),
  event_data JSONB,                                    -- {streams, revenue, platform, country, ...}
  event_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_distribution_creation ON distribution_events(creation_id);
CREATE INDEX idx_distribution_date ON distribution_events(event_date);
```

### 2.2 Modèle de données dans PostgreSQL : exemple de ligne

Une ligne `creations` pour une musique complète ressemblerait à :

```sql
INSERT INTO creations (
  user_id, public_id, title, file_hash, project_type,
  music_work, music_masters, music_releases, music_parties, music_mandates,
  music_rights_status, public_metadata, metadata_quality,
  audio_fingerprint, audio_metadata,
  distribution_status, full_music_rights_status
) VALUES (
  123, 'proofy_abc123', 'Ma Chanson', 
  '0x1234567890abcdef...', 'music',
  
  -- music_work (JSON)
  '{
    "work_id": "wrk_001",
    "title": "Ma Chanson",
    "language": "fr",
    "genre": "Hip-Hop",
    "creation_date": "2026-01-10",
    "iswc": null,
    "authors": [{"party_ref": "pty_1", "role": "author", "share": 50}],
    "composers": [{"party_ref": "pty_2", "role": "composer", "share": 50}],
    "publishers": [{"party_ref": "pty_3", "role": "publisher", "share": 100}]
  }',
  
  -- music_masters (JSON array)
  '[{
    "master_id": "mst_001",
    "linked_work_id": "wrk_001",
    "title": "Ma Chanson (Radio Edit)",
    "version_type": "original",
    "isrc": null,
    "duration_ms": 180000,
    "explicit": false,
    "producers": [{"party_ref": "pty_4", "role": "phonographic_producer", "share": 100}],
    "performers": [{"party_ref": "pty_5", "role": "main_artist", "share": 100}],
    "neighbouring_rights_splits": [
      {"party_ref": "pty_4", "role": "phonographic_producer", "share": 50},
      {"party_ref": "pty_5", "role": "main_artist", "share": 50}
    ]
  }]',
  
  -- music_releases (JSON array)
  '[{
    "release_id": "rel_001",
    "title": "EP 2026",
    "release_type": "ep",
    "label_party_ref": "pty_label",
    "upc": "123456789012",
    "release_date": "2026-02-01",
    "tracklist": [
      {"track_number": 1, "master_ref": "mst_001", "is_main_track": true}
    ]
  }]',
  
  -- music_parties (JSON array - normalisé)
  '[{
    "party_id": "pty_1",
    "type": "natural_person",
    "display_name": "Artiste X",
    "legal_name": "Jean Dupont",
    "role_tags": ["author"],
    "country": "FR",
    "email": "artist@example.com",
    "wallet_address": "0xArtist...",
    "ipi": null
  }, ...]',
  
  -- music_mandates (JSON array)
  '[{
    "mandate_id": "mnd_001",
    "granted_to": "artys_network",
    "scope": {
      "rights_types": ["reproduction_mechanical", "digital_streaming"],
      "territories": ["WORLD"],
      "exclusive": true
    },
    "financials": {"commission_rate_percentage": 15.0, "currency": "EUR"},
    "status": "active",
    "signed_at": "2026-01-10T10:00:00Z"
  }]',
  
  -- music_rights_status
  'active',
  
  -- public_metadata (Allfeat-compatible)
  '{
    "work": {"title": "Ma Chanson", "main_authors": [...]},
    "masters": [...],
    "releases": [...],
    "parties": [...],
    "identifiers": {"work_iswc": null, "masters_isrc": [], ...}
  }',
  
  -- metadata_quality
  '{
    "status": "self_declared",
    "history": [
      {"version": 1, "changed_by": "user_123", "changed_at": "2026-01-10T09:00:00Z", "change_summary": "Initial self-declaration"}
    ]
  }',
  
  -- audio_fingerprint
  '1234567890abcdef',
  
  -- audio_metadata
  '{"bpm": 120, "key": "C#", "duration": 180000, "bitrate": 320, "channels": 2}',
  
  -- distribution_status
  'not_distributed',
  
  -- full_music_rights_status
  'ready'
);
```

---

## 3. Types TypeScript Complets (V3)

```typescript
// ===== TYPES PARTIES / IDENTIFIANTS =====

export type RoleTag =
  | 'author'
  | 'composer'
  | 'publisher'
  | 'main_artist'
  | 'performer'
  | 'phonographic_producer'
  | 'label';

export interface MusicParty {
  party_id: string;
  type: 'natural_person' | 'legal_entity';
  display_name: string;
  legal_name?: string;
  role_tags: RoleTag[];
  country?: string;
  tax_residency_country?: string;
  email?: string;
  wallet_address?: string;
  ipi?: string | null;      // Interested Party Info
  isni?: string | null;     // International Standard Name Identifier
  ipn?: string | null;      // International Performer Number
}

// ===== TYPES WORK (ŒUVRE) =====

export interface WorkContributorRef {
  party_ref: string;
  role: 'author' | 'composer' | 'publisher';
  share: number;           // pourcentage
}

export interface MusicWork {
  work_id: string;
  title: string;
  language?: string;
  genre?: string;
  subgenre?: string;
  creation_date?: string;  // ISO
  iswc?: string | null;    // International Standard Musical Work Code
  authors: WorkContributorRef[];
  composers: WorkContributorRef[];
  publishers: WorkContributorRef[];
}

// ===== TYPES MASTERS (ENREGISTREMENTS) =====

export type VersionType =
  | 'original'
  | 'remix'
  | 'live'
  | 'instrumental'
  | 'radio_edit'
  | 'other';

export interface MasterContributorRef {
  party_ref: string;
  role: 'phonographic_producer' | 'main_artist' | 'performer';
  share: number;
}

export interface MusicMaster {
  master_id: string;
  linked_work_id: string;
  title: string;
  version_type: VersionType;
  isrc?: string | null;    // International Standard Recording Code
  recording_date?: string;
  release_date?: string | null;
  duration_ms?: number;
  audio_format?: string;   // ex: "WAV_24_44k", "MP3_320"
  explicit?: boolean;
  upc?: string | null;     // Universal Product Code (album level)
  producers: MasterContributorRef[];
  performers: MasterContributorRef[];
  neighbouring_rights_splits: MasterContributorRef[];
}

// ===== TYPES RELEASES =====

export type ReleaseType = 'single' | 'ep' | 'album' | 'compilation';

export interface MusicReleaseTrackRef {
  track_number: number;
  master_ref: string;
  is_main_track?: boolean;
  is_bonus?: boolean;
}

export interface MusicRelease {
  release_id: string;
  title: string;
  release_type: ReleaseType;
  label_party_ref?: string;
  upc?: string | null;
  release_date?: string;
  country?: string;
  tracklist: MusicReleaseTrackRef[];
}

// ===== TYPES MANDATS (GESTION COLLECTIVE) =====

export type MandateStatus =
  | 'pending_signature'
  | 'active'
  | 'terminated'
  | 'revoked';

export interface MandateScope {
  rights_types: (
    | 'reproduction_mechanical'
    | 'public_performance'
    | 'digital_streaming'
    | 'synchronization'
  )[];
  catalog_scope: 'this_creation' | 'catalog_subset' | 'full_catalog';
  territories: string[];   // ['WORLD'] ou codes pays
  exclusive: boolean;
}

export interface MandateFinancials {
  commission_rate_percentage: number;
  currency: string;
  collection_minimum_threshold?: number;
}

export interface MusicMandate {
  mandate_id: string;
  granted_to: 'artys_network';
  scope: MandateScope;
  financials: MandateFinancials;
  effective_from: string;  // ISO
  effective_until?: string | null;
  status: MandateStatus;
  signed_offchain: boolean;
  signed_document_url?: string;
  polygon_tx_hash?: string | null;
}

// ===== TYPES QUALITÉ & AUDIT =====

export type MetadataQualityStatus =
  | 'draft'
  | 'self_declared'
  | 'verified_artys'
  | 'verified_third_party';

export interface MetadataChangeLog {
  version: number;
  changed_by: string;
  changed_at: string;      // ISO
  change_summary: string;
}

export interface MetadataQuality {
  status: MetadataQualityStatus;
  last_reviewed_by?: string;
  last_reviewed_at?: string;
  history: MetadataChangeLog[];
}

// ===== TYPES AUDIO METADATA (NOUVEAU) =====

export interface AudioMetadata {
  duration: number;         // ms
  bpm?: number;
  key?: string;             // ex: "C#", "Dm"
  bitrate?: number;         // kbps
  sample_rate?: number;     // Hz (44100, 48000, ...)
  channels?: number;        // 1 (mono), 2 (stereo)
  codec?: string;
  loudness_lufs?: number;   // LUFS (loudness standard)
}

// ===== TYPES PUBLIC METADATA (ALLFEAT-COMPATIBLE) =====

export interface PublicWorkMetadata {
  title: string;
  iswc?: string | null;
  main_authors: { display_name: string; role: 'author' | 'composer' }[];
}

export interface PublicMasterMetadata {
  master_id: string;
  title: string;
  isrc?: string | null;
  duration_ms?: number;
  explicit?: boolean;
  main_artists: { display_name: string }[];
}

export interface PublicReleaseMetadata {
  release_id: string;
  title: string;
  release_type: ReleaseType;
  upc?: string | null;
  release_date?: string;
}

export interface PublicPartyMetadata {
  party_id: string;
  display_name: string;
  role_tags: RoleTag[];
}

export interface PublicIdentifiersMetadata {
  work_iswc?: string | null;
  masters_isrc: string[];
  release_upc?: string | null;
  ipi_list: string[];
  isni_list: string[];
}

export interface PublicMetadata {
  work: PublicWorkMetadata;
  masters: PublicMasterMetadata[];
  releases: PublicReleaseMetadata[];
  parties: PublicPartyMetadata[];
  identifiers: PublicIdentifiersMetadata;
}

// ===== TYPES DISTRIBUTION & ROYALTIES =====

export interface StreamingData {
  platform: string;         // 'spotify', 'apple_music', 'deezer'
  streams: number;
  revenue: number;
  currency: string;
  last_updated: string;
}

export interface DistributionMetadata {
  distributor_id?: string;  // ex: 'distrokid', 'tunecore'
  distributor_release_id?: string;
  platforms: string[];      // ['spotify', 'apple_music', ...]
  distribution_date?: string;
  status: 'pending' | 'distributed' | 'failed';
}

export interface RoyaltyTracking {
  [platform: string]: StreamingData;
}

// ===== TYPES NFT & WEB3 =====

export interface NftMetadata {
  contract_address: string;
  token_id: string;
  standard: 'ERC721' | 'ERC1155';
  royalty_eip2981?: {
    recipient: string;
    percentage: number;
  };
  minted_at: string;
  transaction_hash: string;
}

export interface OnChainSplits {
  contract_address: string;
  beneficiaries: Array<{
    address: string;
    share_percentage: number;
  }>;
  deployed_at: string;
  transaction_hash: string;
}

// ===== AGRÉGAT GLOBAL (V3) =====

export type MusicRightsStatus = 'draft' | 'active' | 'locked';
export type FullMusicRightsStatus = 'incomplete' | 'ready' | 'publishing' | 'published';

export interface ArtysMusicRights {
  work: MusicWork;
  masters: MusicMaster[];
  releases: MusicRelease[];
  parties: MusicParty[];
  mandates: MusicMandate[];
  publicMetadata: PublicMetadata;
  metadataQuality: MetadataQuality;
  musicRightsStatus: MusicRightsStatus;
  audioMetadata?: AudioMetadata;
  distributionMetadata?: DistributionMetadata;
  royaltyTracking?: RoyaltyTracking;
  nftMetadata?: NftMetadata;
  onChainSplits?: OnChainSplits;
}
```

---

## 4. API Endpoints (Next.js 15 + TypeScript)

### 4.1 Endpoints principaux

```typescript
// ===== app/api/music-rights/[creationId]/route.ts =====

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ArtysMusicRights, MusicRightsStatus } from '@/types/music';
import { 
  validateMusicRights, 
  buildPublicMetadataFromRights,
  logMetadataChange 
} from '@/lib/music-rights';

// GET /api/music-rights/[creationId]
export async function GET(
  request: NextRequest,
  { params }: { params: { creationId: string } }
) {
  try {
    const { creationId } = params;
    
    const creation = await db.query(
      'SELECT * FROM creations WHERE id = $1',
      [creationId]
    );

    if (!creation.rows.length) {
      return NextResponse.json(
        { error: 'Creation not found' },
        { status: 404 }
      );
    }

    const row = creation.rows[0];

    if (row.project_type !== 'music') {
      return NextResponse.json(
        { error: 'This creation is not a music project' },
        { status: 400 }
      );
    }

    const rights: ArtysMusicRights = {
      work: row.music_work || {},
      masters: row.music_masters || [],
      releases: row.music_releases || [],
      parties: row.music_parties || [],
      mandates: row.music_mandates || [],
      publicMetadata: row.public_metadata || {},
      metadataQuality: row.metadata_quality || {
        status: 'draft',
        history: []
      },
      musicRightsStatus: row.music_rights_status || 'draft',
      audioMetadata: row.audio_metadata || {},
      distributionMetadata: row.distribution_metadata || {},
      royaltyTracking: row.royalty_tracking || {},
    };

    return NextResponse.json(rights);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/music-rights/[creationId]
// Met à jour les droits musicaux + génère public metadata
export async function POST(
  request: NextRequest,
  { params }: { params: { creationId: string } }
) {
  try {
    const { creationId } = params;
    const payload: Partial<ArtysMusicRights> = await request.json();

    // Vérifier que la création existe et est de type 'music'
    const creation = await db.query(
      'SELECT * FROM creations WHERE id = $1',
      [creationId]
    );

    if (!creation.rows.length || creation.rows[0].project_type !== 'music') {
      return NextResponse.json(
        { error: 'Invalid creation or not a music project' },
        { status: 400 }
      );
    }

    const row = creation.rows[0];
    const userId = row.user_id;

    // Valider la structure
    const validation = validateMusicRights(payload);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Déterminer le nouveau statut
    let newStatus: MusicRightsStatus = 'draft';
    if (payload.mandates?.some(m => m.status === 'active')) {
      newStatus = 'active';
    }

    // Générer public metadata automatiquement
    const publicMetadata = buildPublicMetadataFromRights(
      payload.work || {},
      payload.masters || [],
      payload.releases || [],
      payload.parties || []
    );

    // Mettre à jour la base
    await db.query(
      `UPDATE creations SET 
        music_work = $1,
        music_masters = $2,
        music_releases = $3,
        music_parties = $4,
        music_mandates = $5,
        music_rights_status = $6,
        public_metadata = $7,
        metadata_version = metadata_version + 1,
        updated_at = NOW()
      WHERE id = $8`,
      [
        JSON.stringify(payload.work),
        JSON.stringify(payload.masters),
        JSON.stringify(payload.releases),
        JSON.stringify(payload.parties),
        JSON.stringify(payload.mandates),
        newStatus,
        JSON.stringify(publicMetadata),
        creationId
      ]
    );

    // Loger le changement
    await logMetadataChange(creationId, userId, 'rights_updated', 'Music rights updated', null, payload);

    return NextResponse.json({
      success: true,
      musicRightsStatus: newStatus,
      publicMetadata
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===== app/api/music-rights/[creationId]/quality/route.ts =====
// Endpoint pour mettre à jour la qualité métadonnées (staff/admin seulement)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { creationId: string } }
) {
  try {
    const { creationId } = params;
    const { status, reviewer_id } = await request.json();

    // TODO: Vérifier authentification + rôle admin

    const creation = await db.query(
      'SELECT * FROM creations WHERE id = $1',
      [creationId]
    );

    if (!creation.rows.length) {
      return NextResponse.json(
        { error: 'Creation not found' },
        { status: 404 }
      );
    }

    const row = creation.rows[0];
    const currentQuality = row.metadata_quality || { status: 'draft', history: [] };

    // Ajouter une nouvelle entrée dans l'historique
    const newEntry = {
      version: (currentQuality.history?.length || 0) + 1,
      changed_by: reviewer_id,
      changed_at: new Date().toISOString(),
      change_summary: `Status changed from ${currentQuality.status} to ${status}`
    };

    const updatedQuality = {
      status,
      last_reviewed_by: reviewer_id,
      last_reviewed_at: new Date().toISOString(),
      history: [...(currentQuality.history || []), newEntry]
    };

    await db.query(
      `UPDATE creations SET 
        metadata_quality = $1,
        updated_at = NOW()
      WHERE id = $2`,
      [JSON.stringify(updatedQuality), creationId]
    );

    await logMetadataChange(
      creationId,
      reviewer_id,
      'quality_verified',
      `Metadata verified: ${status}`,
      null,
      updatedQuality
    );

    return NextResponse.json({ success: true, metadata_quality: updatedQuality });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4.2 Fonction utilitaire de mapping

```typescript
// ===== lib/music-rights.ts =====

import {
  MusicWork,
  MusicMaster,
  MusicRelease,
  MusicParty,
  PublicMetadata,
  ArtysMusicRights,
} from '@/types/music';

/**
 * Construit la couche public metadata à partir des données privées
 * Compatible avec le modèle Allfeat MIDDS
 */
export function buildPublicMetadataFromRights(
  work: MusicWork,
  masters: MusicMaster[],
  releases: MusicRelease[],
  parties: MusicParty[]
): PublicMetadata {
  const findParty = (partyRef: string) =>
    parties.find((p) => p.party_id === partyRef);

  // Work public
  const mainAuthors = [
    ...work.authors,
    ...work.composers,
  ].map((c) => {
    const p = findParty(c.party_ref);
    return {
      display_name: p?.display_name ?? c.party_ref,
      role: c.role === 'composer' ? 'composer' : 'author',
    };
  });

  const publicWork = {
    title: work.title,
    iswc: work.iswc || null,
    main_authors: mainAuthors,
  };

  // Masters public
  const publicMasters = masters.map((m) => {
    const mainArtistRefs = m.performers.filter((p) => p.role === 'main_artist');
    const mainArtists = mainArtistRefs.map((ref) => {
      const p = findParty(ref.party_ref);
      return { display_name: p?.display_name ?? ref.party_ref };
    });

    return {
      master_id: m.master_id,
      title: m.title,
      isrc: m.isrc || null,
      duration_ms: m.duration_ms,
      explicit: m.explicit,
      main_artists: mainArtists,
    };
  });

  // Releases public
  const publicReleases = releases.map((r) => ({
    release_id: r.release_id,
    title: r.title,
    release_type: r.release_type,
    upc: r.upc || null,
    release_date: r.release_date,
  }));

  // Parties public
  const publicParties = parties.map((p) => ({
    party_id: p.party_id,
    display_name: p.display_name,
    role_tags: p.role_tags,
  }));

  // Identifiers
  const mastersIsrc = masters
    .map((m) => m.isrc)
    .filter((v): v is string => !!v);

  const ipiList = parties
    .map((p) => p.ipi)
    .filter((v): v is string => !!v);

  const isniList = parties
    .map((p) => p.isni)
    .filter((v): v is string => !!v);

  return {
    work: publicWork,
    masters: publicMasters,
    releases: publicReleases,
    parties: publicParties,
    identifiers: {
      work_iswc: work.iswc || null,
      masters_isrc: mastersIsrc,
      release_upc: releases[0]?.upc || null,
      ipi_list: ipiList,
      isni_list: isniList,
    },
  };
}

/**
 * Valide la structure ArtysMusicRights
 */
export function validateMusicRights(
  data: Partial<ArtysMusicRights>
): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  if (!data.work?.title) {
    errors.push('Work title is required');
  }

  if (!data.parties || data.parties.length === 0) {
    errors.push('At least one party is required');
  }

  if (!data.masters || data.masters.length === 0) {
    errors.push('At least one master is required');
  }

  // Vérifier que tous les party_ref existent
  const partyIds = new Set(data.parties?.map((p) => p.party_id) || []);
  const allRefs = [
    ...(data.work?.authors || []),
    ...(data.work?.composers || []),
    ...(data.work?.publishers || []),
    ...data.masters?.flatMap((m) => [...m.producers, ...m.performers]) || [],
  ];

  for (const ref of allRefs) {
    if (!partyIds.has(ref.party_ref)) {
      errors.push(`Party reference ${ref.party_ref} not found in parties list`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Crée une entrée dans l'audit log
 */
export async function logMetadataChange(
  creationId: string,
  changedBy: string,
  changeType: string,
  changeSummary: string,
  oldValue: any,
  newValue: any
) {
  const db = require('@/lib/db').db;

  await db.query(
    `INSERT INTO metadata_audit_log (creation_id, changed_by, change_type, old_value, new_value, change_summary)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      creationId,
      changedBy,
      changeType,
      JSON.stringify(oldValue),
      JSON.stringify(newValue),
      changeSummary,
    ]
  );
}
```

---

## 5. Recommandations V3 par Phase

### Phase 1 : FOUNDATION (T1-T2 2026) — Priority: HIGH

**Objectif** : Transformer Proofy en registre de droits musicaux stable.

1. **Migration vers Neon PostgreSQL** ✓ (déjà en cours)
   - Colonnes JSONB pour music_work, music_masters, music_parties, music_mandates ✓
   - Tables audit & mandates ✓
   
2. **Implémentation des Types TypeScript** (1-2 sprints)
   - Définir tous les types (Work, Master, Release, Party, Mandate, Quality)
   - Validation côté API
   
3. **Endpoints de base** (1-2 sprints)
   - `GET /api/music-rights/[id]`
   - `POST /api/music-rights/[id]` (create/update)
   - `PATCH /api/music-rights/[id]/quality` (admin)
   
4. **UI Wizard de dépôt V3** (2-3 sprints)
   - Étape 1 : Upload + Hash (existant)
   - Étape 2 : Work / Masters / Parties (nouveau)
   - Étape 3 : Releases + Mandate (nouveau)
   - Étape 4 : Review + Validation
   
5. **Public Metadata API** (Allfeat-compatible) (1 sprint)
   - Endpoint `GET /api/public/[publicId]` (non authentifié)
   - Retourne le sous-ensemble Allfeat/MIDDS
   
6. **Dashboard de suivi** (1-2 sprints)
   - Visualiser work/masters/releases/parties
   - Statut des mandates
   - Historique d'audit (metadata_quality)

**Livrables** : Registre de droits musicaux stable, API complète, UI wizard.

---

### Phase 2 : AUDIO PROCESSING (T2-T3 2026) — Priority: HIGH

**Objectif** : Enrichir automatiquement les métadonnées musicales.

1. **Extraction ID3 automatique**
   - Lib : `music-metadata` ou `jsmediatags`
   - Pré-remplir title, artist, album, duration, BPM, genre
   - Lien avec fields existants `music_*`
   
2. **Fingerprinting audio**
   - Lib : Chromaprint WASM (`chromaprint.js`)
   - Générer fingerprint unique pour chaque master
   - Stocker dans `audio_fingerprint`
   
3. **Détection de tonalité (Key Detection)**
   - Lib : `essentia.js` ou `librosa-js` (WASM)
   - Remplir `audio_metadata.key`
   
4. **Waveform visualization**
   - Lib : `wavesurfer.js`
   - Pre-compute waveform data (JSON compressé)
   - Stocker dans `waveform_data`
   
5. **Dashboard audio**
   - Afficher waveform + metadonnées audio
   - Player intégré

**Livrables** : Métadonnées audio enrichies, fingerprint unique, waveform interactive.

---

### Phase 3 : DISTRIBUTION & ROYALTIES (T3-T4 2026) — Priority: MEDIUM

**Objectif** : Brancher la distribution et tracker les royalties.

1. **Intégration DistroKid / TuneCore API**
   - Envoyer masters via API
   - Tracker les `distributor_release_id`
   
2. **Export DDEX / CWR**
   - Générer XML DDEX-compliant à partir de ArtysMusicRights
   - Export CWR (Common Works Registration) pour SACEM, ASCAP, etc.
   
3. **Royalty tracking**
   - API pour recevoir les rapports de streams (Spotify, Apple Music, etc.)
   - Stocker dans `royalty_tracking`
   - Dashboard analytics
   
4. **Table distribution_events**
   - Logger chaque étape (send_to_distributor, streams_reported, royalty_paid)
   - Webhooks for events
   
5. **Payment routing**
   - Calcul automatique des parts selon les splits
   - Smart contract Polygon pour splits on-chain (optionnel)

**Livrables** : Distribution automatisée, tracking de royalties, export DDEX.

---

### Phase 4 : WEB3 AVANCÉ (T4 2026+) — Priority: MEDIUM-LOW

**Objectif** : NFT, fractional ownership, marketplace.

1. **NFT Minting (ERC-1155)**
   - Library : `thirdweb` ou `OpenZeppelin.js`
   - Un NFT par master (ou par release)
   - Metadata on-chain (IPFS)
   
2. **Royalties on-chain (EIP-2981)**
   - Smart contract royalties automatiques
   - Beneficiaries = split parties
   
3. **Fractional Ownership**
   - Émettre des "parts" tokenisées de l'œuvre
   - ERC-20 pour les parts, liées à des smart contracts
   
4. **Marketplace intégré**
   - Page pour acheter/vendre parts/NFTs
   - Secondary royalties via EIP-2981
   
5. **On-chain Splits (0xSplits ou custom)**
   - Déployer un contrat de splits pour chaque master
   - Automatiser les paiements Polygon

**Livrables** : NFTs musicales, fractional ownership, marketplace.

---

### Phase 5 : COLLABORATION & GOVERNANCE (T4 2026+) — Priority: LOW

**Objectif** : Workspaces, versioning, approbation multi-sig.

1. **Workspaces par projet**
   - Partager un projet entre plusieurs co-auteurs
   - Roles : owner, editor, viewer
   
2. **Versioning des fichiers audio**
   - Historique des versions des masters
   - Rollback possible
   
3. **Commentaires timestampés**
   - Sur la waveform, des commentaires synchronisés
   - Notifications en temps réel
   
4. **Approbation multi-signatures**
   - Avant de passer un mandat en `active`, approbation requise
   - Signature blockchain possible (via SIWE)
   
5. **ANA Governance**
   - Dashboard admin pour les collèges ANA
   - Voter sur les règles de répartition, arbitrage

**Livrables** : Collaboration pro, governance ANA.

---

## 6. Stack technologique recommandée (V3)

| Besoin | Technologie | Justification |
|--------|-------------|--------------|
| **Frontend Framework** | Next.js 15.x + React 19.x | SSR/SSG, Edge Runtime, déjà en place ✓ |
| **UI/Styling** | Tailwind CSS 4.x + Framer Motion | Utility-first, animations fluides ✓ |
| **Backend API** | Next.js API Routes (Edge) | Serverless, Edge Runtime Vercel |
| **Base de données** | Neon PostgreSQL | Serverless, JSONB support, déjà migré ✓ |
| **Auth** | NextAuth.js v5 (ou Jose) | Session management, Edge-compatible |
| **Blockchain** | Viem + Polygon | Léger, type-safe, déjà en place ✓ |
| **NFT Minting** | thirdweb SDK (ou OpenZeppelin) | Abstraction smart contract, Gas-efficient |
| **Audio Processing** | `music-metadata` + `essentia.js` (WASM) | Extraction ID3, analyse audio côté client |
| **Fingerprinting** | Chromaprint WASM | Audio fingerprint (AcoustID) |
| **Waveform** | wavesurfer.js 6.x+ | Player + visualisation interactive |
| **Distribution API** | DistroKid / TuneCore SDK | Envoi automatique vers distributeurs |
| **File Storage** | IPFS (Pinata) ou Arweave | Décentralisé, permanent, metadata |
| **Export DDEX** | XML builder (`xml2js` ou custom) | Génération de metadata standards |
| **Charts & Analytics** | Recharts ou Plotly.js | Dashboard royalties / streams |
| **Forms** | React Hook Form + Zod | Validation, performance, type-safe |
| **State Mgmt** | React Context / Zustand (optionnel) | Keep-it-simple, pas Redux sauf besoin |
| **Deployment** | Vercel + GitHub Actions | CI/CD, Edge Functions, déjà en place ✓ |
| **Monitoring** | Vercel Analytics + Sentry | Errors, performance tracking |

---

## 7. Roadmap Consolidée (12 mois)

```
┌─ Q1 2026 ─────────────────────────┐
│ ✓ Migration vers Neon PostgreSQL   │
│ ✓ Types TypeScript V3              │
│ → Endpoints music-rights API       │
│ → UI Wizard dépôt V3               │
│ → Public Metadata API (Allfeat)    │
└────────────────────────────────────┘
     ↓
┌─ Q2 2026 ─────────────────────────┐
│ → Audio ID3 extraction             │
│ → Fingerprinting (Chromaprint)    │
│ → Waveform visualization          │
│ → Dashboard audio                 │
│ → Audit log & governance          │
└────────────────────────────────────┘
     ↓
┌─ Q3 2026 ─────────────────────────┐
│ → DistroKid / TuneCore intégration │
│ → Export DDEX / CWR               │
│ → Royalty tracking API            │
│ → Analytics dashboard             │
│ → Distribution events logging     │
└────────────────────────────────────┘
     ↓
┌─ Q4 2026 ─────────────────────────┐
│ → NFT minting (ERC-1155)          │
│ → On-chain royalties (EIP-2981)   │
│ → Fractional ownership            │
│ → Marketplace MVP                 │
│ → Workspaces & collaboration      │
└────────────────────────────────────┘
```

---

## 8. Checklist d'implémentation (Phase 1)

- [ ] Tables PostgreSQL créées + migrations
- [ ] Types TypeScript définis et exportés
- [ ] Endpoints API (GET, POST, PATCH) testés
- [ ] Fonction `buildPublicMetadataFromRights` intégrée
- [ ] Validation `validateMusicRights` en place
- [ ] Audit logging (`logMetadataChange`) fonctionnel
- [ ] UI Wizard V3 prototypé
- [ ] Public API endpoint testé (Allfeat-compatible)
- [ ] Documentation API (OpenAPI/Swagger)
- [ ] Tests unitaires pour validations + mappings
- [ ] Tests E2E pour flux de dépôt complet
- [ ] Performance : requêtes JSONB optimisées (indexes)
- [ ] Sécurité : validation inputs, SQL injection prevented
- [ ] Déploiement Vercel avec Edge Functions

---

## 9. Ressources & Références

- **Allfeat MIDDS** : [docs.allfeat.org/learn/metadata/](https://docs.allfeat.org) [web:49][web:52]
- **DDEX Standard** : XML music metadata (ddex.net)
- **Chromaprint** : Audio fingerprinting (acoustid.org)
- **0xSplits** : On-chain payment splitting (0xsplits.xyz)
- **thirdweb** : NFT minting infrastructure (thirdweb.com)
- **Neon** : PostgreSQL serverless (neon.tech)
- **Vercel** : Edge Functions deployment (vercel.com)

---

## 10. Contacts & Support

- **CTO Technique** : Fabien (twoma@owlister.com)
- **Proofy Production** : https://proofy-nextjs.vercel.app
- **GitHub** : github.com/ArtysFactory/proofy-nextjs
- **Smart Contract** : 0x33623122f8B30c6988bb27Dd865e95A38Fe0Ef48

---

**Document généré** : 16 janvier 2026  
**Version** : 3.0 - Proofy V3 Roadmap  
**Statut** : Recommandations Finales pour Q1 2026
