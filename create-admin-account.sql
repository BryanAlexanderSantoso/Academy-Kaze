-- ALTERNATIVE FIX: Create Admin Account in Supabase Auth
-- This is more secure than bypass policies
-- Run this AFTER running fix-admin-rls-policies.sql

-- Step 1: Create admin user in auth.users (manual via Supabase Dashboard)
-- OR run this if you have service role access:

-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   recovery_sent_at,
--   last_sign_in_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   created_at,
--   updated_at,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'admin@kazedev.com',
--   crypt('159159', gen_salt('bf')), -- hashed password
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"provider":"email","providers":["email"]}',
--   '{"full_name":"Administrator"}',
--   NOW(),
--   NOW(),
--   '',
--   '',
--   '',
--   ''
-- );

-- Step 2: Create admin profile
-- Note: Replace 'YOUR-ADMIN-UUID' with actual UUID from Step 1

-- INSERT INTO profiles (id, email, full_name, role, progress_percentage)
-- VALUES (
--   'YOUR-ADMIN-UUID',  -- Use UUID from auth.users
--   'admin@kazedev.com',
--   'Administrator',
--   'admin',
--   0
-- );

-- Step 3: Then you can remove the bypass policies and use proper RLS:

-- DROP POLICY "Allow insert for admin bypass" ON courses;
-- DROP POLICY "Allow insert for assignments bypass" ON assignments;
-- DROP POLICY "Allow insert for questionnaires bypass" ON questionnaires;
-- DROP POLICY "Allow insert for chapters bypass" ON course_chapters;

-- The existing "Admin can manage X" policies will work because auth.uid() will be valid!

-- EASIER METHOD: Just create admin via Supabase Dashboard
-- 1. Go to Authentication > Users > Add User
-- 2. Email: admin@kazedev.com
-- 3. Password: 159159
-- 4. Confirm email automatically
-- 5. Then manually insert into profiles table via SQL:

/*
INSERT INTO profiles (id, email, full_name, role, progress_percentage)
SELECT 
  id,
  'admin@kazedev.com',
  'Administrator',
  'admin',
  0
FROM auth.users
WHERE email = 'admin@kazedev.com';
*/

-- Then update AdminLogin.tsx to use Supabase auth instead of localStorage
