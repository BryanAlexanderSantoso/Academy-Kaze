-- FIX: Admin Cannot View Data (SELECT Issue)
-- Data masuk tapi tidak tampil di admin pages
-- Jalankan di Supabase SQL Editor

-- PROBLEM: Bypass policies hanya untuk INSERT, belum SELECT/UPDATE/DELETE
-- SOLUTION: Add bypass policies untuk ALL operations

-- 1. COURSES - Allow admin to SELECT, UPDATE, DELETE
DROP POLICY IF EXISTS "Allow select for admin bypass" ON courses;
CREATE POLICY "Allow select for admin bypass" ON courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update for admin bypass" ON courses;
CREATE POLICY "Allow update for admin bypass" ON courses
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete for admin bypass" ON courses;
CREATE POLICY "Allow delete for admin bypass" ON courses
  FOR DELETE USING (true);

-- 2. ASSIGNMENTS - Full access for admin
DROP POLICY IF EXISTS "Allow select for assignments bypass" ON assignments;
CREATE POLICY "Allow select for assignments bypass" ON assignments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update for assignments bypass" ON assignments;
CREATE POLICY "Allow update for assignments bypass" ON assignments
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete for assignments bypass" ON assignments;
CREATE POLICY "Allow delete for assignments bypass" ON assignments
  FOR DELETE USING (true);

-- 3. COURSE_CHAPTERS - Full access
DROP POLICY IF EXISTS "Allow select for chapters bypass" ON course_chapters;
CREATE POLICY "Allow select for chapters bypass" ON course_chapters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update for chapters bypass" ON course_chapters;
CREATE POLICY "Allow update for chapters bypass" ON course_chapters
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete for chapters bypass" ON course_chapters;
CREATE POLICY "Allow delete for chapters bypass" ON course_chapters
  FOR DELETE USING (true);

-- 4. QUESTIONNAIRES - Full access
DROP POLICY IF EXISTS "Allow select for questionnaires bypass" ON questionnaires;
CREATE POLICY "Allow select for questionnaires bypass" ON questionnaires
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update for questionnaires bypass" ON questionnaires;
CREATE POLICY "Allow update for questionnaires bypass" ON questionnaires
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete for questionnaires bypass" ON questionnaires;
CREATE POLICY "Allow delete for questionnaires bypass" ON questionnaires
  FOR DELETE USING (true);

-- 5. PROFILES - Allow admin to view all profiles
DROP POLICY IF EXISTS "Allow select for profiles bypass" ON profiles;
CREATE POLICY "Allow select for profiles bypass" ON profiles
  FOR SELECT USING (true);

-- NOTE: Ini temporary bypass karena admin tidak pakai Supabase Auth
-- Untuk production, admin harus pakai Supabase Auth juga
-- Setelah itu, policies bisa lebih strict dengan auth.uid() check

-- Verify policies created
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('courses', 'assignments', 'course_chapters', 'questionnaires', 'profiles')
  AND policyname LIKE '%bypass%'
ORDER BY tablename, cmd;
