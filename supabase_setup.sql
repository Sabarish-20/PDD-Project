-- Copy and paste this entirely into the Supabase SQL Editor and click "RUN"
-- (This version is safe to run multiple times without causing errors)

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  "userId" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  avatar TEXT,
  traits JSONB,
  phrases JSONB,
  "voiceId" TEXT,
  "voiceModelUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT,
  mood TEXT,
  preview TEXT,
  text TEXT,
  timestamp BIGINT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Memories Table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  content TEXT,
  emotion TEXT,
  date TEXT,
  timestamp BIGINT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Set up Row Level Security (RLS) to protect user data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid "already exists" errors if run multiple times
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own journals" ON journal_entries;
DROP POLICY IF EXISTS "Users can manage their own memories" ON memories;

-- Allow users to only see and edit their own data
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = "userId");

CREATE POLICY "Users can manage their own journals" ON journal_entries
  FOR ALL USING (auth.uid() = "userId");

CREATE POLICY "Users can manage their own memories" ON memories
  FOR ALL USING (auth.uid() = "userId");

-- 5. Create 'media' Storage Bucket safely
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies just in case
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.uid() = owner);
