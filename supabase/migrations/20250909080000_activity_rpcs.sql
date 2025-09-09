-- Activity RPCs for user and organization profiles
-- Combined activity: posts, likes, comments, shares

-- Activity for individual users
CREATE OR REPLACE FUNCTION get_activity_for_user(
  p_user uuid,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql AS $$
DECLARE acc jsonb := '[]'::jsonb; 
BEGIN
  -- EIGENE POSTS
  acc := acc || (
    SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) FROM (
      SELECT 'post' AS kind, p.id AS ref_id, p.created_at, p.post_kind, p.body_md,
             p.actor_user_id, p.actor_org_id, p.job_id, p.like_count, p.comment_count, p.share_count
      FROM community_posts p
      WHERE p.actor_user_id = p_user
      ORDER BY p.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) x
  );

  -- LIKES (die der Nutzer gesetzt hat)
  acc := acc || (
    SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) FROM (
      SELECT 'like' AS kind, l.post_id AS ref_id, l.created_at,
             p.post_kind, p.actor_user_id, p.actor_org_id, p.job_id
      FROM community_likes l
      JOIN community_posts p ON p.id = l.post_id
      WHERE l.user_id = p_user
      ORDER BY l.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) x
  );

  -- KOMMENTARE
  acc := acc || (
    SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) FROM (
      SELECT 'comment' AS kind, c.post_id AS ref_id, c.id AS comment_id, c.created_at, c.body_md,
             p.post_kind, p.actor_user_id, p.actor_org_id, p.job_id
      FROM community_comments c
      JOIN community_posts p ON p.id = c.post_id
      WHERE c.author_user_id = p_user
      ORDER BY c.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) x
  );

  -- SHARES
  acc := acc || (
    SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) FROM (
      SELECT 'share' AS kind, s.post_id AS ref_id, s.id AS share_id, s.created_at,
             p.post_kind, p.actor_user_id, p.actor_org_id, p.job_id
      FROM community_shares s
      JOIN community_posts p ON p.id = s.post_id
      WHERE s.sharer_user_id = p_user
      ORDER BY s.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) x
  );

  RETURN acc;
END $$;

-- Activity for organizations
CREATE OR REPLACE FUNCTION get_activity_for_org(
  p_org uuid,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql AS $$
DECLARE acc jsonb := '[]'::jsonb; 
BEGIN
  -- ORG POSTS
  acc := acc || (
    SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) FROM (
      SELECT 'post' AS kind, p.id AS ref_id, p.created_at, p.post_kind, p.body_md,
             p.actor_user_id, p.actor_org_id, p.job_id, p.like_count, p.comment_count, p.share_count
      FROM community_posts p
      WHERE p.actor_org_id = p_org
      ORDER BY p.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) x
  );
  
  -- ORG LIKES
  acc := acc || (
    SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) FROM (
      SELECT 'like' AS kind, l.post_id AS ref_id, l.created_at,
             p.post_kind, p.actor_user_id, p.actor_org_id, p.job_id
      FROM community_likes l
      JOIN community_posts p ON p.id = l.post_id
      WHERE l.org_id = p_org
      ORDER BY l.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) x
  );
  
  -- ORG COMMENTS
  acc := acc || (
    SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) FROM (
      SELECT 'comment' AS kind, c.post_id AS ref_id, c.id AS comment_id, c.created_at, c.body_md,
             p.post_kind, p.actor_user_id, p.actor_org_id, p.job_id
      FROM community_comments c
      JOIN community_posts p ON p.id = c.post_id
      WHERE c.author_org_id = p_org
      ORDER BY c.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) x
  );
  
  -- ORG SHARES
  acc := acc || (
    SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) FROM (
      SELECT 'share' AS kind, s.post_id AS ref_id, s.id AS share_id, s.created_at,
             p.post_kind, p.actor_user_id, p.actor_org_id, p.job_id
      FROM community_shares s
      JOIN community_posts p ON p.id = s.post_id
      WHERE s.sharer_org_id = p_org
      ORDER BY s.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) x
  );
  
  RETURN acc;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_activity_for_user(uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_for_org(uuid, int, int) TO authenticated;
