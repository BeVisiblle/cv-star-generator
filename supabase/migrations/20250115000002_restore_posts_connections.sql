-- Restore Posts Connections Migration
-- This migration creates a unified view that combines all posts from different tables

-- Drop existing views if they exist
DROP VIEW IF EXISTS posts_with_authors CASCADE;
DROP VIEW IF EXISTS posts_unified CASCADE;

-- Create a unified posts view that combines all existing posts
CREATE OR REPLACE VIEW posts_unified AS
SELECT 
  p.id,
  COALESCE(p.content, p.body_md) as content,
  p.image_url,
  COALESCE(p.user_id, p.actor_user_id) as user_id,
  COALESCE(p.company_id, p.actor_company_id) as company_id,
  COALESCE(p.author_type, CASE WHEN COALESCE(p.actor_user_id, p.user_id) IS NOT NULL THEN 'user' ELSE 'company' END) as author_type,
  COALESCE(p.author_id, p.actor_user_id, p.actor_company_id, p.user_id, p.company_id) as author_id,
  COALESCE(p.status, 'published') as status,
  COALESCE(p.visibility, 'public') as visibility,
  p.scheduled_at,
  p.published_at,
  COALESCE(p.likes_count, p.like_count, 0) as likes_count,
  COALESCE(p.comments_count, p.comment_count, 0) as comments_count,
  COALESCE(p.shares_count, p.share_count, 0) as shares_count,
  p.created_at,
  p.updated_at
FROM posts p
WHERE COALESCE(p.status, 'published') = 'published'

UNION ALL

SELECT 
  cp.id,
  cp.body_md as content,
  NULL as image_url,
  cp.actor_user_id as user_id,
  cp.actor_company_id as company_id,
  CASE WHEN cp.actor_user_id IS NOT NULL THEN 'user' ELSE 'company' END as author_type,
  COALESCE(cp.actor_user_id, cp.actor_company_id) as author_id,
  cp.status,
  cp.visibility,
  cp.scheduled_at,
  cp.published_at,
  cp.like_count as likes_count,
  cp.comment_count as comments_count,
  cp.share_count as shares_count,
  cp.created_at,
  cp.updated_at
FROM community_posts cp
WHERE cp.status = 'published'
  AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.id = cp.id);

-- Create posts_with_authors view using the unified posts
CREATE OR REPLACE VIEW posts_with_authors AS
SELECT 
  pu.*,
  COALESCE(pr.full_name, c.name) as author_name,
  COALESCE(pr.avatar_url, c.logo_url) as author_avatar,
  COALESCE(pr.headline, c.description) as author_headline
FROM posts_unified pu
LEFT JOIN profiles pr ON pu.user_id = pr.id
LEFT JOIN companies c ON pu.company_id = c.id;

-- Grant permissions
GRANT SELECT ON posts_unified TO authenticated;
GRANT SELECT ON posts_with_authors TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW posts_unified IS 'Unified view of all posts from posts and community_posts tables';
COMMENT ON VIEW posts_with_authors IS 'Posts with author information for feed display';
