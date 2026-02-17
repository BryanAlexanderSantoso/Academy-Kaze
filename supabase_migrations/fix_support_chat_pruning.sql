-- Live Chat Auto-Pruning System (24 Jam)
-- Fungsi ini akan menghapus semua pesan yang berumur lebih dari 24 jam secara permanen dari database.

DO $$
BEGIN
    ----------------------------------------------------------------
    -- 1. Create Cleanup Function
    ----------------------------------------------------------------
    CREATE OR REPLACE FUNCTION public.cleanup_expired_support_messages()
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER -- Berjalan dengan role admin bypass RLS
    AS $$
    BEGIN
        DELETE FROM public.support_messages
        WHERE created_at < NOW() - INTERVAL '24 hours';
        
        RAISE NOTICE 'Pruned messages older than 24 hours.';
    END;
    $$;

    ----------------------------------------------------------------
    -- 2. Schedule Options (Instruksi)
    ----------------------------------------------------------------
    -- Karena Supabase Free Tier tidak mengekspos pg_cron secara default,
    -- Saya menyarankan menjalankan perintah ini secara berkala di SQL Editor:
    -- SELECT public.cleanup_expired_support_messages();
    
    RAISE NOTICE 'Cleanup function created. Run SELECT public.cleanup_expired_support_messages(); to clean up DB.';
END $$;
