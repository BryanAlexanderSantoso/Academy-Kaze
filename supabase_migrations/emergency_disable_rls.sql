-- EMERGENCY FIX: Disable RLS temporarily to allow "PIN Admin" to work
-- Since the Admin Login uses a hardcoded PIN and NOT a real Supabase Auth session,
-- we must disable RLS for the admin dashboard to be able to write to these tables.

-- 1. Disable RLS on Premium Payments
ALTER TABLE public.premium_payments DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on Profiles (so admin can set is_premium)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Notify
RAISE NOTICE 'RLS has been DISABLED for premium_payments and profiles to allow PIN-based Admin Login to function.';
