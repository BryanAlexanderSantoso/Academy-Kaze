-- EMERGENCY FIX: Disable RLS explicitly
-- Running these commands will disable RLS, allowing the PIN-based admin login to work.

ALTER TABLE public.premium_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
