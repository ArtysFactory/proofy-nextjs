// ============================================
// PROOFY V3 - Run Migrations on Neon
// ============================================

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  console.error('Usage: node scripts/run-migrations.js <DATABASE_URL>');
  process.exit(1);
}

async function runMigrations() {
  console.log('🚀 Starting Proofy V3 migrations...\n');
  
  const sql = neon(DATABASE_URL);
  
  // Read migration file
  const migrationPath = path.join(process.cwd(), 'migrations/002_v3_music_rights.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  
  // Split by statements (simple split - handles most cases)
  const statements = migrationSQL
    .split(/;(?=\s*(?:--|ALTER|CREATE|COMMENT|$))/g)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  
  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (!statement || statement.startsWith('--')) continue;
    
    // Extract short description
    const shortDesc = statement.substring(0, 60).replace(/\n/g, ' ') + '...';
    
    try {
      await sql(statement + ';');
      console.log(`✅ [${i + 1}/${statements.length}] ${shortDesc}`);
      success++;
    } catch (error) {
      // Ignore "already exists" errors for idempotent migrations
      if (error.message?.includes('already exists') || 
          error.message?.includes('duplicate')) {
        console.log(`⏭️  [${i + 1}/${statements.length}] Already exists - skipped`);
        success++;
      } else {
        console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`);
        console.error(`   Statement: ${shortDesc}`);
        errors++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(50));
  
  if (errors === 0) {
    console.log('\n🎉 All migrations completed successfully!');
  } else {
    console.log('\n⚠️  Some migrations failed. Please review errors above.');
    process.exit(1);
  }
}

runMigrations().catch(console.error);
