-- Travel Passport: track user-visited destinations
-- Run: psql -U postgres -d discover_me -f database/migrations/007_travel_passport.sql

CREATE TABLE IF NOT EXISTS passport_visits (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  visited_at     TIMESTAMPTZ DEFAULT NOW(),
  notes          TEXT,
  UNIQUE (user_id, destination_id)
);

CREATE INDEX IF NOT EXISTS idx_passport_visits_user ON passport_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_passport_visits_dest ON passport_visits(destination_id);
