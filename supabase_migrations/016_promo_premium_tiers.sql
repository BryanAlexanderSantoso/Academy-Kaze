-- =====================================================
-- MIGRATION: Promo & Premium Tiers System
-- =====================================================

-- 1. Create promos table for admin to manage discount codes
CREATE TABLE IF NOT EXISTS promos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_usage INTEGER DEFAULT NULL, -- NULL = unlimited
    current_usage INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL = no expiry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add premium_type column to profiles
-- 'none' = free user, 'premium' = learning path only, 'premium_plus' = all access
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS premium_type VARCHAR(20) DEFAULT 'none' 
CHECK (premium_type IN ('none', 'premium', 'premium_plus'));

-- Migrate existing premium users to 'premium' type
UPDATE profiles SET premium_type = 'premium' WHERE is_premium = true AND premium_type = 'none';

-- 3. Add premium_type and promo_code to premium_payments
ALTER TABLE premium_payments 
ADD COLUMN IF NOT EXISTS premium_type VARCHAR(20) DEFAULT 'premium'
CHECK (premium_type IN ('premium', 'premium_plus'));

ALTER TABLE premium_payments 
ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50) DEFAULT NULL;

ALTER TABLE premium_payments 
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2) DEFAULT NULL;

ALTER TABLE premium_payments 
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;

-- 4. Disable RLS for promos table (admin-only management via PIN-based auth)
ALTER TABLE promos DISABLE ROW LEVEL SECURITY;

-- 5. Create index for promo code lookups
CREATE INDEX IF NOT EXISTS idx_promos_code ON promos(code);
CREATE INDEX IF NOT EXISTS idx_promos_active ON promos(is_active);


