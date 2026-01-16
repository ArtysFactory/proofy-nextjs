// ============================================
// PROOFY V3 - Run Migrations on Neon
// ============================================

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  console.error('Usage: node scripts/run-migrations.mjs <DATABASE_URL>');
  process.exit(1);
}

async function runMigrations() {
  console.log('🚀 Starting Proofy V3 migrations...\n');
  
  const sql = neon(DATABASE_URL);
  
  // Execute migrations using tagged template literals
  const migrations = [
    // ===== ALTER TABLE: creations (V3 columns) =====
    { desc: 'Add music_work column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS music_work JSONB DEFAULT NULL` },
    { desc: 'Add music_masters column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS music_masters JSONB DEFAULT NULL` },
    { desc: 'Add music_releases column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS music_releases JSONB DEFAULT NULL` },
    { desc: 'Add music_parties column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS music_parties JSONB DEFAULT NULL` },
    { desc: 'Add music_mandates column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS music_mandates JSONB DEFAULT NULL` },
    { desc: 'Add music_rights_status column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS music_rights_status VARCHAR(20) DEFAULT 'draft'` },
    { desc: 'Add public_metadata column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS public_metadata JSONB DEFAULT NULL` },
    { desc: 'Add metadata_quality column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS metadata_quality JSONB DEFAULT NULL` },
    { desc: 'Add metadata_version column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS metadata_version INTEGER DEFAULT 1` },
    { desc: 'Add audio_fingerprint column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS audio_fingerprint VARCHAR(255)` },
    { desc: 'Add audio_metadata column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS audio_metadata JSONB DEFAULT NULL` },
    { desc: 'Add waveform_data column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS waveform_data JSONB DEFAULT NULL` },
    { desc: 'Add distribution_status column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS distribution_status VARCHAR(50) DEFAULT 'not_distributed'` },
    { desc: 'Add distribution_metadata column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS distribution_metadata JSONB DEFAULT NULL` },
    { desc: 'Add royalty_tracking column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS royalty_tracking JSONB DEFAULT NULL` },
    { desc: 'Add nft_metadata column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS nft_metadata JSONB DEFAULT NULL` },
    { desc: 'Add on_chain_splits column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS on_chain_splits JSONB DEFAULT NULL` },
    { desc: 'Add full_music_rights_status column', sql: sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS full_music_rights_status VARCHAR(50) DEFAULT 'incomplete'` },
    
    // ===== INDEXES =====
    { desc: 'Create idx_music_rights_status', sql: sql`CREATE INDEX IF NOT EXISTS idx_music_rights_status ON creations(music_rights_status)` },
    { desc: 'Create idx_audio_fingerprint', sql: sql`CREATE INDEX IF NOT EXISTS idx_audio_fingerprint ON creations(audio_fingerprint)` },
    { desc: 'Create idx_distribution_status', sql: sql`CREATE INDEX IF NOT EXISTS idx_distribution_status ON creations(distribution_status)` },
    { desc: 'Create idx_full_music_rights_status', sql: sql`CREATE INDEX IF NOT EXISTS idx_full_music_rights_status ON creations(full_music_rights_status)` },
    { desc: 'Create idx_public_metadata GIN', sql: sql`CREATE INDEX IF NOT EXISTS idx_public_metadata ON creations USING GIN (public_metadata)` },
    { desc: 'Create idx_music_work GIN', sql: sql`CREATE INDEX IF NOT EXISTS idx_music_work ON creations USING GIN (music_work)` },
    { desc: 'Create idx_music_parties GIN', sql: sql`CREATE INDEX IF NOT EXISTS idx_music_parties ON creations USING GIN (music_parties)` },
    
    // ===== TABLE: music_mandates =====
    { desc: 'Create table music_mandates', sql: sql`
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
      )
    ` },
    { desc: 'Create idx_mandate_creation', sql: sql`CREATE INDEX IF NOT EXISTS idx_mandate_creation ON music_mandates(creation_id)` },
    { desc: 'Create idx_mandate_status', sql: sql`CREATE INDEX IF NOT EXISTS idx_mandate_status ON music_mandates(status)` },
    { desc: 'Create idx_mandate_granted_to', sql: sql`CREATE INDEX IF NOT EXISTS idx_mandate_granted_to ON music_mandates(granted_to)` },
    
    // ===== TABLE: metadata_audit_log =====
    { desc: 'Create table metadata_audit_log', sql: sql`
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
      )
    ` },
    { desc: 'Create idx_audit_creation', sql: sql`CREATE INDEX IF NOT EXISTS idx_audit_creation ON metadata_audit_log(creation_id)` },
    { desc: 'Create idx_audit_timestamp', sql: sql`CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON metadata_audit_log(timestamp)` },
    { desc: 'Create idx_audit_change_type', sql: sql`CREATE INDEX IF NOT EXISTS idx_audit_change_type ON metadata_audit_log(change_type)` },
    
    // ===== TABLE: distribution_events =====
    { desc: 'Create table distribution_events', sql: sql`
      CREATE TABLE IF NOT EXISTS distribution_events (
        id SERIAL PRIMARY KEY,
        creation_id INTEGER REFERENCES creations(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        distributor_name VARCHAR(100),
        platform VARCHAR(100),
        event_data JSONB,
        event_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    ` },
    { desc: 'Create idx_distribution_creation', sql: sql`CREATE INDEX IF NOT EXISTS idx_distribution_creation ON distribution_events(creation_id)` },
    { desc: 'Create idx_distribution_date', sql: sql`CREATE INDEX IF NOT EXISTS idx_distribution_date ON distribution_events(event_date)` },
    { desc: 'Create idx_distribution_type', sql: sql`CREATE INDEX IF NOT EXISTS idx_distribution_type ON distribution_events(event_type)` },
    { desc: 'Create idx_distribution_platform', sql: sql`CREATE INDEX IF NOT EXISTS idx_distribution_platform ON distribution_events(platform)` },
    
    // ===== TABLE: royalty_reports =====
    { desc: 'Create table royalty_reports', sql: sql`
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
      )
    ` },
    { desc: 'Create idx_royalty_creation', sql: sql`CREATE INDEX IF NOT EXISTS idx_royalty_creation ON royalty_reports(creation_id)` },
    { desc: 'Create idx_royalty_platform', sql: sql`CREATE INDEX IF NOT EXISTS idx_royalty_platform ON royalty_reports(platform)` },
    { desc: 'Create idx_royalty_period', sql: sql`CREATE INDEX IF NOT EXISTS idx_royalty_period ON royalty_reports(period_start, period_end)` },
  ];
  
  console.log(`📋 Executing ${migrations.length} migrations...\n`);
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < migrations.length; i++) {
    const { desc, sql: query } = migrations[i];
    
    try {
      await query;
      console.log(`✅ [${i + 1}/${migrations.length}] ${desc}`);
      success++;
    } catch (error) {
      if (error.message?.includes('already exists') || 
          error.message?.includes('duplicate')) {
        console.log(`⏭️  [${i + 1}/${migrations.length}] ${desc} (already exists)`);
        success++;
      } else {
        console.error(`❌ [${i + 1}/${migrations.length}] ${desc}`);
        console.error(`   Error: ${error.message}`);
        errors++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(50));
  
  if (errors === 0) {
    console.log('\n🎉 All V3 migrations completed successfully!');
  } else {
    console.log('\n⚠️  Some migrations failed. Please review errors above.');
    process.exit(1);
  }
}

runMigrations().catch(console.error);
