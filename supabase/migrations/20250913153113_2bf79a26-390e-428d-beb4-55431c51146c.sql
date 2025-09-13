-- Step 1: Create storage bucket for post media if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create storage policies for post media
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can upload their own post media'
  ) THEN
    CREATE POLICY "Users can upload their own post media" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Post media is publicly viewable'
  ) THEN
    CREATE POLICY "Post media is publicly viewable" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'post-media');
  END IF;
END $$;