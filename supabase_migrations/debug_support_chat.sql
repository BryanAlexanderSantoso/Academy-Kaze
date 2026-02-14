-- =====================================================
-- STEP BY STEP CHECK - Live Chat Support
-- Run each section one by one in Supabase SQL Editor
-- =====================================================

-- ==========================================
-- STEP 1: Check if table exists
-- ==========================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'support_messages';

-- Expected: 1 row with tablename = 'support_messages', rls_enabled = true
-- If NO ROWS: Table belum dibuat, run create_support_chat.sql dulu!


-- ==========================================
-- STEP 2: Count all messages (bypass RLS)
-- ==========================================
-- This uses admin privileges to count all messages
SELECT COUNT(*) as total_messages 
FROM public.support_messages;

-- Expected: Should show number of messages
-- If 0: Belum ada pesan yang terkirim


-- ==========================================
-- STEP 3: View all messages (bypass RLS)
-- ==========================================
SELECT 
    id,
    user_id,
    sender_role,
    message,
    is_read,
    created_at
FROM public.support_messages
ORDER BY created_at DESC
LIMIT 20;

-- Expected: Should show all messages
-- If EMPTY: No messages in database yet


-- ==========================================
-- STEP 4: Check RLS Policies
-- ==========================================
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'support_messages'
ORDER BY policyname;

-- Expected: Should show 5 policies
-- 1. Admins can send messages
-- 2. Admins can update messages
-- 3. Admins can view all messages
-- 4. Members can send messages
-- 5. Members can view own messages


-- ==========================================
-- STEP 5: Test Insert (as current user)
-- ==========================================
-- WARNING: This will create a test message
-- Replace 'YOUR_USER_ID' with actual user ID

-- Get your user ID first:
SELECT auth.uid() as my_user_id;

-- Then try to insert (replace the UUID):
-- INSERT INTO public.support_messages (user_id, sender_role, message)
-- VALUES ('YOUR_USER_ID', 'member', 'Test message from SQL')
-- RETURNING *;


-- ==========================================
-- STEP 6: If all else fails - Temporary fix
-- ==========================================
-- ONLY USE FOR TESTING! NOT FOR PRODUCTION!

-- Disable RLS temporarily:
-- ALTER TABLE public.support_messages DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable:
-- ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
