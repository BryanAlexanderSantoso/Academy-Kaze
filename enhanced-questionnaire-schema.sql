-- Enhanced Questionnaire System Schema
-- Run this to upgrade the questionnaire system

-- Drop existing table if you want to start fresh (CAREFUL: This deletes data!)
-- DROP TABLE IF EXISTS questionnaire_responses CASCADE;
-- DROP TABLE IF EXISTS questionnaires CASCADE;

-- Enhanced Questionnaires Table
CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Questions structure: [{ id, type, question, options, required, points }]
  -- Types: 'multiple_choice', 'checkbox', 'short_answer', 'long_answer', 'rating', 'linear_scale'
  
  target_learning_paths TEXT[] DEFAULT ARRAY['fe', 'be', 'fs'], -- Which learning paths can see this
  target_student_ids UUID[] DEFAULT NULL, -- Specific students (NULL = all in learning path)
  
  due_date TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  allow_late_submission BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT false, -- Show answers after submission
  max_attempts INTEGER DEFAULT 1, -- How many times can submit
  time_limit_minutes INTEGER, -- NULL = no time limit
  
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Questionnaire Responses Table (separate for better querying)
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { "question_id": "answer_value" }
  
  score DECIMAL(5,2), -- Auto-calculated for objective questions
  max_score DECIMAL(5,2), -- Total possible points
  feedback TEXT, -- Admin feedback
  
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER, -- Track how long they took
  
  is_graded BOOLEAN DEFAULT false,
  graded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  graded_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(questionnaire_id, student_id, attempt_number)
);

-- Row Level Security Policies

-- Questionnaires RLS
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view questionnaires" ON questionnaires;
DROP POLICY IF EXISTS "Admins can manage questionnaires" ON questionnaires;

-- Members can view published questionnaires targeted to them
CREATE POLICY "Members can view assigned questionnaires" ON questionnaires
  FOR SELECT USING (
    is_published = true AND (
      -- Check if user's learning path is in target
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.learning_path = ANY(questionnaires.target_learning_paths)
      )
      OR
      -- Check if user is specifically targeted
      auth.uid() = ANY(COALESCE(target_student_ids, ARRAY[]::UUID[]))
    )
  );

-- Admins can do everything with questionnaires
CREATE POLICY "Admins can manage all questionnaires" ON questionnaires
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Questionnaire Responses RLS
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Students can view their own responses
CREATE POLICY "Students can view own responses" ON questionnaire_responses
  FOR SELECT USING (student_id = auth.uid());

-- Students can insert their own responses
CREATE POLICY "Students can submit responses" ON questionnaire_responses
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Students can update their own unsubmitted responses
CREATE POLICY "Students can update own responses" ON questionnaire_responses
  FOR UPDATE USING (
    student_id = auth.uid() 
    AND submitted_at IS NULL
  );

-- Admins can view all responses
CREATE POLICY "Admins can view all responses" ON questionnaire_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can update responses (for grading)
CREATE POLICY "Admins can grade responses" ON questionnaire_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questionnaires_published ON questionnaires(is_published);
CREATE INDEX IF NOT EXISTS idx_questionnaires_due_date ON questionnaires(due_date);
CREATE INDEX IF NOT EXISTS idx_questionnaires_learning_paths ON questionnaires USING GIN(target_learning_paths);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_student ON questionnaire_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_questionnaire ON questionnaire_responses(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_submitted ON questionnaire_responses(submitted_at);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for questionnaires
DROP TRIGGER IF EXISTS update_questionnaires_updated_at ON questionnaires;
CREATE TRIGGER update_questionnaires_updated_at
    BEFORE UPDATE ON questionnaires
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
