-- Unified Posts Structure Migration
-- Creates a single, consistent table structure for all posts with proper visibility controls
-- Visibility options: 'public', 'followers', 'connections'

-- First, let's clean up any existing conflicting tables and create a unified structure
-- Drop existing posts table if it exists and recreate with proper structure
DROP TABLE IF EXISTS public.posts CASCADE;

-- Create unified posts table with proper visibility controls
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL DEFAULT 'user' CHECK (author_type IN ('user', 'company')),
  author_id UUID, -- Can reference user_id or company_id depending on author_type
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  image_url TEXT,
  post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'link', 'poll', 'event')),
  
  -- Visibility controls (German: Öffentlich, Followers, Nur Kontakte)
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'connections')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'deleted')),
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Engagement counters
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT posts_author_consistency CHECK (
    (author_type = 'user' AND author_id = user_id) OR
    (author_type = 'company' AND author_id = company_id AND company_id IS NOT NULL)
  )
);

-- Create comments table (unified)
DROP TABLE IF EXISTS public.comments CASCADE;

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  -- Engagement
  likes_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create likes table (unified for posts and comments)
DROP TABLE IF EXISTS public.likes CASCADE;

CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Polymorphic relationship - can like posts or comments
  likeable_type TEXT NOT NULL CHECK (likeable_type IN ('post', 'comment')),
  likeable_id UUID NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure one like per user per item
  UNIQUE(user_id, likeable_type, likeable_id)
);

-- Create shares/reposts table
DROP TABLE IF EXISTS public.shares CASCADE;

CREATE TABLE public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Optional: user can add their own comment when sharing
  share_comment TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure one share per user per post
  UNIQUE(post_id, user_id)
);

-- Create connections table (for "Nur Kontakte" visibility)
DROP TABLE IF EXISTS public.connections CASCADE;

CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure no self-connections and no duplicates
  CONSTRAINT connections_no_self CHECK (user1_id != user2_id),
  CONSTRAINT connections_ordered CHECK (user1_id < user2_id)
);

-- Create follows table (for "Followers" visibility)
DROP TABLE IF EXISTS public.follows CASCADE;

CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure no self-follows and no duplicates
  CONSTRAINT follows_no_self CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

-- Create indexes for performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_company_id ON public.posts(company_id);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX idx_posts_author_type_id ON public.posts(author_type, author_id);

CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_comment_id);

CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_likeable ON public.likes(likeable_type, likeable_id);

CREATE INDEX idx_shares_post_id ON public.shares(post_id);
CREATE INDEX idx_shares_user_id ON public.shares(user_id);

CREATE INDEX idx_connections_user1 ON public.connections(user1_id);
CREATE INDEX idx_connections_user2 ON public.connections(user2_id);
CREATE INDEX idx_connections_status ON public.connections(status);

CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_follows_status ON public.follows(status);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Helper functions for visibility checks
CREATE OR REPLACE FUNCTION public.is_user_connected(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections 
    WHERE ((user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1))
    AND status = 'accepted'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_following(follower_id UUID, following_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = $1 AND following_id = $2
    AND status = 'accepted'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_post(post_id UUID, viewer_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = $1
    AND p.status = 'published'
    AND (
      -- Public posts: everyone can see
      p.visibility = 'public'
      OR
      -- Followers posts: only followers can see
      (p.visibility = 'followers' AND public.is_user_following($2, p.user_id))
      OR
      -- Connections posts: only connected users can see
      (p.visibility = 'connections' AND public.is_user_connected($2, p.user_id))
      OR
      -- User can always see their own posts
      p.user_id = $2
    )
  );
$$;

-- RLS Policies for posts
CREATE POLICY "Users can view posts based on visibility"
ON public.posts
FOR SELECT
USING (public.can_view_post(id, auth.uid()));

CREATE POLICY "Users can create their own posts"
ON public.posts
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for comments
CREATE POLICY "Users can view comments on visible posts"
ON public.comments
FOR SELECT
USING (public.can_view_post(post_id, auth.uid()));

CREATE POLICY "Users can create comments on visible posts"
ON public.comments
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND public.can_view_post(post_id, auth.uid())
);

CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for likes
CREATE POLICY "Users can view likes on visible content"
ON public.likes
FOR SELECT
USING (
  (likeable_type = 'post' AND public.can_view_post(likeable_id, auth.uid()))
  OR
  (likeable_type = 'comment' AND EXISTS (
    SELECT 1 FROM public.comments c 
    WHERE c.id = likeable_id 
    AND public.can_view_post(c.post_id, auth.uid())
  ))
);

CREATE POLICY "Users can like visible content"
ON public.likes
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND (
    (likeable_type = 'post' AND public.can_view_post(likeable_id, auth.uid()))
    OR
    (likeable_type = 'comment' AND EXISTS (
      SELECT 1 FROM public.comments c 
      WHERE c.id = likeable_id 
      AND public.can_view_post(c.post_id, auth.uid())
    ))
  )
);

