-- ============================================================
-- Friend Tracker — Supabase Database Schema
-- Supabase dashboard mein SQL Editor mein yeh run karo
-- ============================================================

-- 1. Users table (NextAuth se populate hogi)
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  name        TEXT,
  email       TEXT UNIQUE NOT NULL,
  image       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Locations table
CREATE TABLE IF NOT EXISTS locations (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  latitude    DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude   DOUBLE PRECISION NOT NULL DEFAULT 0,
  city        TEXT,
  is_sharing  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Friendships table (optional — sabko dikhao ya sirf friends ko)
CREATE TABLE IF NOT EXISTS friendships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | accepted
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 4. Enable Row Level Security
ALTER TABLE users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Users: anyone can read, only self can update
CREATE POLICY "Users are publicly readable"
  ON users FOR SELECT USING (true);

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE USING (auth.uid()::text = id);

-- Locations: anyone can read (is_sharing=true), only self can write
CREATE POLICY "Locations are publicly readable"
  ON locations FOR SELECT USING (is_sharing = true);

CREATE POLICY "Users can upsert own location"
  ON locations FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own location"
  ON locations FOR UPDATE USING (auth.uid()::text = user_id);

-- 6. Index for fast queries
CREATE INDEX IF NOT EXISTS idx_locations_updated_at ON locations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_locations_sharing    ON locations(is_sharing) WHERE is_sharing = true;

-- Done! Ab aapka database ready hai.
