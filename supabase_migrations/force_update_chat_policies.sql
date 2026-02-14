-- FILE: force_update_chat_policies.sql
-- Run ini di Supabase SQL Editor untuk memperbaiki permission Admin

-- 1. Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to be safe (Clean slate)
DROP POLICY IF EXISTS "Members can view own messages" ON public.support_messages;
DROP POLICY IF EXISTS "Members can send messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can send messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.support_messages;

-- 3. Re-create Policies (FIXED)

-- Member: View own messages
CREATE POLICY "Members can view own messages"
    ON public.support_messages
    FOR SELECT
    USING (auth.uid() = user_id);

-- Member: Send messages
CREATE POLICY "Members can send messages"
    ON public.support_messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id AND sender_role = 'member');

-- Admin: View ALL messages (Fixed logic)
CREATE POLICY "Admins can view all messages"
    ON public.support_messages
    FOR SELECT
    USING (
         (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Admin: Send messages
CREATE POLICY "Admins can send messages"
    ON public.support_messages
    FOR INSERT
    WITH CHECK (
         (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Admin: Update messages (Mark as read)
CREATE POLICY "Admins can update messages"
    ON public.support_messages
    FOR UPDATE
    USING (
         (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 4. Check results
SELECT * FROM pg_policies WHERE tablename = 'support_messages';
