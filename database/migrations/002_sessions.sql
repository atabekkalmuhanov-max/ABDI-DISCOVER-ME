-- Migration 002: Add sessions table for refresh token management

CREATE TABLE IF NOT EXISTS sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT UNIQUE NOT NULL,
  remember_me BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
