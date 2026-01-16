-- Migration 003: Rights columns (snake_case)
ALTER TABLE creations ADD COLUMN IF NOT EXISTS copyright_rights JSONB DEFAULT NULL;
ALTER TABLE creations ADD COLUMN IF NOT EXISTS neighboring_rights JSONB DEFAULT NULL;
ALTER TABLE creations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_copyright_rights ON creations USING GIN (copyright_rights);
CREATE INDEX IF NOT EXISTS idx_neighboring_rights ON creations USING GIN (neighboring_rights);
