-- ============================================================
-- PROMPTS TABLE (user's synced prompts)
-- ============================================================
-- Stores prompt data for users who have enabled cloud sync.
-- Uses JSONB for flexible storage of sections array.

CREATE TABLE IF NOT EXISTS prompts (
  -- Primary key: composite of user_id and prompt_id
  id TEXT NOT NULL,                    -- Client-generated UUID (crypto.randomUUID())
  user_id TEXT NOT NULL,               -- Clerk user_id (from auth.jwt()->>'sub')

  -- Metadata (mirrors PromptMetadata interface)
  title TEXT NOT NULL DEFAULT 'Untitled',
  description TEXT,
  section_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,

  -- Full prompt data (JSONB for sections array)
  -- Stores: { title?: string, sections: Section[], tokenCount?: number }
  data JSONB NOT NULL DEFAULT '{"sections": []}',

  -- Server timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Client timestamps (preserved from localStorage for ordering)
  client_created_at BIGINT NOT NULL,   -- JS Date.now() timestamp
  client_updated_at BIGINT NOT NULL,   -- JS Date.now() timestamp

  -- Constraints
  PRIMARY KEY (user_id, id),
  CONSTRAINT fk_prompts_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Index for efficient user queries
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_user_updated ON prompts(user_id, client_updated_at DESC);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (Clerk JWT compatibility)
-- Using auth.jwt()->>'sub' for Clerk compatibility (string IDs)
-- ============================================================

-- Users can view their own prompts
CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT TO authenticated
  USING (user_id = (select auth.jwt()->>'sub'));

-- Users can insert their own prompts
CREATE POLICY "Users can insert own prompts"
  ON prompts FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.jwt()->>'sub'));

-- Users can update their own prompts
CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE TO authenticated
  USING (user_id = (select auth.jwt()->>'sub'))
  WITH CHECK (user_id = (select auth.jwt()->>'sub'));

-- Users can delete their own prompts
CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE TO authenticated
  USING (user_id = (select auth.jwt()->>'sub'));

-- ============================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================================

-- Use existing update_updated_at function from profiles migration
CREATE TRIGGER prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
