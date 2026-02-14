-- Enable Realtime for Profiles table to listen for bans

DO $$
BEGIN
    -- Check if the publication 'supabase_realtime' exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Add profiles table to the publication if it's not already there
        -- (This command is idempotent-ish, checking first is better but simple ALTER is usually fine in migrations if we catch errors, 
        --  but checking pg_publication_tables is safer)
        
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public' 
            AND tablename = 'profiles'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
            RAISE NOTICE 'Added profiles to supabase_realtime publication';
        ELSE
            RAISE NOTICE 'profiles table already in supabase_realtime';
        END IF;

        -- Also ensure replica identity is set to full so we get the full row on update (optional but helper)
        -- ALTER TABLE public.profiles REPLICA IDENTITY FULL;
        -- Default is usually Primary Key, which is enough for id check, but we need is_banned column.
        -- "DEFAULT records the old values of the columns of the primary key, if any."
        -- We receives the NEW row in payload.new, so DEFAULT is fine.
    
    END IF;
END $$;
