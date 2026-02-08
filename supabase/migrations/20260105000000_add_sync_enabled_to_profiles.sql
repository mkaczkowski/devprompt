-- ============================================================
-- ADD SYNC_ENABLED TO PROFILES TABLE
-- ============================================================
-- Adds a boolean flag to control whether cloud sync is enabled
-- for the user's prompt library.

ALTER TABLE profiles
ADD COLUMN sync_enabled BOOLEAN DEFAULT false NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.sync_enabled IS 'Whether cloud sync is enabled for this user prompt library';
