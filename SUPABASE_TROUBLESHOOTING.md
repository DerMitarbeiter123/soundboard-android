# Supabase Storage Troubleshooting

If you're getting "Forbidden use of secret API key in browser" error when sharing sounds, follow these steps:

## Step 1: Verify Bucket is Public

1. Go to **Storage** in Supabase dashboard
2. Click on the `shared-sounds` bucket
3. Look at the top - you should see a **"Public"** badge
4. If it says **"Private"**, click the **settings icon** (⚙️) next to the bucket name
5. Toggle **"Public bucket"** to **ON**
6. Click **Save**

## Step 2: Delete Old Policies (if any exist)

1. In the `shared-sounds` bucket, click **Policies** tab
2. **Delete ALL existing policies** for this bucket
3. Confirm deletion

## Step 3: Create New Policies via SQL

Go to **SQL Editor** → **New Query** and run this:

```sql
-- First, make absolutely sure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'shared-sounds';

-- Delete any existing policies to start fresh
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;

-- Create new policies with explicit public access
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'shared-sounds');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'shared-sounds');
```

## Step 4: Verify Your Environment Variables

Make sure your Railway deployment has the correct keys:

1. Go to Railway → Your Project → Variables
2. Verify you have:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJ...` (should start with eyJ)
3. **IMPORTANT**: Make sure you're using the **anon public** key, NOT the service_role key!

## Step 5: Check the Key Type

**IMPORTANT: Supabase has new API keys!**

1. In Supabase, go to **Settings** → **API**
2. You should see the **new API key system**:
   - ✅ **Publishable key** (starts with `sb_publishable_...`) - Use this one!
   - ❌ **Secret key** - DO NOT use this in the browser
3. Copy the **Publishable key** (the one that starts with `sb_publishable_`)
4. Update your Railway environment variable `VITE_SUPABASE_ANON_KEY` with this key
5. Redeploy your app

**Note**: If you see "Legacy anon, service_role API keys", you can still use those, but the new publishable keys are recommended.

## Step 6: Test

1. Wait for Railway to redeploy (~2 minutes)
2. Refresh your app
3. Try sharing a sound again

## Still Not Working?

If you still get the error, check the browser console (F12) for the exact error message and send it to me. The error might give us more clues about what's wrong.

## Common Issues:

- **Using service_role key instead of anon key** - This is the #1 cause
- **Bucket is private** - Must be public for anonymous uploads
- **Old policies interfering** - Delete all and recreate
- **Environment variables not updated** - Redeploy after changing
