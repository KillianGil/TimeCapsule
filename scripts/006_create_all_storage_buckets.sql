-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for capsule videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('capsules', 'capsules', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (ignore errors)
DROP POLICY IF EXISTS "avatars_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_read_all" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "capsules_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "capsules_read_own_or_received" ON storage.objects;
DROP POLICY IF EXISTS "capsules_delete_own" ON storage.objects;

-- Storage policies for avatars
CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_read_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for capsules (videos)
CREATE POLICY "capsules_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'capsules' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "capsules_read_own_or_received" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'capsules' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM public.capsules
        WHERE video_path LIKE '%' || name
        AND receiver_id = auth.uid()
        AND unlock_date <= NOW()
      )
    )
  );

CREATE POLICY "capsules_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'capsules' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
