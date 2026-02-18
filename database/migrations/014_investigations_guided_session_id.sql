-- Migration 014: Add guided_session_id to investigations
-- Enables direct lookup from investigation → guided session that created it.

ALTER TABLE investigations
ADD COLUMN IF NOT EXISTS guided_session_id UUID REFERENCES investigation_sessions(id);

CREATE INDEX IF NOT EXISTS idx_investigations_guided_session_id
  ON investigations(guided_session_id) WHERE guided_session_id IS NOT NULL;
