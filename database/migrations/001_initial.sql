-- Migration: 001_initial
-- Description: Create initial tables for Discover Me

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destinations (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  country      VARCHAR(100) NOT NULL,
  description  TEXT,
  image_url    TEXT,
  category     VARCHAR(50),
  best_season  VARCHAR(50),
  price_level  SMALLINT,
  featured     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id             SERIAL PRIMARY KEY,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating         NUMERIC(2,1) NOT NULL,
  comment        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (destination_id, user_id)
);

CREATE TABLE IF NOT EXISTS saved_destinations (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, destination_id)
);

COMMIT;
