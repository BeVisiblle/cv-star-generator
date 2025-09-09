-- Community System Enhancement Migration
-- Creates comprehensive community functionality for companies and users

-- Enums for post system
DO $$ BEGIN
  CREATE TYPE post_visibility AS ENUM ('public', 'followers', 'connections', 'org_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN  
  CREATE TYPE post_kind AS ENUM ('text', 'media', 'job_share', 'poll');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE actor_kind AS ENUM ('user', 'company');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enhanced community_posts table (extending existing posts)
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_kind post_kind NOT NULL DEFAULT 'text',
  
  -- Polymorphic actor (exactly one must be set)
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  visibility post_visibility NOT NULL DEFAULT 'public',
  body_md text,
  media jsonb DEFAULT '[]'::jsonb,
  
  -- For job shares
  job_id uuid REFERENCES job_posts(id) ON DELETE SET NULL,
  applies_enabled boolean DEFAULT false,
  
  -- Counters
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure exactly one actor is set
  CONSTRAINT exactly_one_actor CHECK (
    (actor_user_id IS NOT NULL AND actor_company_id IS NULL) OR
    (actor_user_id IS NULL AND actor_company_id IS NOT NULL)
  )
);

-- Comments on community posts
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  
  -- Polymorphic author
  author_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  body_md text NOT NULL,
  parent_comment_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure exactly one author is set
  CONSTRAINT exactly_one_comment_author CHECK (
    (author_user_id IS NOT NULL AND author_company_id IS NULL) OR
    (author_user_id IS NULL AND author_company_id IS NOT NULL)
  )
);

-- Likes on posts
CREATE TABLE IF NOT EXISTS community_likes (
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  
  -- Polymorphic liker
  liker_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  liker_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  created_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (post_id, COALESCE(liker_user_id, liker_company_id)),
  
  -- Ensure exactly one liker is set
  CONSTRAINT exactly_one_liker CHECK (
    (liker_user_id IS NOT NULL AND liker_company_id IS NULL) OR
    (liker_user_id IS NULL AND liker_company_id IS NOT NULL)
  )
);

-- Shares/Reposts
CREATE TABLE IF NOT EXISTS community_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  
  -- Polymorphic sharer
  sharer_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sharer_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  created_at timestamptz DEFAULT now(),
  
  -- Ensure exactly one sharer is set
  CONSTRAINT exactly_one_sharer CHECK (
    (sharer_user_id IS NOT NULL AND sharer_company_id IS NULL) OR
    (sharer_user_id IS NULL AND sharer_company_id IS NOT NULL)
  )
);

-- Mentions in posts
CREATE TABLE IF NOT EXISTS community_mentions (
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  
  -- Polymorphic mentioned entity
  mentioned_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  start_pos integer,
  end_pos integer,
  
  created_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (post_id, COALESCE(mentioned_user_id, mentioned_company_id)),
  
  -- Ensure exactly one mentioned entity is set
  CONSTRAINT exactly_one_mentioned CHECK (
    (mentioned_user_id IS NOT NULL AND mentioned_company_id IS NULL) OR
    (mentioned_user_id IS NULL AND mentioned_company_id IS NOT NULL)
  )
);

-- Job share rate limiting
CREATE TABLE IF NOT EXISTS community_job_limits (
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  shares_used integer DEFAULT 0,
  
  PRIMARY KEY (company_id, job_id, week_start)
);

-- User preferences for community feed
CREATE TABLE IF NOT EXISTS community_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What to show
  show_job_shares boolean DEFAULT true,
  show_company_posts boolean DEFAULT true,
  show_user_posts boolean DEFAULT true,
  
  -- Feed scope
  origin_filter text DEFAULT 'all' CHECK (origin_filter IN ('followers', 'recommended', 'all')),
  radius_km integer DEFAULT 50,
  
  -- Muted/blocked entities
  muted_company_ids uuid[] DEFAULT '{}',
  muted_user_ids uuid[] DEFAULT '{}',
  blocked_ids uuid[] DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_job_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts
CREATE POLICY posts_public_read ON community_posts
  FOR SELECT USING (visibility = 'public');

CREATE POLICY posts_followers_read ON community_posts
  FOR SELECT USING (
    visibility = 'followers' AND (
      (actor_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM follows 
        WHERE followee_id = actor_user_id 
        AND follower_id = auth.uid()
        AND status = 'accepted'
      )) OR
      (actor_company_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM follows 
        WHERE followee_id = actor_company_id
        AND followee_type = 'company'
        AND follower_id = auth.uid()
        AND status = 'accepted'
      ))
    )
  );

CREATE POLICY posts_connections_read ON community_posts
  FOR SELECT USING (
    visibility = 'connections' AND (
      (actor_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM connections 
        WHERE ((requester_id = actor_user_id AND addressee_id = auth.uid()) OR
               (requester_id = auth.uid() AND addressee_id = actor_user_id))
        AND status = 'accepted'
      )) OR
      (actor_company_id IS NOT NULL AND has_company_access(actor_company_id))
    )
  );

