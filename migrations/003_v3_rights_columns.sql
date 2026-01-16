ALTER TABLE creations ADD COLUMN IF NOT EXISTS "copyrightRights" JSONB DEFAULT NULL;
ALTER TABLE creations ADD COLUMN IF NOT EXISTS "neighboringRights" JSONB DEFAULT NULL;
ALTER TABLE creations ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_copyright_rights ON creations USING GIN ("copyrightRights");
CREATE INDEX IF NOT EXISTS idx_neighboring_rights ON creations USING GIN ("neighboringRights");
