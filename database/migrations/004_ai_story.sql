CREATE TABLE IF NOT EXISTS ai_story_history (
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

CREATE INDEX IF NOT EXISTS idx_ai_story_history_user ON ai_story_history(user_id);
