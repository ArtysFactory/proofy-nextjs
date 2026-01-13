// Initialize database tables for Proofy
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is required');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function initDB() {
    console.log('🚀 Initializing Proofy database...\n');

    try {
        // Create users table
        console.log('📦 Creating users table...');
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                country VARCHAR(10) NOT NULL DEFAULT 'FR',
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(64) NOT NULL,
                email_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;
        console.log('✅ Users table created\n');

        // Create creations table
        console.log('📦 Creating creations table...');
        await sql`
            CREATE TABLE IF NOT EXISTS creations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                public_id VARCHAR(20) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                file_hash VARCHAR(64) NOT NULL,
                project_type VARCHAR(50) NOT NULL,
                authors TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                tx_hash VARCHAR(66),
                block_number INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;
        console.log('✅ Creations table created\n');

        // Create indexes
        console.log('📦 Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_creations_public_id ON creations(public_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_creations_file_hash ON creations(file_hash)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_creations_status ON creations(status)`;
        console.log('✅ Indexes created\n');

        // Verify tables
        console.log('🔍 Verifying tables...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log('📋 Tables in database:', tables.map(t => t.table_name).join(', '));

        console.log('\n🎉 Database initialization complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

initDB();
