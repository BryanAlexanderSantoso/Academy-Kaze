-- FIX untuk Error: "new row violates row-level security policy"
-- Jalankan SQL ini di Supabase SQL Editor

-- Tambahkan INSERT policy untuk profiles table
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
