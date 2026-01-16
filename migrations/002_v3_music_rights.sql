-- ============================================
-- PROOFY V3 - Music Rights Migration
-- ============================================
-- Date: 2026-01-16
-- Description: Add music rights management columns and tables
-- Compatible with: Neon PostgreSQL
-- ============================================

-- ===== TABLE: creations (V3 columns) =====

-- Rights Management columns
ALTER TABLE creations
  ADD COLUMN IF NOT EXISTS music_work JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS music_masters JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS music_releases JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS music_parties JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS music_mandates JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS music_rights_status VARCHAR(20) DEFAULT 'draft';

-- Public Metadata (Allfeat-compatible)
ALTER TABLE creations
  ADD COLUMN IF NOT EXISTS public_metadata JSONB DEFAULT NULL;

-- Quality & Audit
ALTER TABLE creations
  ADD COLUMN IF NOT EXISTS metadata_quality JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS metadata_version INTEGER DEFAULT 1;

-- Audio Processing
ALTER TABLE creations
  ADD COLUMN IF NOT EXISTS audio_fingerprint VARCHAR(255),
  ADD COLUMN IF NOT EXISTS audio_metadata JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS waveform_data JSONB DEFAULT NULL;

-- Distribution & Royalties
ALTER TABLE creations
  ADD COLUMN IF NOT EXISTS distribution_status VARCHAR(50) DEFAULT 'not_distributed',
  ADD COLUMN IF NOT EXISTS distribution_metadata JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS royalty_tracking JSONB DEFAULT NULL;

-- Web3 Advanced
ALTER TABLE creations
  ADD COLUMN IF NOT EXISTS nft_metadata JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS on_chain_splits JSONB DEFAULT NULL;

-- Full status
ALTER TABLE creations
  ADD COLUMN IF NOT EXISTS full_music_rights_status VARCHAR(50) DEFAULT 'incomplete';

-- ===== INDEXES for V3 columns =====

CREATE INDEX IF NOT EXISTS idx_music_rights_status ON creations(music_rights_status);
CREATE INDEX IF NOT EXISTS idx_audio_fingerprint ON creations(audio_fingerprint);
CREATE INDEX IF NOT EXISTS idx_distribution_status ON creations(distribution_status);
CREATE INDEX IF NOT EXISTS idx_full_music_rights_status ON creations(full_music_rights_status);
CREATE INDEX IF NOT EXISTS idx_public_metadata ON creations USING GIN (public_metadata);
CREATE INDEX IF NOT EXISTS idx_music_work ON creations USING GIN (music_work);
CREATE INDEX IF NOT EXISTS idx_music_parties ON creations USING GIN (music_parties);

-- ===== TABLE: music_mandates (normalized) =====

CREATE TABLE IF NOT EXISTS music_mandates (
  id SERIAL PRIMARY KEY,
  creation_id INTEGER REFERENCES creations(id) ON DELETE CASCADE,
  mandate_id VARCHAR(50) UNIQUE NOT NULL,
  granted_to VARCHAR(100) NOT NULL DEFAULT 'artys_network',
  scope JSONB NOT NULL,
  financials JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_signature',
  effective_from TIMESTAMP,
  effective_until TIMESTAMP,
  signed_at TIMESTAMP,
  signed_document_url VARCHAR(500),
  polygon_tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mandate_creation ON music_mandates(creation_id);
CREATE INDEX IF NOT EXISTS idx_mandate_status ON music_mandates(status);
CREATE INDEX IF NOT EXISTS idx_mandate_granted_to ON music_mandates(granted_to);

-- ===== TABLE: metadata_audit_log =====

CREATE TABLE IF NOT EXISTS metadata_audit_log (
  id SERIAL PRIMARY KEY,
  creation_id INTEGER REFERENCES creations(id) ON DELETE CASCADE,
  changed_by VARCHAR(100) NOT NULL,
  change_type VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  change_summary TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_creation ON metadata_audit_log(creation_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON metadata_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_change_type ON metadata_audit_log(change_type);

-- ===== TABLE: distribution_events =====

CREATE TABLE IF NOT EXISTS distribution_events (
  id SERIAL PRIMARY KEY,
  creation_id INTEGER REFERENCES creations(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  distributor_name VARCHAR(100),
  platform VARCHAR(100),
  event_data JSONB,
  event_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_distribution_creation ON distribution_events(creation_id);
CREATE INDEX IF NOT EXISTS idx_distribution_date ON distribution_events(event_date);
CREATE INDEX IF NOT EXISTS idx_distribution_type ON distribution_events(event_type);
CREATE INDEX IF NOT EXISTS idx_distribution_platform ON distribution_events(platform);

-- ===== TABLE: royalty_reports =====

CREATE TABLE IF NOT EXISTS royalty_reports (
  id SERIAL PRIMARY KEY,
  creation_id INTEGER REFERENCES creations(id) ON DELETE CASCADE,
  platform VARCHAR(100) NOT NULL,
  country VARCHAR(10),
  period_start DATE,
  period_end DATE,
  streams BIGINT DEFAULT 0,
  revenue DECIMAL(12, 4) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'EUR',
  report_data JSONB,
  imported_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_royalty_creation ON royalty_reports(creation_id);
CREATE INDEX IF NOT EXISTS idx_royalty_platform ON royalty_reports(platform);
CREATE INDEX IF NOT EXISTS idx_royalty_period ON royalty_reports(period_start, period_end);

-- ===== COMMENTS =====

COMMENT ON COLUMN creations.music_work IS 'MusicWork JSON: title, iswc, authors, composers, publishers';
COMMENT ON COLUMN creations.music_masters IS 'MusicMaster[] JSON: recordings with isrc, performers, producers';
COMMENT ON COLUMN creations.music_releases IS 'MusicRelease[] JSON: singles, EPs, albums with upc, tracklist';
COMMENT ON COLUMN creations.music_parties IS 'MusicParty[] JSON: all parties (persons/entities) with ipi, isni';
COMMENT ON COLUMN creations.music_mandates IS 'MusicMandate[] JSON: management mandates for Artys Network';
COMMENT ON COLUMN creations.public_metadata IS 'PublicMetadata JSON: Allfeat-compatible public subset';
COMMENT ON COLUMN creations.metadata_quality IS 'MetadataQuality JSON: status (draft/self_declared/verified) + history';
COMMENT ON COLUMN creations.audio_fingerprint IS 'Chromaprint audio fingerprint (truncated hash)';
COMMENT ON COLUMN creations.audio_metadata IS 'AudioMetadata JSON: bpm, key, duration, bitrate, channels, loudness';

COMMENT ON TABLE music_mandates IS 'Normalized table for management mandates (Artys Network)';
COMMENT ON TABLE metadata_audit_log IS 'Audit trail for all metadata changes (ANA governance)';
COMMENT ON TABLE distribution_events IS 'Events log for distribution workflow';
COMMENT ON TABLE royalty_reports IS 'Imported royalty reports from platforms';
