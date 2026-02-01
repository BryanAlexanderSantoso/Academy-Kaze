-- DEBUG: Check RLS Policies & Verify Setup
-- Run ini di Supabase SQL Editor untuk check status

-- 1. Check if policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('courses', 'assignments', 'questionnaires', 'course_chapters', 'profiles')
ORDER BY tablename, policyname;

-- 2. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('courses', 'assignments', 'questionnaires', 'course_chapters', 'profiles');

-- 3. Test INSERT directly (should work if policies are correct)
-- Uncomment to test:
/*
INSERT INTO courses (title, description, category, content_body, is_published)
VALUES (
  'Test Course',
  'Test Description',
  'fe',
  'Test content',
  false
);
*/

-- 4. Check current auth.uid() (will be NULL for admin)
SELECT auth.uid() as current_user_id;

-- 5. Check if there are any courses in DB
SELECT COUNT(*) as total_courses FROM courses;

-- 6. Check latest course (if any)
SELECT * FROM courses ORDER BY created_at DESC LIMIT 1;
