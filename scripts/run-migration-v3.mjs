import postgres from 'postgres';

const DATABASE_URL = process.argv[2];
if (!DATABASE_URL) {
  console.error('Usage: node run-migration-v3.mjs <DATABASE_URL>');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function runMigration() {
  console.log('🚀 Running Proofy V2 migration...\n');

  console.log('📋 Adding columns to creations table...');
  
  await sql.unsafe(`
    ALTER TABLE creations 
    ADD COLUMN IF NOT EXISTS short_description TEXT,
    ADD COLUMN IF NOT EXISTS made_by VARCHAR(20) DEFAULT 'human',
    ADD COLUMN IF NOT EXISTS co_authors JSONB,
    ADD COLUMN IF NOT EXISTS public_pseudo VARCHAR(100),
    ADD COLUMN IF NOT EXISTS file_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS file_size BIGINT,
    ADD COLUMN IF NOT EXISTS file_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS depositor_type VARCHAR(20) DEFAULT 'individual',
    ADD COLUMN IF NOT EXISTS company_info JSONB,
    ADD COLUMN IF NOT EXISTS ai_human_ratio INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS human_contribution TEXT,
    ADD COLUMN IF NOT EXISTS ai_tools TEXT,
    ADD COLUMN IF NOT EXISTS main_prompt TEXT,
    ADD COLUMN IF NOT EXISTS main_prompt_private BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS music_producers JSONB,
    ADD COLUMN IF NOT EXISTS music_labels JSONB,
    ADD COLUMN IF NOT EXISTS music_others JSONB,
    ADD COLUMN IF NOT EXISTS declared_ownership BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS accepted_ai_terms BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS chain VARCHAR(50) DEFAULT 'polygon_mainnet',
    ADD COLUMN IF NOT EXISTS on_chain_timestamp TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS contract_address VARCHAR(66)
  `);
  console.log('✅ Columns added!');

  // Create transactions table
  console.log('\n📋 Creating transactions table...');
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      creation_id INTEGER NOT NULL REFERENCES creations(id) ON DELETE CASCADE,
      tx_hash VARCHAR(66) NOT NULL,
      chain VARCHAR(50) NOT NULL,
      block_number INTEGER,
      gas_used BIGINT,
      gas_price BIGINT,
      on_chain_timestamp TIMESTAMP WITH TIME ZONE,
      status VARCHAR(20) DEFAULT 'pending',
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('✅ Transactions table ready');

  // Create indexes
  console.log('\n📊 Creating indexes...');
  await sql.unsafe('CREATE INDEX IF NOT EXISTS idx_transactions_creation_id ON transactions(creation_id)');
  await sql.unsafe('CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash)');
  await sql.unsafe('CREATE INDEX IF NOT EXISTS idx_creations_chain ON creations(chain)');
  await sql.unsafe('CREATE INDEX IF NOT EXISTS idx_creations_made_by ON creations(made_by)');
  console.log('✅ Indexes created');

  // Verify schema
  console.log('\n🔍 Verifying final schema...');
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'creations'
    ORDER BY ordinal_position
  `;
  console.log(`\n📋 Creations table now has ${cols.length} columns:`);
  cols.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

  await sql.end();
  console.log('\n✅ Migration complete!');
}

runMigration().catch(e => { console.error(e); process.exit(1); });
