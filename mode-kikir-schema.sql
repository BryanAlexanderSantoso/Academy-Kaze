-- Mode Kikir (Premium Access) Implementation
-- Run this in Supabase SQL Editor

-- 1. Update profiles table to track premium status
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- 2. Create payments table for verification
CREATE TABLE IF NOT EXISTS premium_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL, -- Name on the form
    payment_method TEXT NOT NULL, -- e.g., QRIS, Bank Transfer
    transaction_id TEXT, -- Uniqueness/Ref
    amount DECIMAL(10,2) NOT NULL DEFAULT 50000,
    proof_url TEXT NOT NULL, -- Screenshot URL
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_premium_payments_user_id ON premium_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_payments_status ON premium_payments(status);

-- 3. Row Level Security for payments
ALTER TABLE premium_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON premium_payments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can submit payments" ON premium_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can see and manage all payments
CREATE POLICY "Admin can manage all payments" ON premium_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 4. Trigger to auto-unlock premium on approval
CREATE OR REPLACE FUNCTION handle_payment_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE profiles 
        SET is_premium = true 
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_approved
    AFTER UPDATE ON premium_payments
    FOR EACH ROW
    WHEN (NEW.status = 'approved')
    EXECUTE FUNCTION handle_payment_approval();

-- 5. Create storage bucket for payment proofs
-- Run this in Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('payment-proofs', 'payment-proofs', true)
-- ON CONFLICT (id) DO NOTHING;
