-- Create storage bucket for videos (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('capsule-videos', 'capsule-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos
CREATE POLICY "videos_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'capsule-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "videos_read_own_or_received" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'capsule-videos' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM public.capsules
        WHERE video_path = name
        AND receiver_id = auth.uid()
        AND unlock_date <= NOW()
      )
    )
  );

CREATE POLICY "videos_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'capsule-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
