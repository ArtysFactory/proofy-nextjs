import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.argv[2];
if (!DATABASE_URL) {
  console.error('Usage: node run-migration-v2.mjs <DATABASE_URL>');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('🚀 Running Proofy V2 migration...\n');

  // Add all columns using raw SQL
  const alterStatements = [
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS short_description TEXT",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS made_by VARCHAR(20) DEFAULT 'human'",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS co_authors JSONB",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS public_pseudo VARCHAR(100)",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS file_storage_path TEXT",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS file_name VARCHAR(255)",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS file_size BIGINT",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS file_type VARCHAR(100)",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS depositor_type VARCHAR(20) DEFAULT 'individual'",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS company_info JSONB",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS ai_human_ratio INTEGER DEFAULT 0",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS human_contribution TEXT",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS ai_tools TEXT",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS main_prompt TEXT",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS main_prompt_private BOOLEAN DEFAULT FALSE",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS music_producers JSONB",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS music_labels JSONB",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS music_others JSONB",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS declared_ownership BOOLEAN DEFAULT FALSE",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS accepted_ai_terms BOOLEAN DEFAULT FALSE",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS chain VARCHAR(50) DEFAULT 'polygon_mainnet'",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS on_chain_timestamp TIMESTAMP WITH TIME ZONE",
    "ALTER TABLE creations ADD COLUMN IF NOT EXISTS contract_address VARCHAR(66)",
  ];

  console.log('📋 Adding columns to creations table...');
  for (const stmt of alterStatements) {
    try {
      await sql(stmt);
      const colName = stmt.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1];
      console.log(`✅ ${colName}`);
    } catch (e) {
      console.log(`⚠️  ${e.message.slice(0, 60)}`);
    }
  }

  // Create transactions table
  console.log('\n📋 Creating transactions table...');
  try {
    await sql(`
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
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }

  // Create indexes
  console.log('\n📊 Creating indexes...');
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_transactions_creation_id ON transactions(creation_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash)',
    'CREATE INDEX IF NOT EXISTS idx_creations_chain ON creations(chain)',
    'CREATE INDEX IF NOT EXISTS idx_creations_made_by ON creations(made_by)',
  ];

  for (const idx of indexes) {
    try {
      await sql(idx);
      console.log('✅ Index created');
    } catch (e) {
      console.log(`⚠️  ${e.message.slice(0, 60)}`);
    }
  }

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

  console.log('\n✅ Migration complete!');
}

runMigration().catch(console.error);
