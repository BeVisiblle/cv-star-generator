-- Idempotent setup for realtime and RPCs
-- 1) Ensure functions exist
CREATE OR REPLACE FUNCTION public.toggle_community_like(
  p_post_id uuid,
  p_liker_user_id uuid
) RETURNS TABLE(liked boolean, like_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id uuid;
  v_new_count integer;
  v_liked boolean;
BEGIN
  SELECT id INTO v_existing_id
  FROM community_likes 
  WHERE post_id = p_post_id AND liker_user_id = p_liker_user_id;
  
  IF v_existing_id IS NOT NULL THEN
    DELETE FROM community_likes WHERE id = v_existing_id;
    v_liked := false;
  ELSE
    INSERT INTO community_likes (post_id, liker_user_id) VALUES (p_post_id, p_liker_user_id);
    v_liked := true;
  END IF;
  
  SELECT like_count INTO v_new_count FROM community_posts WHERE id = p_post_id;
  RETURN QUERY SELECT v_liked, COALESCE(v_new_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.add_community_comment(
  p_post_id uuid,
  p_body_md text,
  p_author_user_id uuid,
  p_parent_comment_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_comment_id uuid; BEGIN
  INSERT INTO community_comments (post_id, author_user_id, body_md, parent_comment_id)
  VALUES (p_post_id, p_author_user_id, p_body_md, p_parent_comment_id)
  RETURNING id INTO v_comment_id;
  RETURN v_comment_id; END; $$;

CREATE OR REPLACE FUNCTION public.share_community_post(
  p_post_id uuid,
  p_sharer_user_id uuid
) RETURNS TABLE(shared boolean, share_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_exists uuid; v_cnt integer; BEGIN
  SELECT id INTO v_exists FROM community_shares WHERE post_id = p_post_id AND sharer_user_id = p_sharer_user_id;
  IF v_exists IS NULL THEN
    INSERT INTO community_shares (post_id, sharer_user_id) VALUES (p_post_id, p_sharer_user_id);
  END IF;
  SELECT share_count INTO v_cnt FROM community_posts WHERE id = p_post_id;
  RETURN QUERY SELECT true, COALESCE(v_cnt, 0); END; $$;

-- 2) Realtime identity (idempotent)
ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
ALTER TABLE public.community_comments REPLICA IDENTITY FULL;
ALTER TABLE public.community_likes REPLICA IDENTITY FULL;
ALTER TABLE public.community_shares REPLICA IDENTITY FULL;

-- 3) Add to publication only if not already present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='community_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='community_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='community_likes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_likes;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='community_shares'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_shares;
  END IF;
END $$;
