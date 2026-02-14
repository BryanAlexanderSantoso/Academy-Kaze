-- CHECK YOUR CURRENT USER ROLE
-- Run this in Supabase SQL Editor

-- 1. List all admins
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE role = 'admin';

-- 2. Check if ANY message exist
SELECT count(*) FROM public.support_messages;

-- 3. If you need to make yourself admin, use this:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your_email@example.com';
