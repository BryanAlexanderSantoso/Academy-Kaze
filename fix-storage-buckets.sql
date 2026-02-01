-- Ensure storage bucket for payment proofs exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  true,
  10485760, -- 10MB limit
  '{image/jpeg,image/png,image/gif,image/webp}'
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure storage bucket for course materials exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  52428800, -- 50MB limit
  NULL
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for payment-proofs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access for Payment Proofs'
    ) THEN
        CREATE POLICY "Public Access for Payment Proofs" ON storage.objects
          FOR SELECT USING (bucket_id = 'payment-proofs');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Upload for Payment Proofs'
    ) THEN
        CREATE POLICY "Authenticated Upload for Payment Proofs" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');
    END IF;
END $$;

-- Policies for course-materials
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access for Materials'
    ) THEN
        CREATE POLICY "Public Access for Materials" ON storage.objects
          FOR SELECT USING (bucket_id = 'course-materials');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Upload for Materials'
    ) THEN
        CREATE POLICY "Authenticated Upload for Materials" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'course-materials');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Update for Materials'
    ) THEN
        CREATE POLICY "Authenticated Update for Materials" ON storage.objects
          FOR UPDATE USING (bucket_id = 'course-materials');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Delete for Materials'
    ) THEN
        CREATE POLICY "Authenticated Delete for Materials" ON storage.objects
          FOR DELETE USING (bucket_id = 'course-materials');
    END IF;
END $$;
