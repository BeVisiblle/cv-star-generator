-- Add RLS policies and remaining components for community system

-- Helper function to check if user can view a community post
CREATE OR REPLACE FUNCTION can_view_community_post(p_post_id uuid, p_viewer_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_post_visibility post_visibility;
  v_actor_user_id uuid;
  v_actor_company_id uuid;
BEGIN
  -- Get post info
  SELECT visibility, actor_user_id, actor_company_id
  INTO v_post_visibility, v_actor_user_id, v_actor_company_id
  FROM community_posts WHERE id = p_post_id;
  
  IF NOT FOUND THEN RETURN false; END IF;
  
  -- Public posts are always visible
  IF v_post_visibility = 'public' THEN RETURN true; END IF;
  
  -- User is the author
  IF v_actor_user_id = p_viewer_id THEN RETURN true; END IF;
  
  -- User is company member
  IF v_actor_company_id IS NOT NULL AND has_company_access(v_actor_company_id) THEN 
    RETURN true; 
  END IF;
  
  -- Check followers/connections/org_only based on visibility
  IF v_post_visibility = 'followers' THEN
    RETURN EXISTS (
      SELECT 1 FROM follows 
      WHERE followee_id = COALESCE(v_actor_user_id, v_actor_company_id)
      AND follower_id = p_viewer_id
      AND status = 'accepted'
    );
  END IF;
  
  IF v_post_visibility = 'connections' THEN
    IF v_actor_user_id IS NOT NULL THEN
      RETURN EXISTS (
        SELECT 1 FROM connections 
        WHERE ((requester_id = v_actor_user_id AND addressee_id = p_viewer_id) OR
               (requester_id = p_viewer_id AND addressee_id = v_actor_user_id))
        AND status = 'accepted'
      );
    END IF;
  END IF;
  
  IF v_post_visibility = 'org_only' THEN
    RETURN v_actor_company_id IS NOT NULL AND has_company_access(v_actor_company_id);
  END IF;
  
  RETURN false;
END;
$$;

-- RLS Policies for community_posts
CREATE POLICY posts_select ON community_posts
  FOR SELECT USING (can_view_community_post(id, auth.uid()));

CREATE POLICY posts_insert ON community_posts
  FOR INSERT WITH CHECK (
    (actor_user_id = auth.uid() AND actor_company_id IS NULL) OR
    (actor_company_id IS NOT NULL AND has_company_access(actor_company_id) AND actor_user_id IS NULL)
  );

CREATE POLICY posts_update ON community_posts
  FOR UPDATE USING (
    (actor_user_id = auth.uid()) OR
    (actor_company_id IS NOT NULL AND has_company_access(actor_company_id))
  );

CREATE POLICY posts_delete ON community_posts
  FOR DELETE USING (
    (actor_user_id = auth.uid()) OR
    (actor_company_id IS NOT NULL AND has_company_access(actor_company_id))
  );

-- RLS Policies for community_comments
CREATE POLICY comments_select ON community_comments
  FOR SELECT USING (can_view_community_post(post_id, auth.uid()));

CREATE POLICY comments_insert ON community_comments
  FOR INSERT WITH CHECK (
    can_view_community_post(post_id, auth.uid()) AND (
      (author_user_id = auth.uid() AND author_company_id IS NULL) OR
      (author_company_id IS NOT NULL AND has_company_access(author_company_id) AND author_user_id IS NULL)
    )
  );

CREATE POLICY comments_update ON community_comments
  FOR UPDATE USING (
    (author_user_id = auth.uid()) OR
    (author_company_id IS NOT NULL AND has_company_access(author_company_id))
  );

CREATE POLICY comments_delete ON community_comments
  FOR DELETE USING (
    (author_user_id = auth.uid()) OR
    (author_company_id IS NOT NULL AND has_company_access(author_company_id))
  );

-- RLS Policies for community_likes
CREATE POLICY likes_select ON community_likes
  FOR SELECT USING (can_view_community_post(post_id, auth.uid()));

CREATE POLICY likes_insert ON community_likes
  FOR INSERT WITH CHECK (
    can_view_community_post(post_id, auth.uid()) AND (
      (liker_user_id = auth.uid() AND liker_company_id IS NULL) OR
      (liker_company_id IS NOT NULL AND has_company_access(liker_company_id) AND liker_user_id IS NULL)
    )
  );

CREATE POLICY likes_delete ON community_likes
  FOR DELETE USING (
    (liker_user_id = auth.uid()) OR
    (liker_company_id IS NOT NULL AND has_company_access(liker_company_id))
  );

-- RLS Policies for community_shares
CREATE POLICY shares_select ON community_shares
  FOR SELECT USING (can_view_community_post(post_id, auth.uid()));

CREATE POLICY shares_insert ON community_shares
  FOR INSERT WITH CHECK (
    can_view_community_post(post_id, auth.uid()) AND (
      (sharer_user_id = auth.uid() AND sharer_company_id IS NULL) OR
      (sharer_company_id IS NOT NULL AND has_company_access(sharer_company_id) AND sharer_user_id IS NULL)
    )
  );

CREATE POLICY shares_delete ON community_shares
  FOR DELETE USING (
    (sharer_user_id = auth.uid()) OR
    (sharer_company_id IS NOT NULL AND has_company_access(sharer_company_id))
  );

-- RLS Policies for community_mentions
CREATE POLICY mentions_select ON community_mentions
  FOR SELECT USING (can_view_community_post(post_id, auth.uid()));

-- RLS Policies for community_job_limits  
CREATE POLICY job_limits_select ON community_job_limits
  FOR SELECT USING (has_company_access(company_id));

CREATE POLICY job_limits_insert ON community_job_limits
  FOR INSERT WITH CHECK (has_company_access(company_id));

CREATE POLICY job_limits_update ON community_job_limits
  FOR UPDATE USING (has_company_access(company_id));

-- RLS Policies for community_preferences
CREATE POLICY preferences_select ON community_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY preferences_insert ON community_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY preferences_update ON community_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY preferences_delete ON community_preferences
  FOR DELETE USING (user_id = auth.uid());

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
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
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
$$;

CREATE TRIGGER community_likes_counter 
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER community_comments_counter 
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER community_shares_counter 
  AFTER INSERT OR DELETE ON community_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();