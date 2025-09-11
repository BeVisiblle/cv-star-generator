-- Create missing RPC functions for community interactions
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
  -- Check if user already liked this post
  SELECT id INTO v_existing_id
  FROM community_likes 
  WHERE post_id = p_post_id AND liker_user_id = p_liker_user_id;
  
  IF v_existing_id IS NOT NULL THEN
    -- Unlike the post
    DELETE FROM community_likes WHERE id = v_existing_id;
    v_liked := false;
  ELSE
    -- Like the post
    INSERT INTO community_likes (post_id, liker_user_id) 
    VALUES (p_post_id, p_liker_user_id);
    v_liked := true;
  END IF;
  
  -- Get updated like count
  SELECT like_count INTO v_new_count 
  FROM community_posts 
  WHERE id = p_post_id;
  
  RETURN QUERY SELECT v_liked, COALESCE(v_new_count, 0);
END;
$$;

-- Create function for adding community comments
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
DECLARE
  v_comment_id uuid;
BEGIN
  -- Insert the comment
  INSERT INTO community_comments (
    post_id, 
    author_user_id, 
    body_md, 
    parent_comment_id
  ) VALUES (
    p_post_id, 
    p_author_user_id, 
    p_body_md, 
    p_parent_comment_id
  ) RETURNING id INTO v_comment_id;
  
  RETURN v_comment_id;
END;
$$;

-- Create function for sharing community posts
CREATE OR REPLACE FUNCTION public.share_community_post(
  p_post_id uuid,
  p_sharer_user_id uuid
) RETURNS TABLE(shared boolean, share_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id uuid;
  v_new_count integer;
  v_shared boolean;
BEGIN
  -- Check if user already shared this post
  SELECT id INTO v_existing_id
  FROM community_shares 
  WHERE post_id = p_post_id AND sharer_user_id = p_sharer_user_id;
  
  IF v_existing_id IS NOT NULL THEN
    -- Already shared, do nothing or unshare
    v_shared := true;
  ELSE
    -- Share the post
    INSERT INTO community_shares (post_id, sharer_user_id) 
    VALUES (p_post_id, p_sharer_user_id);
    v_shared := true;
  END IF;
  
  -- Get updated share count
  SELECT share_count INTO v_new_count 
  FROM community_posts 
  WHERE id = p_post_id;
  
  RETURN QUERY SELECT v_shared, COALESCE(v_new_count, 0);
END;
$$;

-- Enable realtime for community tables
ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
ALTER TABLE public.community_comments REPLICA IDENTITY FULL;
ALTER TABLE public.community_likes REPLICA IDENTITY FULL;
ALTER TABLE public.community_shares REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE public.community_posts;
ALTER publication supabase_realtime ADD TABLE public.community_comments;
ALTER publication supabase_realtime ADD TABLE public.community_likes;
ALTER publication supabase_realtime ADD TABLE public.community_shares;