-- Fix activity RPCs to return proper data
-- Update get_activity_for_user to return table instead of jsonb
DROP FUNCTION IF EXISTS get_activity_for_user(uuid, int, int);
DROP FUNCTION IF EXISTS get_activity_for_org(uuid, int, int);

-- Activity for individual users - return as table
CREATE OR REPLACE FUNCTION get_activity_for_user(
  p_user uuid,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
) RETURNS TABLE (
  kind text,
  ref_id uuid,
  created_at timestamptz,
  post_kind post_kind,
  actor_user_id uuid,
  actor_org_id uuid,
  job_id uuid,
  body_md text,
  like_count int,
  comment_count int,
  share_count int,
  comment_id uuid,
  share_id uuid
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH combined_activity AS (
    -- User's own posts
    SELECT 
      'post'::text as kind,
      p.id as ref_id,
      p.created_at,
      p.post_kind,
      p.actor_user_id,
      p.actor_company_id as actor_org_id,
      p.job_id,
      p.body_md,
      p.like_count,
      p.comment_count,
      p.share_count,
      null::uuid as comment_id,
      null::uuid as share_id
    FROM community_posts p
    WHERE p.actor_user_id = p_user
    
    UNION ALL
    
    -- User's likes
    SELECT 
      'like'::text as kind,
      l.post_id as ref_id,
      l.created_at,
      p.post_kind,
      l.liker_user_id as actor_user_id,
      l.liker_company_id as actor_org_id,
      p.job_id,
      p.body_md,
      p.like_count,
      p.comment_count,
      p.share_count,
      null::uuid as comment_id,
      l.id as share_id
    FROM community_likes l
    JOIN community_posts p ON p.id = l.post_id
    WHERE l.liker_user_id = p_user
    
    UNION ALL
    
    -- User's comments
    SELECT 
      'comment'::text as kind,
      c.post_id as ref_id,
      c.created_at,
      p.post_kind,
      c.author_user_id as actor_user_id,
      c.author_company_id as actor_org_id,
      p.job_id,
      c.body_md,
      p.like_count,
      p.comment_count,
      p.share_count,
      c.id as comment_id,
      null::uuid as share_id
    FROM community_comments c
    JOIN community_posts p ON p.id = c.post_id
    WHERE c.author_user_id = p_user
    
    UNION ALL
    
    -- User's shares
    SELECT 
      'share'::text as kind,
      s.post_id as ref_id,
      s.created_at,
      p.post_kind,
      s.sharer_user_id as actor_user_id,
      s.sharer_company_id as actor_org_id,
      p.job_id,
      p.body_md,
      p.like_count,
      p.comment_count,
      p.share_count,
      null::uuid as comment_id,
      s.id as share_id
    FROM community_shares s
    JOIN community_posts p ON p.id = s.post_id
    WHERE s.sharer_user_id = p_user
  )
  SELECT 
    ca.kind,
    ca.ref_id,
    ca.created_at,
    ca.post_kind,
    ca.actor_user_id,
    ca.actor_org_id,
    ca.job_id,
    ca.body_md,
    ca.like_count,
    ca.comment_count,
    ca.share_count,
    ca.comment_id,
    ca.share_id
  FROM combined_activity ca
  ORDER BY ca.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END $$;

-- Activity for organizations - return as table
CREATE OR REPLACE FUNCTION get_activity_for_org(
  p_org uuid,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
) RETURNS TABLE (
  kind text,
  ref_id uuid,
  created_at timestamptz,
  post_kind post_kind,
  actor_user_id uuid,
  actor_org_id uuid,
  job_id uuid,
  body_md text,
  like_count int,
  comment_count int,
  share_count int,
  comment_id uuid,
  share_id uuid
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH combined_activity AS (
    -- Organization's posts
    SELECT 
      'post'::text as kind,
      p.id as ref_id,
      p.created_at,
      p.post_kind,
      p.actor_user_id,
      p.actor_company_id as actor_org_id,
      p.job_id,
      p.body_md,
      p.like_count,
      p.comment_count,
      p.share_count,
      null::uuid as comment_id,
      null::uuid as share_id
    FROM community_posts p
    WHERE p.actor_company_id = p_org
    
    UNION ALL
    
    -- Organization's likes
    SELECT 
      'like'::text as kind,
      l.post_id as ref_id,
      l.created_at,
      p.post_kind,
      l.liker_user_id as actor_user_id,
      l.liker_company_id as actor_org_id,
      p.job_id,
      p.body_md,
      p.like_count,
      p.comment_count,
      p.share_count,
      null::uuid as comment_id,
      l.id as share_id
    FROM community_likes l
    JOIN community_posts p ON p.id = l.post_id
    WHERE l.liker_company_id = p_org
    
    UNION ALL
    
    -- Organization's comments
    SELECT 
      'comment'::text as kind,
      c.post_id as ref_id,
      c.created_at,
      p.post_kind,
      c.author_user_id as actor_user_id,
      c.author_company_id as actor_org_id,
      p.job_id,
      c.body_md,
      p.like_count,
      p.comment_count,
      p.share_count,
      c.id as comment_id,
      null::uuid as share_id
    FROM community_comments c
    JOIN community_posts p ON p.id = c.post_id
    WHERE c.author_company_id = p_org
    
    UNION ALL
    
    -- Organization's shares
    SELECT 
      'share'::text as kind,
      s.post_id as ref_id,
      s.created_at,
      p.post_kind,
      s.sharer_user_id as actor_user_id,
      s.sharer_company_id as actor_org_id,
      p.job_id,
      p.body_md,
      p.like_count,
      p.comment_count,
      p.share_count,
      null::uuid as comment_id,
      s.id as share_id
    FROM community_shares s
    JOIN community_posts p ON p.id = s.post_id
    WHERE s.sharer_company_id = p_org
  )
  SELECT 
    ca.kind,
    ca.ref_id,
    ca.created_at,
    ca.post_kind,
    ca.actor_user_id,
    ca.actor_org_id,
    ca.job_id,
    ca.body_md,
    ca.like_count,
    ca.comment_count,
    ca.share_count,
    ca.comment_id,
    ca.share_id
  FROM combined_activity ca
  ORDER BY ca.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_activity_for_user(uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_for_org(uuid, int, int) TO authenticated;