-- Kaze For Developers Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  learning_path TEXT CHECK (learning_path IN ('fe', 'be', 'fs')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Courses Table
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('fe', 'be', 'fs')),
  content_body TEXT,
  schedule_date TIMESTAMP WITH TIME ZONE,
  thumbnail_url TEXT,
  duration_hours INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Assignments Table
CREATE TABLE assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  submission_link TEXT,
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Questionnaires Table
CREATE TABLE questionnaires (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  responses_json JSONB DEFAULT '{}'::jsonb,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security Policies

-- Profiles: Users can read their own profile, admins can read all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Courses: Members can read courses in their learning path, admins can do everything
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view published courses" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Assignments: Students can view/update their own, admins can view all
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own assignments" ON assignments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update own assignments" ON assignments
  FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Questionnaires: All authenticated users can read, admins can manage
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view questionnaires" ON questionnaires
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage questionnaires" ON questionnaires
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Indexes for better performance
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_schedule ON courses(schedule_date);
CREATE INDEX idx_assignments_student ON assignments(student_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
