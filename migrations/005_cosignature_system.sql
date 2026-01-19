-- ============================================
-- PROOFY V3 - Co-signature System Migration
-- ============================================
-- Date: 2026-01-19
-- Description: Add co-signature workflow for multi-party deposits
-- Rules:
--   - Required when multiple parties declared
--   - 7 days timeout → auto-cancellation
--   - Cost: 1 deposit credit per co-signer
--   - Co-signers must create an account to sign
-- ============================================

-- ===== TABLE: deposit_invitations =====
-- Stores invitations sent to co-signers

CREATE TABLE IF NOT EXISTS deposit_invitations (
  id SERIAL PRIMARY KEY,
  
  -- Link to creation (can be NULL until creation is finalized)
  creation_id INTEGER REFERENCES creations(id) ON DELETE CASCADE,
  
  -- Draft ID for pre-creation invitations
  draft_id VARCHAR(100),
  
  -- Inviter (the user who created the deposit)
  inviter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Invitee information
  invitee_email VARCHAR(255) NOT NULL,
  invitee_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Role and rights
  role_type VARCHAR(50) NOT NULL, -- 'author', 'composer', 'publisher', 'producer', 'performer', 'label', 'other'
  role_label VARCHAR(100), -- Custom label like "Guitariste", "Ingénieur son"
  percentage DECIMAL(5,2) NOT NULL,
  
  -- Unique token for signing link
  token VARCHAR(64) UNIQUE NOT NULL,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending', -- pending, viewed, accepted, rejected, expired, cancelled
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  viewed_at TIMESTAMP,
  signed_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL, -- Created_at + 7 days
  
  -- Reminder tracking
  reminder_sent_at TIMESTAMP,
  reminder_count INTEGER DEFAULT 0
);

-- Indexes for deposit_invitations
CREATE INDEX IF NOT EXISTS idx_invitation_creation ON deposit_invitations(creation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_draft ON deposit_invitations(draft_id);
CREATE INDEX IF NOT EXISTS idx_invitation_inviter ON deposit_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitation_invitee_email ON deposit_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitation_invitee_user ON deposit_invitations(invitee_user_id);
CREATE INDEX IF NOT EXISTS idx_invitation_token ON deposit_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitation_status ON deposit_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitation_expires ON deposit_invitations(expires_at);

-- ===== TABLE: signature_history =====
-- Audit trail for all signature-related actions

CREATE TABLE IF NOT EXISTS signature_history (
  id SERIAL PRIMARY KEY,
  
  -- Link to invitation
  invitation_id INTEGER REFERENCES deposit_invitations(id) ON DELETE CASCADE,
  
  -- Action tracking
  action VARCHAR(30) NOT NULL, -- 'created', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled', 'reminder_sent', 'modified'
  
  -- Actor (who performed the action)
  actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  
  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Additional data (e.g., rejection reason, modification details)
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for signature_history
CREATE INDEX IF NOT EXISTS idx_history_invitation ON signature_history(invitation_id);
CREATE INDEX IF NOT EXISTS idx_history_action ON signature_history(action);
CREATE INDEX IF NOT EXISTS idx_history_actor ON signature_history(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON signature_history(created_at);

-- ===== MODIFY creations TABLE =====
-- Add co-signature status tracking

ALTER TABLE creations
  ADD COLUMN IF NOT EXISTS cosignature_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cosignature_status VARCHAR(30) DEFAULT NULL, -- NULL, 'pending_signatures', 'partially_signed', 'all_signed', 'rejected', 'expired', 'cancelled'
  ADD COLUMN IF NOT EXISTS cosignature_count INTEGER DEFAULT 0, -- Total co-signers
  ADD COLUMN IF NOT EXISTS cosignature_signed_count INTEGER DEFAULT 0, -- Signed co-signers
  ADD COLUMN IF NOT EXISTS cosignature_expires_at TIMESTAMP, -- When the signing period ends
  ADD COLUMN IF NOT EXISTS cosignature_credits_charged INTEGER DEFAULT 0; -- Number of credits charged for co-signers

CREATE INDEX IF NOT EXISTS idx_creation_cosignature_status ON creations(cosignature_status);
CREATE INDEX IF NOT EXISTS idx_creation_cosignature_expires ON creations(cosignature_expires_at);

-- ===== TABLE: user_credits =====
-- Track user deposit credits (for pack purchases)

CREATE TABLE IF NOT EXISTS user_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Credit balance
  total_credits INTEGER DEFAULT 0,
  used_credits INTEGER DEFAULT 0,
  available_credits INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  
  -- Purchase history (latest pack info)
  last_pack_name VARCHAR(50),
  last_pack_price DECIMAL(10,2),
  last_purchase_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_user ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_available ON user_credits(available_credits);

-- ===== TABLE: credit_transactions =====
-- Audit trail for credit usage

CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type VARCHAR(30) NOT NULL, -- 'purchase', 'deposit', 'cosigner', 'refund', 'bonus'
  credits_change INTEGER NOT NULL, -- Positive for add, negative for deduct
  credits_after INTEGER NOT NULL, -- Balance after transaction
  
  -- Reference
  reference_type VARCHAR(30), -- 'pack_purchase', 'creation', 'invitation'
  reference_id INTEGER,
  
  -- Description
  description TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON credit_transactions(created_at);

-- ===== COMMENTS =====

COMMENT ON TABLE deposit_invitations IS 'Invitations sent to co-signers for deposit validation';
COMMENT ON COLUMN deposit_invitations.token IS 'Unique 64-char token for secure signing link';
COMMENT ON COLUMN deposit_invitations.expires_at IS 'Auto-set to created_at + 7 days';
COMMENT ON COLUMN deposit_invitations.status IS 'pending → viewed → accepted/rejected/expired';

COMMENT ON TABLE signature_history IS 'Complete audit trail of signature workflow';
COMMENT ON COLUMN signature_history.action IS 'created, sent, viewed, accepted, rejected, expired, cancelled, reminder_sent, modified';

COMMENT ON COLUMN creations.cosignature_required IS 'TRUE if multiple parties require validation';
COMMENT ON COLUMN creations.cosignature_status IS 'Tracks overall signing progress';
COMMENT ON COLUMN creations.cosignature_credits_charged IS 'Number of deposit credits deducted for co-signers';

COMMENT ON TABLE user_credits IS 'User deposit credit balance from pack purchases';
COMMENT ON COLUMN user_credits.available_credits IS 'Auto-computed: total - used';

COMMENT ON TABLE credit_transactions IS 'Audit trail for all credit changes';
