-- Fix premium_payments table, RLS policies, and Storage Bucket

DO $$
DECLARE
    bucket_exists boolean;
BEGIN
    ----------------------------------------------------------------
    -- 1. DATABASE TABLE & FOREIGN KEYS
    ----------------------------------------------------------------
    
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'premium_payments') THEN
        CREATE TABLE public.premium_payments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            full_name TEXT,
            payment_method TEXT NOT NULL,
            transaction_id TEXT,
            amount NUMERIC NOT NULL,
            proof_url TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            admin_feedback TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        CREATE INDEX idx_premium_payments_user_id ON public.premium_payments(user_id);
        CREATE INDEX idx_premium_payments_status ON public.premium_payments(status);
        CREATE INDEX idx_premium_payments_created_at ON public.premium_payments(created_at DESC);
        
        RAISE NOTICE 'Created premium_payments table';
    ELSE
        -- If table exists, check if we need to add FK to profiles for the JOIN to work
        -- We check if there is a constraint referencing profiles
        -- This is CRITICAL for the Admin Dashboard to work correctly with the join query
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints tc 
            JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name 
            WHERE tc.table_name = 'premium_payments' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND ccu.table_name = 'profiles'
        ) THEN
            -- Add FK to profiles
            -- We assume user_id is the column. If it already references auth.users, adding this is fine for PostgREST join detection.
            -- Note: If user_id references auth.users and we add another FK to profiles, it must match.
            -- Since profiles.id = auth.users.id, it matches.
            -- But we must be careful not to duplicate if it already exists under a different name.
            
            ALTER TABLE public.premium_payments
            ADD CONSTRAINT premium_payments_user_id_fkey_profiles
            FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
            
            RAISE NOTICE 'Added foreign key to profiles';
        END IF;
    END IF;

    ----------------------------------------------------------------
    -- 2. ROW LEVEL SECURITY (RLS)
    ----------------------------------------------------------------

    -- Enable RLS
    ALTER TABLE public.premium_payments ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies to be safe and avoid conflicts
    DROP POLICY IF EXISTS "Users can insert their own payments" ON public.premium_payments;
    DROP POLICY IF EXISTS "Users can view their own payments" ON public.premium_payments;
    DROP POLICY IF EXISTS "Admins can view all payments" ON public.premium_payments;
    DROP POLICY IF EXISTS "Admins can update payments" ON public.premium_payments;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.premium_payments;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.premium_payments;

    -- Create policies

    -- INSERT: Authenticated users can insert their own payments
    CREATE POLICY "Users can insert their own payments"
        ON public.premium_payments
        FOR INSERT
        WITH CHECK (
            auth.uid() = user_id
        );

    -- SELECT: Users can see their own
    CREATE POLICY "Users can view their own payments"
        ON public.premium_payments
        FOR SELECT
        USING (
            auth.uid() = user_id
        );

    -- SELECT: Admins can see all
    -- This relies on the user having role = 'admin' in profiles table
    CREATE POLICY "Admins can view all payments"
        ON public.premium_payments
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        );

    -- UPDATE: Admins can update status
    CREATE POLICY "Admins can update payments"
        ON public.premium_payments
        FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        );

    ----------------------------------------------------------------
    -- 3. STORAGE BUCKET (payment-proofs)
    ----------------------------------------------------------------
    
    -- Check if bucket exists
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'payment-proofs'
    ) INTO bucket_exists;

    IF NOT bucket_exists THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('payment-proofs', 'payment-proofs', true);
        RAISE NOTICE 'Created payment-proofs bucket';
        
        -- Add policies for storage
        CREATE POLICY "Public Access Payment Proofs"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'payment-proofs' );

        CREATE POLICY "Authenticated Upload Payment Proofs"
        ON storage.objects FOR INSERT
        WITH CHECK ( bucket_id = 'payment-proofs' AND auth.role() = 'authenticated' );
    END IF;

    RAISE NOTICE 'Fixed RLS policies and Storage for premium_payments';
END $$;
