-- Final Fix for Admin Permissions (Profiles & Premium Payments)
-- Using correct delimiters to avoid syntax errors

-- 1. Create Helper Function to avoid RLS Recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $func$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$func$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. RESET & FIX RLS for 'premium_payments' & 'profiles'
DO $do$
BEGIN
    ----------------------------------------------------------------
    -- PREMIUM PAYMENTS
    ----------------------------------------------------------------
    -- Ensure table exists
    CREATE TABLE IF NOT EXISTS public.premium_payments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        full_name TEXT,
        payment_method TEXT NOT NULL,
        transaction_id TEXT,
        amount NUMERIC NOT NULL,
        proof_url TEXT,
        status TEXT DEFAULT 'pending',
        admin_feedback TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    ALTER TABLE public.premium_payments ENABLE ROW LEVEL SECURITY;

    -- Drop ALL existing policies
    DROP POLICY IF EXISTS "Users can insert their own payments" ON public.premium_payments;
    DROP POLICY IF EXISTS "Users can view their own payments" ON public.premium_payments;
    DROP POLICY IF EXISTS "Admins can view all payments" ON public.premium_payments;
    DROP POLICY IF EXISTS "Admins can update payments" ON public.premium_payments;
    DROP POLICY IF EXISTS "Admins can delete payments" ON public.premium_payments;
    
    -- RE-CREATE POLICIES using is_admin()

    -- INSERT: User only
    CREATE POLICY "Users can insert their own payments"
        ON public.premium_payments FOR INSERT
        WITH CHECK ( auth.uid() = user_id );

    -- SELECT: User (own) OR Admin (all)
    CREATE POLICY "Users can view their own payments"
        ON public.premium_payments FOR SELECT
        USING ( auth.uid() = user_id );

    CREATE POLICY "Admins can view all payments"
        ON public.premium_payments FOR SELECT
        USING ( public.is_admin() );

    -- UPDATE: Admin only
    CREATE POLICY "Admins can update payments"
        ON public.premium_payments FOR UPDATE
        USING ( public.is_admin() );

    -- DELETE: Admin only
    CREATE POLICY "Admins can delete payments"
        ON public.premium_payments FOR DELETE
        USING ( public.is_admin() );


    ----------------------------------------------------------------
    -- PROFILES
    ----------------------------------------------------------------
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Drop ALL existing policies
    DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    
    -- RE-CREATE POLICIES using is_admin()

    -- SELECT: Everyone can read their own
    CREATE POLICY "Users can read own profile"
        ON public.profiles FOR SELECT
        USING ( auth.uid() = id );
        
    -- SELECT: Admins can read ALL
    CREATE POLICY "Admins can read all profiles"
        ON public.profiles FOR SELECT
        USING ( public.is_admin() );

    -- UPDATE: User can update own
    CREATE POLICY "Users can update own profile"
        ON public.profiles FOR UPDATE
        USING ( auth.uid() = id );
        
    -- UPDATE: Admin can update ANY (CRITICAL for setting is_premium)
    CREATE POLICY "Admins can update any profile"
        ON public.profiles FOR UPDATE
        USING ( public.is_admin() );

END $do$;