CREATE POLICY posts_org_only_read ON community_posts
  FOR SELECT USING (
    visibility = 'org_only' AND 
    actor_company_id IS NOT NULL AND 
    has_company_access(actor_company_id)
  );

CREATE POLICY posts_author_read ON community_posts
  FOR SELECT USING (
    (actor_user_id = auth.uid()) OR
    (actor_company_id IS NOT NULL AND has_company_access(actor_company_id))
  );

CREATE POLICY posts_user_create ON community_posts
  FOR INSERT WITH CHECK (
    (actor_user_id = auth.uid() AND actor_company_id IS NULL) OR
    (actor_company_id IS NOT NULL AND has_company_access(actor_company_id) AND actor_user_id IS NULL)
  );

CREATE POLICY posts_author_update ON community_posts
  FOR UPDATE USING (
    (actor_user_id = auth.uid()) OR
    (actor_company_id IS NOT NULL AND has_company_access(actor_company_id))
  );

CREATE POLICY posts_author_delete ON community_posts
  FOR DELETE USING (
    (actor_user_id = auth.uid()) OR
    (actor_company_id IS NOT NULL AND has_company_access(actor_company_id))
  );

-- RLS Policies for community_comments
CREATE POLICY comments_read_if_post_visible ON community_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts 
      WHERE id = post_id
    )
  );

CREATE POLICY comments_user_create ON community_comments
  FOR INSERT WITH CHECK (
    (author_user_id = auth.uid() AND author_company_id IS NULL) OR
    (author_company_id IS NOT NULL AND has_company_access(author_company_id) AND author_user_id IS NULL)
  );

CREATE POLICY comments_author_update ON community_comments
  FOR UPDATE USING (
    (author_user_id = auth.uid()) OR
    (author_company_id IS NOT NULL AND has_company_access(author_company_id))
  );

CREATE POLICY comments_author_delete ON community_comments
  FOR DELETE USING (
    (author_user_id = auth.uid()) OR
    (author_company_id IS NOT NULL AND has_company_access(author_company_id))
  );

-- RLS Policies for community_likes
CREATE POLICY likes_read_if_post_visible ON community_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts 
      WHERE id = post_id
    )
  );

CREATE POLICY likes_user_manage ON community_likes
  FOR ALL USING (
    (liker_user_id = auth.uid()) OR
    (liker_company_id IS NOT NULL AND has_company_access(liker_company_id))
  )
  WITH CHECK (
    (liker_user_id = auth.uid() AND liker_company_id IS NULL) OR
    (liker_company_id IS NOT NULL AND has_company_access(liker_company_id) AND liker_user_id IS NULL)
  );

-- RLS Policies for community_shares
CREATE POLICY shares_read_if_post_visible ON community_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts 
      WHERE id = post_id
    )
  );

CREATE POLICY shares_user_manage ON community_shares
  FOR ALL USING (
    (sharer_user_id = auth.uid()) OR
    (sharer_company_id IS NOT NULL AND has_company_access(sharer_company_id))
  )
  WITH CHECK (
    (sharer_user_id = auth.uid() AND sharer_company_id IS NULL) OR
    (sharer_company_id IS NOT NULL AND has_company_access(sharer_company_id) AND sharer_user_id IS NULL)
  );

-- RLS Policies for community_mentions
CREATE POLICY mentions_read_if_post_visible ON community_mentions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts 
      WHERE id = post_id
    )
  );

-- RLS Policies for community_job_limits  
CREATE POLICY job_limits_company_access ON community_job_limits
  FOR ALL USING (has_company_access(company_id))
  WITH CHECK (has_company_access(company_id));

-- RLS Policies for community_preferences
CREATE POLICY preferences_user_manage ON community_preferences
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Storage bucket for community media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community', 'community', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for community media
CREATE POLICY community_upload ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY community_view ON storage.objects
  FOR SELECT USING (bucket_id = 'community');

CREATE POLICY community_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'community' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_actor_user ON community_posts(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_actor_company ON community_posts(actor_company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility ON community_posts(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_job ON community_posts(job_id) WHERE job_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_shares_post ON community_shares(post_id);

CREATE INDEX IF NOT EXISTS idx_community_mentions_user ON community_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_community_mentions_company ON community_mentions(mentioned_company_id);

-- Add realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE community_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE community_shares;

-- Trigger to update post counters
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'community_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE community_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'community_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE community_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'community_shares' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE community_posts SET share_count = share_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE community_posts SET share_count = GREATEST(share_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_likes_counter 
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER community_comments_counter 
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER community_shares_counter 
  AFTER INSERT OR DELETE ON community_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();