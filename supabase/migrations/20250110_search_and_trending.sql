-- Search and Trending Features Migration
-- This migration adds full-text search capabilities and trending functionality

-- Create search_autocomplete function
CREATE OR REPLACE FUNCTION search_autocomplete(query text, limit_count int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  type text,
  label text,
  sublabel text,
  avatar text,
  url text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  WITH search_results AS (
    -- Search profiles (people and companies)
    SELECT 
      p.id,
      p.type::text,
      p.display_name as label,
      COALESCE(p.headline, '') as sublabel,
      p.avatar_url as avatar,
      CASE 
        WHEN p.type = 'person' THEN '/profile/' || p.id::text
        WHEN p.type = 'company' THEN '/company/' || p.id::text
        ELSE '/profile/' || p.id::text
      END as url,
      ts_rank(
        to_tsvector('german', COALESCE(p.display_name, '') || ' ' || COALESCE(p.headline, '')),
        plainto_tsquery('german', query)
      ) as rank
    FROM profiles p
    WHERE to_tsvector('german', COALESCE(p.display_name, '') || ' ' || COALESCE(p.headline, ''))
          @@ plainto_tsquery('german', query)
    
    UNION ALL
    
    -- Search events
    SELECT 
      e.id,
      'event'::text,
      e.title as label,
      COALESCE(e.location, 'Online') as sublabel,
      e.cover_url as avatar,
      '/event/' || e.id::text as url,
      ts_rank(
        to_tsvector('german', e.title || ' ' || COALESCE(e.description, '') || ' ' || COALESCE(e.location, '')),
        plainto_tsquery('german', query)
      ) as rank
    FROM events e
    WHERE to_tsvector('german', e.title || ' ' || COALESCE(e.description, '') || ' ' || COALESCE(e.location, ''))
          @@ plainto_tsquery('german', query)
    
    UNION ALL
    
    -- Search posts
    SELECT 
      p.id,
      'post'::text,
      LEFT(p.body, 50) || CASE WHEN LENGTH(p.body) > 50 THEN '...' ELSE '' END as label,
      'Post' as sublabel,
      NULL as avatar,
      '/post/' || p.id::text as url,
      ts_rank(
        to_tsvector('german', p.body),
        plainto_tsquery('german', query)
      ) as rank
    FROM posts p
    WHERE to_tsvector('german', p.body) @@ plainto_tsquery('german', query)
      AND p.visibility = 'public'
    
    UNION ALL
    
    -- Search hashtags
    SELECT 
      h.tag::uuid as id, -- Using a hash of the tag as UUID
      'hashtag'::text,
      '#' || h.tag as label,
      h.post_count::text || ' Posts' as sublabel,
      NULL as avatar,
      '/search?q=%23' || h.tag as url,
      h.post_count::real as rank
    FROM (
      SELECT 
        tag,
        COUNT(*) as post_count
      FROM post_hashtags
      WHERE tag ILIKE '%' || query || '%'
      GROUP BY tag
    ) h
  )
  SELECT * FROM search_results
  ORDER BY rank DESC, label ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create trending hashtags view
CREATE OR REPLACE VIEW trending_hashtags AS
WITH hashtag_engagement AS (
  SELECT 
    ph.tag,
    COUNT(DISTINCT ph.post_id) as post_count,
    COUNT(DISTINCT r.profile_id) as reaction_count,
    COUNT(DISTINCT c.id) as comment_count,
    -- Weight recent activity more heavily
    SUM(
      CASE 
        WHEN p.created_at > NOW() - INTERVAL '72 hours' THEN 3
        WHEN p.created_at > NOW() - INTERVAL '168 hours' THEN 2
        ELSE 1
      END
    ) as time_weight
  FROM post_hashtags ph
  JOIN posts p ON ph.post_id = p.id
  LEFT JOIN reactions r ON p.id = r.post_id
  LEFT JOIN comments c ON p.id = c.post_id
  WHERE p.created_at > NOW() - INTERVAL '30 days'
    AND p.visibility = 'public'
  GROUP BY ph.tag
)
SELECT 
  tag,
  post_count,
  reaction_count,
  comment_count,
  time_weight,
  -- Calculate trending score
  (post_count * 1.0 + reaction_count * 0.5 + comment_count * 1.5) * time_weight as trending_score
FROM hashtag_engagement
WHERE post_count >= 2 -- Minimum 2 posts to be trending
ORDER BY trending_score DESC;

-- Create recommended groups view (if groups table exists)
CREATE OR REPLACE VIEW recommended_groups AS
WITH group_activity AS (
  SELECT 
    g.id,
    g.name,
    g.description,
    g.cover_url,
    g.members_count,
    COUNT(DISTINCT p.id) as recent_posts,
    COUNT(DISTINCT gm.profile_id) as recent_members
  FROM groups g
  LEFT JOIN posts p ON g.id = p.group_id AND p.created_at > NOW() - INTERVAL '7 days'
  LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.created_at > NOW() - INTERVAL '7 days'
  GROUP BY g.id, g.name, g.description, g.cover_url, g.members_count
)
SELECT 
  id,
  name,
  description,
  cover_url,
  members_count,
  recent_posts,
  recent_members,
  -- Calculate recommendation score
  (members_count * 0.1 + recent_posts * 2.0 + recent_members * 1.5) as recommendation_score
FROM group_activity
WHERE members_count > 0
ORDER BY recommendation_score DESC;

-- Create search function for full search results
CREATE OR REPLACE FUNCTION search_all(
  query text,
  search_type text DEFAULT 'all',
  page_offset int DEFAULT 0,
  page_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  type text,
  title text,
  content text,
  author_name text,
  author_avatar text,
  created_at timestamptz,
  url text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  WITH search_results AS (
    -- Search profiles
    SELECT 
      p.id,
      p.type::text,
      p.display_name as title,
      COALESCE(p.headline, '') as content,
      p.display_name as author_name,
      p.avatar_url as author_avatar,
      p.created_at,
      CASE 
        WHEN p.type = 'person' THEN '/profile/' || p.id::text
        WHEN p.type = 'company' THEN '/company/' || p.id::text
        ELSE '/profile/' || p.id::text
      END as url,
      ts_rank(
        to_tsvector('german', COALESCE(p.display_name, '') || ' ' || COALESCE(p.headline, '')),
        plainto_tsquery('german', query)
      ) as rank
    FROM profiles p
    WHERE (search_type = 'all' OR search_type = 'people' OR search_type = 'companies')
      AND to_tsvector('german', COALESCE(p.display_name, '') || ' ' || COALESCE(p.headline, ''))
          @@ plainto_tsquery('german', query)
    
    UNION ALL
    
    -- Search events
    SELECT 
      e.id,
      'event'::text,
      e.title as title,
      COALESCE(e.description, '') as content,
      'Event' as author_name,
      e.cover_url as author_avatar,
      e.created_at,
      '/event/' || e.id::text as url,
      ts_rank(
        to_tsvector('german', e.title || ' ' || COALESCE(e.description, '') || ' ' || COALESCE(e.location, '')),
        plainto_tsquery('german', query)
      ) as rank
    FROM events e
    WHERE (search_type = 'all' OR search_type = 'events')
      AND to_tsvector('german', e.title || ' ' || COALESCE(e.description, '') || ' ' || COALESCE(e.location, ''))
          @@ plainto_tsquery('german', query)
    
    UNION ALL
    
    -- Search posts
    SELECT 
      p.id,
      'post'::text,
      LEFT(p.body, 100) as title,
      p.body as content,
      pr.display_name as author_name,
      pr.avatar_url as author_avatar,
      p.created_at,
      '/post/' || p.id::text as url,
      ts_rank(
        to_tsvector('german', p.body),
        plainto_tsquery('german', query)
      ) as rank
    FROM posts p
    JOIN profiles pr ON p.author_id = pr.id
    WHERE (search_type = 'all' OR search_type = 'posts')
      AND to_tsvector('german', p.body) @@ plainto_tsquery('german', query)
      AND p.visibility = 'public'
  )
  SELECT * FROM search_results
  ORDER BY rank DESC, created_at DESC
  OFFSET page_offset
  LIMIT page_limit;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_profiles_search 
ON profiles USING gin(to_tsvector('german', COALESCE(display_name, '') || ' ' || COALESCE(headline, '')));

CREATE INDEX IF NOT EXISTS idx_events_search 
ON events USING gin(to_tsvector('german', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(location, '')));

CREATE INDEX IF NOT EXISTS idx_posts_search 
ON posts USING gin(to_tsvector('german', body));

CREATE INDEX IF NOT EXISTS idx_post_hashtags_tag 
ON post_hashtags (tag);

-- Add RLS policies for search functions
ALTER FUNCTION search_autocomplete(text, int) SECURITY DEFINER;
ALTER FUNCTION search_all(text, text, int, int) SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_autocomplete(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION search_all(text, text, int, int) TO authenticated;
GRANT SELECT ON trending_hashtags TO authenticated;
GRANT SELECT ON recommended_groups TO authenticated;
