-- Storage buckets setup for groups and PDF Q&A system
-- Run this after the main migration

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('files', 'files', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('thumbnails', 'thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for files bucket
CREATE POLICY "Users can upload files to groups they belong to" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'files' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN files f ON f.group_id = gm.group_id
    WHERE gm.user_id = auth.uid() AND f.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can view files from groups they belong to" ON storage.objects
FOR SELECT USING (
  bucket_id = 'files' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN files f ON f.group_id = gm.group_id
    WHERE gm.user_id = auth.uid() AND f.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can update files they uploaded" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'files' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);

CREATE POLICY "Users can delete files they uploaded" ON storage.objects
FOR DELETE USING (
  bucket_id = 'files' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);

-- Storage policies for thumbnails bucket
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload thumbnails for files they own" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'thumbnails' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM files f
    WHERE f.id::text = (storage.foldername(name))[1] AND f.uploaded_by = auth.uid()
  )
);

CREATE POLICY "Users can update thumbnails for files they own" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'thumbnails' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM files f
    WHERE f.id::text = (storage.foldername(name))[1] AND f.uploaded_by = auth.uid()
  )
);

CREATE POLICY "Users can delete thumbnails for files they own" ON storage.objects
FOR DELETE USING (
  bucket_id = 'thumbnails' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM files f
    WHERE f.id::text = (storage.foldername(name))[1] AND f.uploaded_by = auth.uid()
  )
);
