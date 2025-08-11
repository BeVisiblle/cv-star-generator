-- Create or replace a sorted feed function
CREATE OR REPLACE FUNCTION public.get_feed_sorted(
  viewer_id uuid,
  after_published timestamptz DEFAULT NULL,
  after_id uuid DEFAULT NULL,
  limit_count int DEFAULT 20,
  sort text DEFAULT 'relevant'
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  author_type text,
  author_id uuid,
  content text,
  image_url text,
  published_at timestamptz,
  visibility text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  celebration boolean,
  link_url text,
  scheduled_at timestamptz,
  like_count int,
  comment_count int,
  repost_count int
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.user_id,
    p.author_type,
    p.author_id,
    p.content,
    p.image_url,
    p.published_at,
    p.visibility,
    p.status,
    p.created_at,
    p.updated_at,
    p.celebration,
    p.link_url,
    p.scheduled_at,
    COALESCE(l.cnt, 0) AS like_count,
    COALESCE(c.cnt, 0) AS comment_count,
    COALESCE(r.cnt, 0) AS repost_count
  FROM public.posts p
  -- counts
  LEFT JOIN LATERAL (
    SELECT count(*)::int AS cnt FROM public.post_likes pl WHERE pl.post_id = p.id
  ) l ON TRUE
  LEFT JOIN LATERAL (
    SELECT count(*)::int AS cnt FROM public.post_comments pc WHERE pc.post_id = p.id
  ) c ON TRUE
  LEFT JOIN LATERAL (
    SELECT count(*)::int AS cnt FROM public.post_reposts pr WHERE pr.post_id = p.id
  ) r ON TRUE
  WHERE p.status = 'published'
    AND can_view_post(p.id, viewer_id)
    AND (
      after_published IS NULL OR
      p.published_at < after_published OR (p.published_at = after_published AND p.id < after_id)
    )
  ORDER BY
    CASE WHEN lower(sort) = 'newest' THEN NULL ELSE (
      (COALESCE(c.cnt,0) * 5) + (COALESCE(l.cnt,0) * 3) +
      GREATEST(0, 100 - (EXTRACT(EPOCH FROM (now() - p.published_at)) / 3600)::int)
    ) END DESC NULLS LAST,
    p.published_at DESC,
    p.id DESC
  LIMIT COALESCE(limit_count, 20);
$$;