import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const databaseUrl = process.argv[2];
const migrationFile = process.argv[3];

if (!databaseUrl || !migrationFile) {
  console.error('Usage: node run-single-migration.mjs <DATABASE_URL> <migration.sql>');
  process.exit(1);
}

const sql = neon(databaseUrl);
const migrationSql = fs.readFileSync(migrationFile, 'utf8');

// Split by semicolon but ignore comments
const statements = migrationSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`🚀 Running migration: ${migrationFile}`);
console.log(`📋 Found ${statements.length} statements\n`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const shortStmt = stmt.substring(0, 60).replace(/\n/g, ' ');
  try {
    await sql.query(stmt);
    console.log(`✅ [${i + 1}/${statements.length}] ${shortStmt}...`);
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`⏭️ [${i + 1}/${statements.length}] Already exists: ${shortStmt}...`);
    } else {
      console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`);
    }
  }
}

console.log('\n✅ Migration completed!');
