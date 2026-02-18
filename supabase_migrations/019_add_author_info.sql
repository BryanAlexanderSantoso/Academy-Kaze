-- Add author information to course_chapters
ALTER TABLE course_chapters ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE course_chapters ADD COLUMN IF NOT EXISTS author_image_url TEXT;

-- Also add to courses for course-level author if needed
ALTER TABLE courses ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS author_image_url TEXT;

COMMENT ON COLUMN course_chapters.author_name IS 'Name of the author who created this specific material chapter';
COMMENT ON COLUMN course_chapters.author_image_url IS 'URL to the author''s profile picture';
COMMENT ON COLUMN courses.author_name IS 'Name of the author who created this course';
COMMENT ON COLUMN courses.author_image_url IS 'URL to the author''s profile picture';
