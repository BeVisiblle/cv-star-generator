-- Create the documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 52428800, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Create RLS policies for the documents bucket
CREATE POLICY "Users can view documents they own or companies can view unlocked candidate documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' AND (
    -- Users can view their own documents
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Companies can view documents of unlocked candidates
    EXISTS (
      SELECT 1 FROM company_candidates cc
      WHERE cc.candidate_id::text = (storage.foldername(name))[1]
      AND cc.company_id IN (
        SELECT company_id FROM company_users 
        WHERE user_id = auth.uid()
      )
    )
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