CREATE POLICY "Users can unlike their own likes"
ON public.likes
FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for shares
CREATE POLICY "Users can view shares on visible posts"
ON public.shares
FOR SELECT
USING (public.can_view_post(post_id, auth.uid()));

CREATE POLICY "Users can share visible posts"
ON public.shares
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND public.can_view_post(post_id, auth.uid())
);

CREATE POLICY "Users can delete their own shares"
ON public.shares
FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for connections
CREATE POLICY "Users can view their own connections"
ON public.connections
FOR SELECT
USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can create connection requests"
ON public.connections
FOR INSERT
WITH CHECK (user1_id = auth.uid() AND user1_id != user2_id);

CREATE POLICY "Users can update their own connections"
ON public.connections
FOR UPDATE
USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- RLS Policies for follows
CREATE POLICY "Users can view their own follows"
ON public.follows
FOR SELECT
USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can create follow relationships"
ON public.follows
FOR INSERT
WITH CHECK (follower_id = auth.uid() AND follower_id != following_id);

CREATE POLICY "Users can update their own follows"
ON public.follows
FOR UPDATE
USING (follower_id = auth.uid() OR following_id = auth.uid());

-- Triggers for updating counters
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.likeable_id AND NEW.likeable_type = 'post';
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.likeable_id AND OLD.likeable_type = 'post';
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET comments_count = GREATEST(comments_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET shares_count = shares_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET shares_count = GREATEST(shares_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.likeable_id AND NEW.likeable_type = 'comment';
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.likeable_id AND OLD.likeable_type = 'comment';
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

CREATE TRIGGER trigger_update_post_shares_count
  AFTER INSERT OR DELETE ON public.shares
  FOR EACH ROW EXECUTE FUNCTION public.update_post_shares_count();

CREATE TRIGGER trigger_update_comment_likes_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_likes_count();

-- Trigger for updated_at
CREATE TRIGGER trigger_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_follows_updated_at
  BEFORE UPDATE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create views for easier querying
CREATE OR REPLACE VIEW public.posts_with_authors AS
SELECT 
  p.*,
  CASE 
    WHEN p.author_type = 'user' THEN u.vorname || ' ' || u.nachname
    WHEN p.author_type = 'company' THEN c.name
    ELSE 'Unbekannt'
  END as author_name,
  CASE 
    WHEN p.author_type = 'user' THEN u.avatar_url
    WHEN p.author_type = 'company' THEN c.logo_url
    ELSE NULL
  END as author_avatar,
  CASE 
    WHEN p.author_type = 'user' THEN u.ausbildungsberuf
    WHEN p.author_type = 'company' THEN c.industry
    ELSE NULL
  END as author_title
FROM public.posts p
LEFT JOIN public.profiles u ON p.author_type = 'user' AND u.id = p.user_id
LEFT JOIN public.companies c ON p.author_type = 'company' AND c.id = p.company_id
WHERE p.status = 'published';

-- Grant permissions
GRANT SELECT ON public.posts_with_authors TO authenticated;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.comments TO authenticated;
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.shares TO authenticated;
GRANT ALL ON public.connections TO authenticated;
GRANT ALL ON public.follows TO authenticated;
