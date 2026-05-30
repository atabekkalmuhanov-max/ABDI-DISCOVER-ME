-- Discover Me — Uzbekistan Tourism Platform
-- PostgreSQL Schema v3 — Complete
-- Run: psql -U postgres -d discover_me -f database/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
  ('user',      'Regular platform user'),
  ('admin',     'Platform administrator'),
  ('guide',     'Certified local guide'),
  ('moderator', 'Content moderator')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  role_id       INTEGER REFERENCES roles(id) ON DELETE SET NULL DEFAULT 1,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin', 'guide', 'moderator')),
  bio           TEXT,
  avatar_url    TEXT,
  phone         VARCHAR(30),
  country       VARCHAR(100),
  language      VARCHAR(10) DEFAULT 'en',
  preferences   JSONB DEFAULT '{}',
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SESSIONS (refresh tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT UNIQUE NOT NULL,
  remember_me BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address  INET,
  user_agent  TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REGIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS regions (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  name_uz     VARCHAR(100),
  name_ru     VARCHAR(100),
  description TEXT,
  image_url   TEXT,
  area_km2    NUMERIC(10, 2),
  population  INTEGER,
  capital     VARCHAR(100),
  lat         NUMERIC(10, 7),
  lng         NUMERIC(10, 7),
  svg_id      VARCHAR(50),
  color       VARCHAR(7),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS cities (
  id          SERIAL PRIMARY KEY,
  region_id   INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  name_uz     VARCHAR(100),
  name_ru     VARCHAR(100),
  description TEXT,
  image_url   TEXT,
  population  INTEGER,
  is_capital  BOOLEAN DEFAULT FALSE,
  lat         NUMERIC(10, 7),
  lng         NUMERIC(10, 7),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATTRACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS attractions (
  id              SERIAL PRIMARY KEY,
  region_id       INTEGER REFERENCES regions(id) ON DELETE SET NULL,
  city_id         INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  name            VARCHAR(200) NOT NULL,
  name_uz         VARCHAR(200),
  name_ru         VARCHAR(200),
  description     TEXT,
  history         TEXT,
  category        VARCHAR(50) CHECK (category IN (
                    'historical', 'natural', 'cultural', 'religious',
                    'museum', 'bazaar', 'architectural', 'recreational'
                  )),
  image_url       TEXT,
  gallery         TEXT[],
  lat             NUMERIC(10, 7),
  lng             NUMERIC(10, 7),
  address         TEXT,
  working_hours   JSONB DEFAULT '{}',
  admission_price NUMERIC(10, 2),
  price_currency  VARCHAR(10) DEFAULT 'UZS',
  best_season     VARCHAR(100),
  tags            TEXT[],
  highlights      TEXT[],
  avg_rating      NUMERIC(3, 2) DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  visit_count     INTEGER DEFAULT 0,
  featured        BOOLEAN DEFAULT FALSE,
  is_hidden_gem   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HOTELS
-- ============================================================
CREATE TABLE IF NOT EXISTS hotels (
  id             SERIAL PRIMARY KEY,
  city_id        INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  region_id      INTEGER REFERENCES regions(id) ON DELETE SET NULL,
  name           VARCHAR(200) NOT NULL,
  description    TEXT,
  stars          SMALLINT CHECK (stars BETWEEN 1 AND 5),
  image_url      TEXT,
  gallery        TEXT[],
  address        TEXT,
  phone          VARCHAR(50),
  email          VARCHAR(255),
  website        TEXT,
  lat            NUMERIC(10, 7),
  lng            NUMERIC(10, 7),
  amenities      TEXT[],
  price_min      NUMERIC(10, 2),
  price_max      NUMERIC(10, 2),
  price_currency VARCHAR(10) DEFAULT 'USD',
  avg_rating     NUMERIC(3, 2) DEFAULT 0,
  review_count   INTEGER DEFAULT 0,
  featured       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurants (
  id            SERIAL PRIMARY KEY,
  city_id       INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  region_id     INTEGER REFERENCES regions(id) ON DELETE SET NULL,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  cuisine_type  VARCHAR(100),
  image_url     TEXT,
  gallery       TEXT[],
  address       TEXT,
  phone         VARCHAR(50),
  website       TEXT,
  working_hours JSONB DEFAULT '{}',
  lat           NUMERIC(10, 7),
  lng           NUMERIC(10, 7),
  price_level   SMALLINT CHECK (price_level BETWEEN 1 AND 4),
  has_halal     BOOLEAN DEFAULT TRUE,
  has_delivery  BOOLEAN DEFAULT FALSE,
  avg_rating    NUMERIC(3, 2) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  featured      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS (polymorphic: attraction / hotel / restaurant)
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type   VARCHAR(20) NOT NULL
                  CHECK (entity_type IN ('attraction', 'hotel', 'restaurant')),
  entity_id     INTEGER NOT NULL,
  rating        NUMERIC(2, 1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         VARCHAR(200),
  comment       TEXT,
  photos        TEXT[],
  is_verified   BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, entity_type, entity_id)
);

-- ============================================================
-- FAVORITES (polymorphic)
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL
                CHECK (entity_type IN ('attraction', 'hotel', 'restaurant', 'route', 'destination')),
  entity_id   INTEGER NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, entity_type, entity_id)
);

-- Migrate existing favorites constraint if table already exists
DO $$
BEGIN
  ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_entity_type_check;
  ALTER TABLE favorites ADD CONSTRAINT favorites_entity_type_check
    CHECK (entity_type IN ('attraction', 'hotel', 'restaurant', 'route', 'destination'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- TRAVEL ROUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS travel_routes (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  cover_image   TEXT,
  duration_days SMALLINT,
  stops         JSONB DEFAULT '[]',
  total_km      NUMERIC(10, 2),
  transport     VARCHAR(50) CHECK (transport IN ('car', 'bus', 'train', 'mixed', 'walk')),
  budget_min    NUMERIC(10, 2),
  budget_max    NUMERIC(10, 2),
  is_public     BOOLEAN DEFAULT TRUE,
  tags          TEXT[],
  view_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRAVEL PASSPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS travel_passports (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attraction_id INTEGER NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  visited_at    TIMESTAMPTZ DEFAULT NOW(),
  notes         TEXT,
  photo_url     TEXT,
  rating        NUMERIC(2, 1) CHECK (rating BETWEEN 1 AND 5),
  verified      BOOLEAN DEFAULT FALSE,
  UNIQUE (user_id, attraction_id)
);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  icon        TEXT,
  badge_url   TEXT,
  category    VARCHAR(50) CHECK (category IN ('explorer', 'social', 'quiz', 'ai', 'streak')),
  condition   JSONB DEFAULT '{}',
  points      INTEGER DEFAULT 10,
  is_rare     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- ============================================================
-- QUIZ RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers         JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  score           INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHAT HISTORY (sessions + messages)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content    TEXT NOT NULL,
  tokens     INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPLOADED IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS uploaded_images (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  file_name   VARCHAR(255) NOT NULL,
  file_path   TEXT NOT NULL,
  file_size   INTEGER,
  mime_type   VARCHAR(100),
  width       INTEGER,
  height      INTEGER,
  entity_type VARCHAR(50),
  entity_id   INTEGER,
  url         TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI STORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_stories (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  attraction_name VARCHAR(300),
  location        VARCHAR(200),
  era             VARCHAR(200),
  character_type  VARCHAR(100),
  story_length    VARCHAR(20) DEFAULT 'medium',
  story_text      TEXT,
  character_intro TEXT,
  language        VARCHAR(10) DEFAULT 'en',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TIME TRAVEL HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS time_travel_history (
  id                      SERIAL PRIMARY KEY,
  user_id                 INTEGER REFERENCES users(id) ON DELETE CASCADE,
  attraction_name         TEXT,
  location                TEXT,
  construction_year       TEXT,
  target_era              TEXT,
  historical_periods      JSONB DEFAULT '[]',
  timeline_events         JSONB DEFAULT '[]',
  comparison              JSONB DEFAULT '{}',
  image_generation_prompt TEXT,
  language                VARCHAR(5) DEFAULT 'en',
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HIDDEN PLACES (legacy)
-- ============================================================
CREATE TABLE IF NOT EXISTS hidden_places (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  traveler_type  VARCHAR(50),
  experiences    JSONB DEFAULT '[]',
  rarity_level   SMALLINT DEFAULT 70 CHECK (rarity_level BETWEEN 0 AND 100),
  region         VARCHAR(100),
  transport_mode VARCHAR(50),
  result         JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HIDDEN PLACES DISCOVERIES (used by hiddenPlacesController)
-- ============================================================
CREATE TABLE IF NOT EXISTS hidden_places_discoveries (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
  traveler_type  VARCHAR(50),
  experiences    TEXT,
  rarity_level   SMALLINT DEFAULT 70,
  region         VARCHAR(100),
  transport_mode VARCHAR(50),
  result         JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL CHECK (type IN (
               'achievement', 'review_reply', 'route_like',
               'system', 'trip_reminder', 'new_attraction'
             )),
  title      VARCHAR(200) NOT NULL,
  message    TEXT,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DESTINATIONS (legacy compatibility)
-- ============================================================
CREATE TABLE IF NOT EXISTS destinations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  country     VARCHAR(100) NOT NULL DEFAULT 'Uzbekistan',
  description TEXT,
  image_url   TEXT,
  category    VARCHAR(50),
  best_season VARCHAR(100),
  price_level SMALLINT CHECK (price_level BETWEEN 1 AND 4),
  featured    BOOLEAN DEFAULT FALSE,
  lat         NUMERIC(10, 7),
  lng         NUMERIC(10, 7),
  region      VARCHAR(100),
  highlights  TEXT[],
  tags        TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED DESTINATIONS (legacy compatibility)
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_destinations (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, destination_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id   ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

-- regions & cities
CREATE INDEX IF NOT EXISTS idx_regions_name     ON regions(name);
CREATE INDEX IF NOT EXISTS idx_cities_region_id ON cities(region_id);

-- attractions
CREATE INDEX IF NOT EXISTS idx_attractions_region_id  ON attractions(region_id);
CREATE INDEX IF NOT EXISTS idx_attractions_city_id    ON attractions(city_id);
CREATE INDEX IF NOT EXISTS idx_attractions_category   ON attractions(category);
CREATE INDEX IF NOT EXISTS idx_attractions_featured   ON attractions(featured);
CREATE INDEX IF NOT EXISTS idx_attractions_hidden_gem ON attractions(is_hidden_gem);
CREATE INDEX IF NOT EXISTS idx_attractions_avg_rating ON attractions(avg_rating DESC);

-- hotels
CREATE INDEX IF NOT EXISTS idx_hotels_city_id   ON hotels(city_id);
CREATE INDEX IF NOT EXISTS idx_hotels_region_id ON hotels(region_id);
CREATE INDEX IF NOT EXISTS idx_hotels_stars     ON hotels(stars);
CREATE INDEX IF NOT EXISTS idx_hotels_featured  ON hotels(featured);

-- restaurants
CREATE INDEX IF NOT EXISTS idx_restaurants_city_id   ON restaurants(city_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_region_id ON restaurants(region_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_featured  ON restaurants(featured);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity  ON reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating  ON reviews(rating);

-- favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_entity  ON favorites(entity_type, entity_id);

-- travel_routes
CREATE INDEX IF NOT EXISTS idx_routes_user_id   ON travel_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_is_public ON travel_routes(is_public);

-- travel_passports
CREATE INDEX IF NOT EXISTS idx_passport_user_id       ON travel_passports(user_id);
CREATE INDEX IF NOT EXISTS idx_passport_attraction_id ON travel_passports(attraction_id);

-- achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- quiz_results
CREATE INDEX IF NOT EXISTS idx_quiz_user_id ON quiz_results(user_id);

-- chat
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user    ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- uploaded_images
CREATE INDEX IF NOT EXISTS idx_images_user_id ON uploaded_images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_entity  ON uploaded_images(entity_type, entity_id);

-- ai features
CREATE INDEX IF NOT EXISTS idx_ai_stories_user   ON ai_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_time_travel_user  ON time_travel_history(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_places_user    ON hidden_places(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_places_created ON hidden_places(created_at DESC);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- destinations (legacy)
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_region   ON destinations(region);
CREATE INDEX IF NOT EXISTS idx_saved_user            ON saved_destinations(user_id);

-- hidden_places_discoveries
CREATE INDEX IF NOT EXISTS idx_hidden_discoveries_user    ON hidden_places_discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_discoveries_created ON hidden_places_discoveries(created_at DESC);

-- ============================================================
-- PASSPORT VISITS (track user-visited destinations for passport)
-- ============================================================
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

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users', 'attractions', 'hotels', 'restaurants',
    'reviews', 'travel_routes', 'destinations', 'chat_sessions'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_' || tbl || '_updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
        tbl, tbl
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- FUNCTION: update avg_rating + review_count on reviews
-- ============================================================
CREATE OR REPLACE FUNCTION sync_entity_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_r  NUMERIC(3,2);
  cnt    INTEGER;
  tbl    TEXT;
BEGIN
  tbl := CASE
    WHEN NEW.entity_type = 'attraction'  THEN 'attractions'
    WHEN NEW.entity_type = 'hotel'       THEN 'hotels'
    WHEN NEW.entity_type = 'restaurant'  THEN 'restaurants'
  END;

  SELECT AVG(rating), COUNT(*)
    INTO avg_r, cnt
    FROM reviews
   WHERE entity_type = NEW.entity_type
     AND entity_id   = NEW.entity_id;

  EXECUTE format(
    'UPDATE %I SET avg_rating = $1, review_count = $2 WHERE id = $3',
    tbl
  ) USING avg_r, cnt, NEW.entity_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reviews_sync_rating'
  ) THEN
    CREATE TRIGGER trg_reviews_sync_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION sync_entity_rating();
  END IF;
END $$;
