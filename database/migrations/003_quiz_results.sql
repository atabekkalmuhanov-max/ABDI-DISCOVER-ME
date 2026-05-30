-- Migration: 003_quiz_results
-- Description: Create quiz_results table for AI Travel Quiz

BEGIN;

CREATE TABLE IF NOT EXISTS quiz_results (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers         JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);

COMMIT;
