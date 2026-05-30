-- Migration: 002_add_missing_columns
-- Description: Add columns referenced by controllers but missing from initial schema

BEGIN;

-- destinations: region, lat, lng, tags, highlights
ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS region     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS lat        NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS lng        NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS tags       TEXT[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS highlights TEXT[]        DEFAULT '{}';

-- users: bio, avatar_url, is_active, is_verified, country, last_login_at
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bio           TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url    TEXT,
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS country       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

COMMIT;
