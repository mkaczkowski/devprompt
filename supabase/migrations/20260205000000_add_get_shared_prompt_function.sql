-- ============================================================
-- SHARE FUNCTIONALITY: Add share_token column and RPC function
-- ============================================================
-- Enables public sharing of prompts via unique tokens.
-- Shared prompts are accessible to anyone with the token (including anonymous users).

-- Add share-related columns to prompts table
ALTER TABLE prompts
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ;

-- Index for efficient share token lookups (public access)
CREATE INDEX IF NOT EXISTS idx_prompts_share_token ON prompts(share_token) WHERE share_token IS NOT NULL;

-- ============================================================
-- RPC FUNCTION: get_shared_prompt_by_token
-- ============================================================
-- Returns shared prompt data with author info for public viewing.
-- Accessible by both anonymous and authenticated users.

CREATE OR REPLACE FUNCTION get_shared_prompt_by_token(p_share_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'title', p.title,
    'description', p.description,
    'data', p.data,
    'share_token', p.share_token,
    'shared_at', p.shared_at,
    'user_id', p.user_id,
    'author', json_build_object(
      'id', pr.id,
      'full_name', pr.full_name,
      'avatar_url', pr.avatar_url
    )
  ) INTO result
  FROM prompts p
  JOIN profiles pr ON p.user_id = pr.id
  WHERE p.share_token = p_share_token
    AND p.share_token IS NOT NULL;

  RETURN result;
END;
$$;

-- Grant execute permissions to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_shared_prompt_by_token(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_shared_prompt_by_token(TEXT) TO anon;

-- ============================================================
-- RLS POLICY UPDATE: Allow users to update share columns
-- ============================================================
-- Existing policies already allow users to update their own prompts.
-- No additional policies needed for share_token and shared_at columns.
