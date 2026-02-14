-- Simplify RLS Policies to avoid Function/Recursion Issues

DO $$
BEGIN
    -- 1. Ensure Profiles are readable by owners (Basic Requirement)
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
    CREATE POLICY "Users can read own profile"
        ON public.profiles FOR SELECT
        USING ( auth.uid() = id );

    -- 2. Update Premium Payments Policy to use Direct Subquery
    -- This avoids the 'is_admin()' function potentially failing or being recursive.
    -- We simply check: "Does the current user have 'admin' role in their profile?"
    -- Since we enabled "Users can read own profile", this subquery is safe and allowed.
    
    ALTER TABLE public.premium_payments ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admins can update payments" ON public.premium_payments;
    DROP POLICY IF EXISTS "Admins can view all payments" ON public.premium_payments;
    
    -- UPDATE Policy
    CREATE POLICY "Admins can update payments"
        ON public.premium_payments
        FOR UPDATE
        USING (
            (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
        );

    -- SELECT Policy
    CREATE POLICY "Admins can view all payments"
        ON public.premium_payments
        FOR SELECT
        USING (
            (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
        );

    -- 3. Also fix Profiles UPDATE policy just in case
    DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    CREATE POLICY "Admins can update any profile"
        ON public.profiles
        FOR UPDATE
        USING (
            (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
        );

    RAISE NOTICE 'Simplified RLS policies to use direct subqueries.';
END $$;
