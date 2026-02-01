-- FIX: Course Chapters Table Columns & Storage
-- Run this in Supabase SQL Editor if you have issues with Course Chapters

-- 1. Ensure columns match the application code
ALTER TABLE course_chapters 
ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- 2. (Optional) Rename columns if they were created with wrong names
-- DO NOT RUN unless you are sure you need to rename:
-- ALTER TABLE course_chapters RENAME COLUMN content_type TO material_type;
-- ALTER TABLE course_chapters RENAME COLUMN content_value TO file_url;

-- 3. Ensure Storage RLS is correctly set for 'course-materials' bucket
-- Drop existing policies if they exist to avoid "already exists" errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Manage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Allow public select (anyone can download if they have the link)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-materials');

-- Allow authenticated users to upload/manage (admins mostly)
CREATE POLICY "Authenticated Manage" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'course-materials');
