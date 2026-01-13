-- Proofy V2 Migration - Add all fields from Proofy V1
-- Run this in Neon SQL Editor to upgrade the schema

-- Add new columns to creations table
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
ADD COLUMN IF NOT EXISTS contract_address VARCHAR(66);

-- Rename 'authors' to 'co_authors' if it exists and co_authors doesn't
-- (Skip if already migrated)

-- Create transactions table for blockchain history
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
);

-- Create index for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_creation_id ON transactions(creation_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);

-- Update status values to match V1 format
UPDATE creations SET status = 'pending' WHERE status = 'pending';
UPDATE creations SET status = 'confirmed' WHERE status = 'onchain_confirmed';

-- Add index for chain
CREATE INDEX IF NOT EXISTS idx_creations_chain ON creations(chain);
