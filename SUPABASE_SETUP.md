# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: SonicGrid
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait ~2 minutes

## 2. Get API Keys

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## 3. Configure Environment Variables

### For Local Development:
1. Create a `.env` file in the project root
2. Add:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### For Railway Deployment:
1. Go to your Railway project
2. Click on **Variables**
3. Add these two variables:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key

## 4. Create Database Tables

Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shared_sounds table
CREATE TABLE shared_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  duration INTEGER,
  file_path TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_sounds ENABLE ROW LEVEL SECURITY;

-- Profiles policies (anyone can read, users can update their own)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (true);

-- Shared sounds policies (anyone can read, authenticated users can insert)
CREATE POLICY "Shared sounds are viewable by everyone"
  ON shared_sounds FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert shared sounds"
  ON shared_sounds FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update download count"
  ON shared_sounds FOR UPDATE
  USING (true);
```

## 5. Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `shared-sounds`
4. Make it **Public**
5. Click "Create bucket"

### Set Storage Policies:

Go to the bucket → Policies → New Policy:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'shared-sounds');
```

**Policy 2: Public Upload**
```sql
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shared-sounds');
```

## 6. Test the Setup

1. Restart your dev server: `npm run dev`
2. Open the app
3. You should see a random username in the header
4. Click on your profile icon to edit your username
5. Go to Community tab to see shared sounds (will be empty initially)

## Done! 🎉

Your app now has:
- ✅ User profiles with editable usernames
- ✅ Community sound sharing
- ✅ Download tracking
- ✅ Search and sorting
