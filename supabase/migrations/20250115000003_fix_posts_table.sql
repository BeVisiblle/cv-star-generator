-- Fix posts table structure to ensure all necessary columns exist
-- This migration ensures the posts table has the correct structure for the app

-- Add missing columns if they don't exist
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS author_type TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS author_id UUID,
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing posts to have the correct values
UPDATE public.posts 
SET 
  status = COALESCE(status, 'published'),
  visibility = COALESCE(visibility, 'public'),
  post_type = COALESCE(post_type, 'text'),
  author_type = COALESCE(author_type, 'user'),
  author_id = COALESCE(author_id, user_id),
  published_at = COALESCE(published_at, created_at)
WHERE status IS NULL OR visibility IS NULL OR post_type IS NULL OR author_type IS NULL OR author_id IS NULL OR published_at IS NULL;

-- Add constraints if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_status_check'
  ) THEN
    ALTER TABLE public.posts
    ADD CONSTRAINT posts_status_check
    CHECK (status IN ('draft','scheduled','published','deleted'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_visibility_check'
  ) THEN
    ALTER TABLE public.posts
    ADD CONSTRAINT posts_visibility_check
    CHECK (visibility IN ('public','followers','connections'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_author_type_check'
  ) THEN
    ALTER TABLE public.posts
    ADD CONSTRAINT posts_author_type_check
    CHECK (author_type IN ('user','company'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_author_type ON public.posts(author_type);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);

-- Ensure RLS policies are in place
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view published posts" 
ON public.posts 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  (author_type = 'company' AND auth.uid() IN (
    SELECT user_id FROM public.companies WHERE id = author_id
  ))
);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  (author_type = 'company' AND auth.uid() IN (
    SELECT user_id FROM public.companies WHERE id = author_id
  ))
);

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  (author_type = 'company' AND auth.uid() IN (
    SELECT user_id FROM public.companies WHERE id = author_id
  ))
);
