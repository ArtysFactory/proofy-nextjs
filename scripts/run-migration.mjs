import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.argv[2];
if (!DATABASE_URL) {
  console.error('Usage: node run-migration.mjs <DATABASE_URL>');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('🚀 Running Proofy V2 migration...\n');

  // Add columns one by one to handle "already exists" gracefully
  const columns = [
    { name: 'short_description', type: 'TEXT' },
    { name: 'made_by', type: "VARCHAR(20) DEFAULT 'human'" },
    { name: 'co_authors', type: 'JSONB' },
    { name: 'public_pseudo', type: 'VARCHAR(100)' },
    { name: 'file_storage_path', type: 'TEXT' },
    { name: 'file_name', type: 'VARCHAR(255)' },
    { name: 'file_size', type: 'BIGINT' },
    { name: 'file_type', type: 'VARCHAR(100)' },
    { name: 'depositor_type', type: "VARCHAR(20) DEFAULT 'individual'" },
    { name: 'company_info', type: 'JSONB' },
    { name: 'ai_human_ratio', type: 'INTEGER DEFAULT 0' },
    { name: 'human_contribution', type: 'TEXT' },
    { name: 'ai_tools', type: 'TEXT' },
    { name: 'main_prompt', type: 'TEXT' },
    { name: 'main_prompt_private', type: 'BOOLEAN DEFAULT FALSE' },
    { name: 'music_producers', type: 'JSONB' },
    { name: 'music_labels', type: 'JSONB' },
    { name: 'music_others', type: 'JSONB' },
    { name: 'declared_ownership', type: 'BOOLEAN DEFAULT FALSE' },
    { name: 'accepted_ai_terms', type: 'BOOLEAN DEFAULT FALSE' },
    { name: 'chain', type: "VARCHAR(50) DEFAULT 'polygon_mainnet'" },
    { name: 'on_chain_timestamp', type: 'TIMESTAMP WITH TIME ZONE' },
    { name: 'contract_address', type: 'VARCHAR(66)' },
  ];

  for (const col of columns) {
    try {
      await sql`ALTER TABLE creations ADD COLUMN IF NOT EXISTS ${sql(col.name)} ${sql.unsafe(col.type)}`;
      console.log(`✅ Added column: ${col.name}`);
    } catch (e) {
      // Column might already exist with different type, that's OK
      console.log(`⏭️  Column ${col.name}: ${e.message.includes('already exists') ? 'already exists' : e.message}`);
    }
  }

  // Create transactions table
  console.log('\n📋 Creating transactions table...');
  try {
    await sql`
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
    `;
    console.log('✅ Transactions table ready');
  } catch (e) {
    console.log(`⏭️  Transactions table: ${e.message}`);
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
      await sql.unsafe(idx);
      console.log(`✅ Index created`);
    } catch (e) {
      console.log(`⏭️  Index: ${e.message}`);
    }
  }

  // Verify schema
  console.log('\n🔍 Verifying schema...');
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'creations'
    ORDER BY ordinal_position
  `;
  console.log(`\n📋 Creations table has ${cols.length} columns:`);
  cols.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

  console.log('\n✅ Migration complete!');
}

runMigration().catch(console.error);
