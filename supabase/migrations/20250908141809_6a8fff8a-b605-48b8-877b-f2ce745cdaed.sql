-- Check and update the documents bucket configuration  
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 52428800,
    allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'documents';

-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Users can view documents they own or companies can view unlocked candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects; 
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Create correct RLS policies for the documents bucket
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Companies can view unlocked candidate documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM company_candidates cc
    JOIN company_users cu ON cc.company_id = cu.company_id
    WHERE cc.candidate_id::text = (storage.foldername(name))[1]
    AND cu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);