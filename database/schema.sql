-- Discover Me — Uzbekistan Tourism Platform
-- PostgreSQL Schema v2
-- Run: psql -U postgres -d discover_me -f database/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio           TEXT,
  avatar_url    TEXT,
  preferences   JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Destinations
CREATE TABLE IF NOT EXISTS destinations (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  country      VARCHAR(100) NOT NULL DEFAULT 'Uzbekistan',
  description  TEXT,
  image_url    TEXT,
  category     VARCHAR(50),
  best_season  VARCHAR(100),
  price_level  SMALLINT CHECK (price_level BETWEEN 1 AND 4),
  featured     BOOLEAN DEFAULT FALSE,
  lat          NUMERIC(10, 7),
  lng          NUMERIC(10, 7),
  region       VARCHAR(100),
  highlights   TEXT[],
  tags         TEXT[],
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id             SERIAL PRIMARY KEY,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating         NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (destination_id, user_id)
);

-- Saved / Wishlist
CREATE TABLE IF NOT EXISTS saved_destinations (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, destination_id)
);

-- User Activity Log
CREATE TABLE IF NOT EXISTS user_activity (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type  VARCHAR(50) NOT NULL,
  destination_id INTEGER REFERENCES destinations(id) ON DELETE SET NULL,
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- AI Recommendations Log
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  prompt      TEXT NOT NULL,
  response    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Results
CREATE TABLE IF NOT EXISTS quiz_results (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers         JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);

-- Sessions (refresh tokens)
CREATE TABLE IF NOT EXISTS sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT UNIQUE NOT NULL,
  remember_me BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id   ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_destinations_category  ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_country   ON destinations(country);
CREATE INDEX IF NOT EXISTS idx_destinations_featured  ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_region    ON destinations(region);
CREATE INDEX IF NOT EXISTS idx_reviews_destination    ON reviews(destination_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user           ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user             ON saved_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user          ON user_activity(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_destinations_updated_at') THEN
    CREATE TRIGGER trg_destinations_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
