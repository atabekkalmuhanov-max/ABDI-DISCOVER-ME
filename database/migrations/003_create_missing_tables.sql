-- Migration: 003_create_missing_tables
-- Description: Create all tables referenced by controllers but absent from initial schema

BEGIN;

-- ─── sessions (auth refresh tokens) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT        NOT NULL UNIQUE,
  remember_me  BOOLEAN     NOT NULL DEFAULT FALSE,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ          DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_token_hash_idx ON sessions(token_hash);

-- ─── quiz_results ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers         JSONB       NOT NULL DEFAULT '{}',
  recommendations JSONB       NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ          DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS quiz_results_user_id_idx ON quiz_results(user_id);

-- ─── ai_guide_history ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_guide_history (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attraction_name     TEXT,
  location            TEXT,
  construction_year   TEXT,
  architecture_style  TEXT,
  historical_facts    JSONB       DEFAULT '[]',
  interesting_stories JSONB       DEFAULT '[]',
  audio_text          TEXT,
  language            VARCHAR(10) DEFAULT 'en',
  created_at          TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ai_guide_history_user_id_idx ON ai_guide_history(user_id);

-- ─── ai_story_history ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_story_history (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attraction_name TEXT,
  location        TEXT,
  era             TEXT,
  character_type  VARCHAR(50),
  story_length    VARCHAR(20),
  story_text      TEXT,
  character_intro TEXT,
  language        VARCHAR(10) DEFAULT 'en',
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ai_story_history_user_id_idx ON ai_story_history(user_id);

-- ─── ai_time_travel_history ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_time_travel_history (
  id                      SERIAL PRIMARY KEY,
  user_id                 INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attraction_name         TEXT,
  location                TEXT,
  construction_year       TEXT,
  target_era              TEXT,
  historical_periods      JSONB       DEFAULT '[]',
  timeline_events         JSONB       DEFAULT '[]',
  comparison              JSONB       DEFAULT '{}',
  image_generation_prompt TEXT,
  language                VARCHAR(10) DEFAULT 'en',
  created_at              TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ai_time_travel_user_id_idx ON ai_time_travel_history(user_id);

-- ─── chat_sessions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255),
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id);

-- ─── chat_messages ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id         SERIAL PRIMARY KEY,
  session_id INTEGER     NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);

-- ─── hidden_places_discoveries ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hidden_places_discoveries (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER     REFERENCES users(id) ON DELETE SET NULL,
  traveler_type  VARCHAR(50),
  experiences    JSONB       DEFAULT '[]',
  rarity_level   SMALLINT,
  region         VARCHAR(100),
  transport_mode VARCHAR(50),
  result         JSONB,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS hidden_places_user_id_idx ON hidden_places_discoveries(user_id);

-- ─── passport_visits ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS passport_visits (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id INTEGER     NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  notes          TEXT,
  visited_at     TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (user_id, destination_id)
);
CREATE INDEX IF NOT EXISTS passport_visits_user_id_idx ON passport_visits(user_id);

-- ─── travel_routes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS travel_routes (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  cover_image   TEXT,
  duration_days SMALLINT     DEFAULT 1,
  stops         JSONB        DEFAULT '[]',
  transport     VARCHAR(50)  DEFAULT 'mixed',
  budget_min    NUMERIC(10,2),
  budget_max    NUMERIC(10,2),
  is_public     BOOLEAN      NOT NULL DEFAULT TRUE,
  tags          TEXT[]       DEFAULT '{}',
  view_count    INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS travel_routes_user_id_idx  ON travel_routes(user_id);
CREATE INDEX IF NOT EXISTS travel_routes_is_public_idx ON travel_routes(is_public);

-- ─── favorites ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   INTEGER     NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (user_id, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);

COMMIT;
