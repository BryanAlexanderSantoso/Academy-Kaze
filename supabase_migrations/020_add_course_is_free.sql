-- Add is_free column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

COMMENT ON COLUMN courses.is_free IS 'If true, all modules in this course are accessible to free (non-premium) members';
