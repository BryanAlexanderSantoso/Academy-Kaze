-- Add is_banned column to profiles table if it doesn't exist
-- This column allows admins to ban/unban users

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_banned'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN is_banned BOOLEAN DEFAULT FALSE NOT NULL;
        
        COMMENT ON COLUMN profiles.is_banned IS 'Whether the user is banned from accessing the platform';
    END IF;
END $$;

-- Create index for faster queries on banned status
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned 
ON profiles(is_banned) 
WHERE is_banned = true;
