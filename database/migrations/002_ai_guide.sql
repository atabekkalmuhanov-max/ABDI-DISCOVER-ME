-- Migration: 002_ai_guide
-- Description: Add ai_guide_history table for photo-based attraction identification

BEGIN;

CREATE TABLE IF NOT EXISTS ai_guide_history (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER REFERENCES users(id) ON DELETE CASCADE,
  attraction_name     VARCHAR(300),
  location            VARCHAR(200),
  construction_year   VARCHAR(100),
  architecture_style  TEXT,
  historical_facts    JSONB DEFAULT '[]',
  interesting_stories JSONB DEFAULT '[]',
  audio_text          TEXT,
  language            VARCHAR(10) DEFAULT 'en',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_guide_history_user_id ON ai_guide_history(user_id);

COMMIT;
