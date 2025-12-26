-- ============================================
-- COMPLETE SUPABASE STORAGE FIX
-- Run this entire script in SQL Editor
-- ============================================

-- Step 1: Make the bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'shared-sounds';

-- Step 2: Remove all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read" ON storage.objects;

-- Step 3: Create new policies with public access
-- Allow anyone to upload files
CREATE POLICY "Public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'shared-sounds');

-- Allow anyone to read files
CREATE POLICY "Public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'shared-sounds');

-- Step 4: Verify the setup
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets 
WHERE id = 'shared-sounds';

-- You should see: public = true

-- Step 5: Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- You should see the two policies we just created
