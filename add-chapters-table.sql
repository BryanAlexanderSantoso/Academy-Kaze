-- Add course_chapters table for organizing course materials by chapters
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS course_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_body TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  
  -- Material bisa berupa file yang diupload atau external link
  material_type TEXT CHECK (material_type IN ('file', 'link', 'text')) DEFAULT 'text',
  file_url TEXT, -- URL dari Supabase Storage atau external link
  file_name TEXT, -- Original filename jika upload
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_course_chapters_course_id ON course_chapters(course_id);
CREATE INDEX IF NOT EXISTS idx_course_chapters_order ON course_chapters(course_id, order_index);

-- Row Level Security Policies
ALTER TABLE course_chapters ENABLE ROW LEVEL SECURITY;

-- Anyone can view published course chapters
CREATE POLICY "Anyone can view course chapters" ON course_chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_chapters.course_id 
      AND courses.is_published = true
    )
  );

-- Admin can do everything
CREATE POLICY "Admin can manage course chapters" ON course_chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create storage bucket for course materials (if not exists)
-- Note: Run this separately in Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('course-materials', 'course-materials', true)
-- ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE course_chapters IS 'Chapters/lessons for each course with support for files and links';
