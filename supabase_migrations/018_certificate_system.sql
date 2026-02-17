-- Graduation Certificate System
-- Jalankan di Supabase SQL Editor

-- 1. Table to track user progress on individual chapters
CREATE TABLE IF NOT EXISTS public.chapter_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.course_chapters(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(user_id, chapter_id)
);

-- 2. Table for issued certificates
CREATE TABLE IF NOT EXISTS public.course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  certificate_code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(user_id, course_id)
);

-- 3. Enable RLS
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Chapter Progress
CREATE POLICY "Users can view own chapter progress" 
    ON public.chapter_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can mark chapters as complete" 
    ON public.chapter_progress FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Certificates
CREATE POLICY "Users can view own certificates" 
    ON public.course_certificates FOR SELECT 
    USING (auth.uid() = user_id);

-- Admin can manage everything
CREATE POLICY "Admin can manage all progress" 
    ON public.chapter_progress FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can manage all certificates" 
    ON public.course_certificates FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Indexes
CREATE INDEX idx_chapter_progress_user ON public.chapter_progress(user_id);
CREATE INDEX idx_chapter_progress_course ON public.chapter_progress(course_id);
CREATE INDEX idx_certificates_user ON public.course_certificates(user_id);
CREATE INDEX idx_certificates_code ON public.course_certificates(certificate_code);
