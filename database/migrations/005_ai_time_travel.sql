CREATE TABLE IF NOT EXISTS ai_time_travel_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  attraction_name TEXT,
  location TEXT,
  construction_year TEXT,
  target_era TEXT,
  historical_periods JSONB DEFAULT '[]',
  timeline_events JSONB DEFAULT '[]',
  comparison JSONB DEFAULT '{}',
  image_generation_prompt TEXT,
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_travel_user ON ai_time_travel_history(user_id);
