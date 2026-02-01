-- FIX RLS Policies - Allow Admin to Manage All Tables
-- Jalankan di Supabase SQL Editor

-- 1. Fix COURSES table - Allow admin to INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "Admin can manage courses" ON courses;
CREATE POLICY "Admin can manage courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 2. Fix ASSIGNMENTS table - Allow admin full access
DROP POLICY IF EXISTS "Admin can manage assignments" ON assignments;
CREATE POLICY "Admin can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 3. Fix QUESTIONNAIRES table - Allow admin full access
DROP POLICY IF EXISTS "Admin can manage questionnaires" ON questionnaires;
CREATE POLICY "Admin can manage questionnaires" ON questionnaires
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. IMPORTANT: Admin login creates auth.uid() = NULL issue
-- We need to check if admin is logged in via localStorage instead
-- Since admin doesn't use Supabase Auth, we need to allow operations
-- when there's no auth.uid() but it's an admin session

-- Alternative: Create service role policy (temporary for admin)
-- This allows INSERT when there's no auth.uid() (admin login case)

-- For COURSES
CREATE POLICY "Allow insert for admin bypass" ON courses
  FOR INSERT WITH CHECK (true);

-- For ASSIGNMENTS  
CREATE POLICY "Allow insert for assignments bypass" ON assignments
  FOR INSERT WITH CHECK (true);

-- For QUESTIONNAIRES
CREATE POLICY "Allow insert for questionnaires bypass" ON questionnaires
  FOR INSERT WITH CHECK (true);

-- For COURSE_CHAPTERS (if table exists)
CREATE POLICY "Allow insert for chapters bypass" ON course_chapters
  FOR INSERT WITH CHECK (true);

-- NOTE: Ini temporary solution karena admin login tidak pakai Supabase Auth
-- Untuk production, sebaiknya admin juga pakai Supabase Auth
-- ATAU disable RLS untuk admin operations dengan service role key
