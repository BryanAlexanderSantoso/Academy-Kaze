-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error', 'material'
  link TEXT, -- Optional link to navigate to
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to notify users when a new material (chapter) is uploaded
CREATE OR REPLACE FUNCTION notify_members_on_new_chapter()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_title TEXT;
  member_id UUID;
BEGIN
  -- Get the course title
  SELECT title INTO course_title FROM courses WHERE id = NEW.course_id;

  -- Insert notification for each member
  -- (We could filter by learning_path if we want, but usually everyone wants to know about new materials)
  FOR member_id IN (SELECT id FROM profiles WHERE role = 'member') LOOP
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      member_id,
      'Materi Baru Tersedia!',
      'Materi baru "' || NEW.title || '" telah ditambahkan ke kursus "' || course_title || '".',
      'material',
      '/dashboard/courses/' || NEW.course_id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run after a new chapter is inserted
DROP TRIGGER IF EXISTS tr_notify_on_new_chapter ON course_chapters;
CREATE TRIGGER tr_notify_on_new_chapter
AFTER INSERT ON course_chapters
FOR EACH ROW
EXECUTE FUNCTION notify_members_on_new_chapter();
