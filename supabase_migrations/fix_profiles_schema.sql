-- Fix Profiles Schema: Add missing premium columns

DO $$
BEGIN
    -- 1. Add 'is_premium' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_premium'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_premium column to profiles';
    END IF;

    -- 2. Add 'premium_until' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'premium_until'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN premium_until TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added premium_until column to profiles';
    END IF;

    -- 3. Notify PostgREST to reload schema cache
    NOTIFY pgrst, 'reload config';

END $$;
