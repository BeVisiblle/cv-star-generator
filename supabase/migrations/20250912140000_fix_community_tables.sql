-- Fix Community Tables Migration
-- This migration ensures all community tables exist with correct structure

-- 1. Create community_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  body_md TEXT NOT NULL,
  media JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'deleted')),
  visibility TEXT NOT NULL DEFAULT 'CommunityOnly' CHECK (visibility IN ('CommunityOnly', 'CommunityAndCompanies')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure at least one actor is set
  CONSTRAINT community_posts_actor_check CHECK (
    (actor_user_id IS NOT NULL AND actor_company_id IS NULL) OR
    (actor_user_id IS NULL AND actor_company_id IS NOT NULL)
  )
);

-- 2. Create community_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  liker_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, liker_user_id)
);

-- 3. Create community_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body_md TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create community_shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  sharer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, sharer_user_id)
);

-- 5. Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_shares ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for community_posts
DROP POLICY IF EXISTS "community_posts_select_policy" ON public.community_posts;
CREATE POLICY "community_posts_select_policy" ON public.community_posts
FOR SELECT USING (
  status = 'published' AND (
    visibility = 'CommunityAndCompanies' OR
    (visibility = 'CommunityOnly' AND auth.role() = 'authenticated')
  )
);

DROP POLICY IF EXISTS "community_posts_insert_policy" ON public.community_posts;
CREATE POLICY "community_posts_insert_policy" ON public.community_posts
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    (actor_user_id = auth.uid() AND actor_company_id IS NULL) OR
    (actor_company_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE company_id = actor_company_id AND user_id = auth.uid()
    ))
  )
);

DROP POLICY IF EXISTS "community_posts_update_policy" ON public.community_posts;
CREATE POLICY "community_posts_update_policy" ON public.community_posts
FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    actor_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE company_id = actor_company_id AND user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "community_posts_delete_policy" ON public.community_posts;
CREATE POLICY "community_posts_delete_policy" ON public.community_posts
FOR DELETE USING (
  auth.role() = 'authenticated' AND (
    actor_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE company_id = actor_company_id AND user_id = auth.uid()
    )
  )
);

-- 7. Create RLS Policies for community_likes
DROP POLICY IF EXISTS "community_likes_select_policy" ON public.community_likes;
CREATE POLICY "community_likes_select_policy" ON public.community_likes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = community_likes.post_id 
    AND status = 'published'
    AND (visibility = 'CommunityAndCompanies' OR auth.role() = 'authenticated')
  )
);

DROP POLICY IF EXISTS "community_likes_insert_policy" ON public.community_likes;
CREATE POLICY "community_likes_insert_policy" ON public.community_likes
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND liker_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = community_likes.post_id 
    AND status = 'published'
  )
);

DROP POLICY IF EXISTS "community_likes_delete_policy" ON public.community_likes;
CREATE POLICY "community_likes_delete_policy" ON public.community_likes
FOR DELETE USING (
  auth.role() = 'authenticated' AND liker_user_id = auth.uid()
);

-- 8. Create RLS Policies for community_comments
DROP POLICY IF EXISTS "community_comments_select_policy" ON public.community_comments;
CREATE POLICY "community_comments_select_policy" ON public.community_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = community_comments.post_id 
    AND status = 'published'
    AND (visibility = 'CommunityAndCompanies' OR auth.role() = 'authenticated')
  )
);

DROP POLICY IF EXISTS "community_comments_insert_policy" ON public.community_comments;
CREATE POLICY "community_comments_insert_policy" ON public.community_comments
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND author_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = community_comments.post_id 
    AND status = 'published'
  )
);

DROP POLICY IF EXISTS "community_comments_update_policy" ON public.community_comments;
CREATE POLICY "community_comments_update_policy" ON public.community_comments
FOR UPDATE USING (
  auth.role() = 'authenticated' AND author_user_id = auth.uid()
);

DROP POLICY IF EXISTS "community_comments_delete_policy" ON public.community_comments;
CREATE POLICY "community_comments_delete_policy" ON public.community_comments
FOR DELETE USING (
  auth.role() = 'authenticated' AND author_user_id = auth.uid()
);

-- 9. Create RLS Policies for community_shares
DROP POLICY IF EXISTS "community_shares_select_policy" ON public.community_shares;
CREATE POLICY "community_shares_select_policy" ON public.community_shares
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = community_shares.post_id 
    AND status = 'published'
    AND (visibility = 'CommunityAndCompanies' OR auth.role() = 'authenticated')
  )
);

DROP POLICY IF EXISTS "community_shares_insert_policy" ON public.community_shares;
CREATE POLICY "community_shares_insert_policy" ON public.community_shares
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND sharer_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = community_shares.post_id 
    AND status = 'published'
  )
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_actor_user_id ON public.community_posts(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_actor_company_id ON public.community_posts(actor_company_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status_created_at ON public.community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_published_at ON public.community_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON public.community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(liker_user_id);

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author_user_id ON public.community_comments(author_user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON public.community_comments(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_community_shares_post_id ON public.community_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_community_shares_user_id ON public.community_shares(sharer_user_id);

-- 11. Create triggers to update counts
CREATE OR REPLACE FUNCTION update_community_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'community_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.community_posts 
      SET like_count = like_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.community_posts 
      SET like_count = like_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'community_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.community_posts 
      SET comment_count = comment_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.community_posts 
      SET comment_count = comment_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'community_shares' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.community_posts 
      SET share_count = share_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.community_posts 
      SET share_count = share_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_post_like_count ON public.community_likes;
CREATE TRIGGER trigger_update_post_like_count
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION update_community_post_counts();

DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON public.community_comments;
CREATE TRIGGER trigger_update_post_comment_count
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION update_community_post_counts();

DROP TRIGGER IF EXISTS trigger_update_post_share_count ON public.community_shares;
CREATE TRIGGER trigger_update_post_share_count
  AFTER INSERT OR DELETE ON public.community_shares
  FOR EACH ROW EXECUTE FUNCTION update_community_post_counts();

-- 12. Enable realtime for community tables
ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
ALTER TABLE public.community_likes REPLICA IDENTITY FULL;
ALTER TABLE public.community_comments REPLICA IDENTITY FULL;
ALTER TABLE public.community_shares REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER publication supabase_realtime ADD TABLE public.community_posts;
ALTER publication supabase_realtime ADD TABLE public.community_likes;
ALTER publication supabase_realtime ADD TABLE public.community_comments;
ALTER publication supabase_realtime ADD TABLE public.community_shares;
