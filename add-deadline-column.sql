-- UPDATE: Tambah deadline column ke assignments table
-- Jalankan di Supabase SQL Editor

ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
