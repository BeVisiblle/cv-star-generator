-- Test migration to verify posts functionality
-- This migration ensures the posts table works correctly for posting

-- First, let's check if we have a working posts table
-- If not, create a simple one
DO $$ 
BEGIN
    -- Check if posts table exists and has basic structure
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
    ) THEN
        -- Create basic posts table
        CREATE TABLE public.posts (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            content TEXT NOT NULL,
            post_type TEXT NOT NULL DEFAULT 'text',
            image_url TEXT,
            visibility TEXT DEFAULT 'public',
            status TEXT DEFAULT 'published',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Create indexes
        CREATE INDEX idx_posts_user_id ON public.posts(user_id);
        CREATE INDEX idx_posts_status ON public.posts(status);
        CREATE INDEX idx_posts_created_at ON public.posts(created_at);
        
        -- Enable RLS
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view published posts" 
        ON public.posts 
        FOR SELECT 
        USING (status = 'published');
        
        CREATE POLICY "Users can create their own posts" 
        ON public.posts 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own posts" 
        ON public.posts 
        FOR UPDATE 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own posts" 
        ON public.posts 
        FOR DELETE 
        USING (auth.uid() = user_id);
        
    END IF;
END $$;

-- Ensure the post-media storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload their own post media'
    ) THEN
        CREATE POLICY "Users can upload their own post media"
        ON storage.objects
        FOR INSERT
        WITH CHECK (
          bucket_id = 'post-media' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can view all post media'
    ) THEN
        CREATE POLICY "Users can view all post media"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = 'post-media');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete their own post media'
    ) THEN
        CREATE POLICY "Users can delete their own post media"
        ON storage.objects
        FOR DELETE
        USING (
          bucket_id = 'post-media' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;
