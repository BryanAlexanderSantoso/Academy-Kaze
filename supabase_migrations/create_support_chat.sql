-- Create support_messages table for live chat
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_messages') THEN
        CREATE TABLE public.support_messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            sender_role TEXT NOT NULL CHECK (sender_role IN ('member', 'admin')),
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Create indexes for efficient queries
        CREATE INDEX idx_support_messages_user_id ON public.support_messages(user_id);
        CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at DESC);
        CREATE INDEX idx_support_messages_is_read ON public.support_messages(is_read);

        -- Enable RLS
        ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

        -- Policy: Members can only see their own messages
        CREATE POLICY "Members can view own messages"
            ON public.support_messages
            FOR SELECT
            USING (
                auth.uid() = user_id
            );

        -- Policy: Members can insert their own messages
        CREATE POLICY "Members can send messages"
            ON public.support_messages
            FOR INSERT
            WITH CHECK (
                auth.uid() = user_id AND sender_role = 'member'
            );

        -- Policy: Admins can see all messages
        CREATE POLICY "Admins can view all messages"
            ON public.support_messages
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );

        -- Policy: Admins can insert messages
        CREATE POLICY "Admins can send messages"
            ON public.support_messages
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                ) AND sender_role = 'admin'
            );

        -- Policy: Admins can update messages (mark as read)
        CREATE POLICY "Admins can update messages"
            ON public.support_messages
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );

        RAISE NOTICE 'support_messages table created successfully';
    ELSE
        RAISE NOTICE 'support_messages table already exists';
    END IF;
END $$;
