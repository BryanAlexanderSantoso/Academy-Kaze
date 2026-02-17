-- Optimasi RLS Support Chat agar Admin bisa membaca pesan Member
-- Masalah: Admin yang login via PIN tidak memiliki auth.uid() yang valid di profil, 
-- sehingga policy SELECT lama gagal 'matching 0 rows'.

DO $$
BEGIN
    ----------------------------------------------------------------
    -- 1. Optimasi Tabel & Realtime (Optional check)
    ----------------------------------------------------------------
    -- Pastikan tabel sudah ada (redundant but safe)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_messages') THEN
        
        -- Aktifkan Realtime jika belum
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
        EXCEPTION WHEN OTHERS THEN
            -- table might already be in publication
        END;

        ----------------------------------------------------------------
        -- 2. RESET & FIX RLS for 'support_messages'
        ----------------------------------------------------------------
        -- Drop POLICIES lama yang mungkin bermasalah dengan rekursi atau admin auth
        DROP POLICY IF EXISTS "Admins can view all messages" ON public.support_messages;
        DROP POLICY IF EXISTS "Admins can send messages" ON public.support_messages;
        DROP POLICY IF EXISTS "Admins can update messages" ON public.support_messages;
        
        -- Ganti dengan POLICY yang menggunakan helper is_admin() (SECURITY DEFINER)
        -- is_admin() sudah dibuat di migrasi sebelumnya dan aman dari RLS recursion.

        -- SELECT: Memungkinkan Admin melihat SEMUA pesan support
        CREATE POLICY "Admins can view all messages"
            ON public.support_messages
            FOR SELECT
            USING ( public.is_admin() );

        -- INSERT: Memungkinkan Admin mengirim pesan balasan
        CREATE POLICY "Admins can send messages"
            ON public.support_messages
            FOR INSERT
            WITH CHECK ( public.is_admin() AND sender_role = 'admin' );

        -- UPDATE: Memungkinkan Admin menandai pesan sebagai 'read'
        CREATE POLICY "Admins can update messages"
            ON public.support_messages
            FOR UPDATE
            USING ( public.is_admin() );

        -- DELETE: Memungkinkan Admin menghapus chat jika perlu
        CREATE POLICY "Admins can delete messages"
            ON public.support_messages
            FOR DELETE
            USING ( public.is_admin() );

        RAISE NOTICE 'Support chat policies have been optimized for Admin access.';
    ELSE
        RAISE NOTICE 'support_messages table does not exist. Please run create_support_chat.sql first.';
    END IF;
END $$;
