-- ============================================================
-- PROFILES TABLE (linked to Clerk user_id)
-- ============================================================

-- Create the table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,              -- Clerk user_id (from auth.uid())
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- Using auth.jwt()->>'sub' for Clerk compatibility (string IDs)
-- ============================================================

-- Users can view their own profile
-- NOTE: Using auth.jwt()->>'sub' instead of auth.uid() because
-- Clerk user IDs are strings (e.g., user_xxx), not UUIDs
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (id = (select auth.jwt()->>'sub'));

-- Users can insert their own profile (first login)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.jwt()->>'sub'));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = (select auth.jwt()->>'sub'))
  WITH CHECK (id = (select auth.jwt()->>'sub'));

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE TO authenticated
  USING (id = (select auth.jwt()->>'sub'));

-- ============================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================================

-- Function to update updated_at (with secure search_path)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
