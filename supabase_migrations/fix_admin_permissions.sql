-- Fix Admin Permissions and Avoid RLS Recursion

DO $$
BEGIN
    ----------------------------------------------------------------
    -- 1. Create Helper Function to avoid RLS Recursion
    ----------------------------------------------------------------
    -- This function runs with "SECURITY DEFINER" to bypass RLS when checking the role.
    -- This prevents infinite loops when policies query the same table they protect.
    
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN AS $func$
    BEGIN
        RETURN EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        );
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Grant execute to authenticated users
    GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


    ----------------------------------------------------------------
    -- 2. Fix Profiles RLS (Critical for updating 'is_premium')
    ----------------------------------------------------------------
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Clear old policies
    DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
    -- Drop recursive ones if they exist
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    
    -- READ:
    -- User can read own
    CREATE POLICY "Users can read own profile"
        ON public.profiles FOR SELECT
        USING ( auth.uid() = id );
        
    -- Admin can read all (using function to avoid recursion)
    CREATE POLICY "Admins can read all profiles"
        ON public.profiles FOR SELECT
        USING ( public.is_admin() );

    -- UPDATE:
    -- User can update own (optional, but good practice)
    CREATE POLICY "Users can update own profile"
        ON public.profiles FOR UPDATE
        USING ( auth.uid() = id );
        
    -- Admin can update ANY profile (Required for 'ACC' button)
    CREATE POLICY "Admins can update any profile"
        ON public.profiles FOR UPDATE
        USING ( public.is_admin() );


    ----------------------------------------------------------------
    -- 3. Fix Premium Payments RLS (Using new function for consistency)
    ----------------------------------------------------------------
    
    -- Ensure table exists first (just in case)
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'premium_payments') THEN
        RAISE NOTICE 'Table premium_payments does not exist, skipping policy update for it (run fix_premium_payments.sql first if needed)';
    ELSE
        ALTER TABLE public.premium_payments ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admins can view all payments" ON public.premium_payments;
        DROP POLICY IF EXISTS "Admins can update payments" ON public.premium_payments;
        DROP POLICY IF EXISTS "Admins can delete payments" ON public.premium_payments;
        
        -- SELECT (Admin)
        CREATE POLICY "Admins can view all payments"
            ON public.premium_payments FOR SELECT
            USING ( public.is_admin() );
            
        -- UPDATE (Admin)
        CREATE POLICY "Admins can update payments"
            ON public.premium_payments FOR UPDATE
            USING ( public.is_admin() );
            
        -- DELETE (Admin)
        CREATE POLICY "Admins can delete payments"
            ON public.premium_payments FOR DELETE
            USING ( public.is_admin() );
            
        -- (User policies are fine, they use auth.uid() = user_id)
    END IF;

    RAISE NOTICE 'Fixed Admin permissions utilizing is_admin() function';
END $$;
