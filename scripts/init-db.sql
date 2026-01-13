-- Proofy Database Schema for Neon PostgreSQL
-- Run this SQL in the Neon SQL Editor to create the tables

-- Users table
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
);

-- Creations table (blockchain proofs)
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
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id);
CREATE INDEX IF NOT EXISTS idx_creations_public_id ON creations(public_id);
CREATE INDEX IF NOT EXISTS idx_creations_file_hash ON creations(file_hash);
CREATE INDEX IF NOT EXISTS idx_creations_status ON creations(status);

-- Insert a test user (password: Test1234!)
-- SHA-256 hash of 'Test1234!' = 8d4c5e8b2e0f6a1c3b9d7e5f4a2c8d6e1b3f7a9c5d2e8f4b6a1c9d3e7f5b2a8c
-- INSERT INTO users (first_name, last_name, country, email, password_hash, email_verified)
-- VALUES ('Test', 'User', 'FR', 'test@proofy.io', '8d4c5e8b2e0f6a1c3b9d7e5f4a2c8d6e1b3f7a9c5d2e8f4b6a1c9d3e7f5b2a8c', true);
