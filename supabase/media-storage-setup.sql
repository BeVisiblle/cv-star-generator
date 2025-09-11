-- Media storage buckets setup for community posts and attachments
-- Run this to create the necessary storage buckets for media uploads

-- Create storage buckets for media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('attachments', 'attachments', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images bucket
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);

-- Storage policies for attachments bucket
CREATE POLICY "Anyone can view attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'attachments' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own attachments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'attachments' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);

CREATE POLICY "Users can delete their own attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'attachments' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);
