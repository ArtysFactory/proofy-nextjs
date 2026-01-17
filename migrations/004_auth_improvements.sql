-- Migration: Auth Improvements
-- Adds columns for Google OAuth and password reset functionality

-- Add Google OAuth support
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add password reset support
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Create index for faster Google ID lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Create index for faster reset token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
