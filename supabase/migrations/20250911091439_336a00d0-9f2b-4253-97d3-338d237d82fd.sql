-- Migrate legacy likes and comments to community tables safely
DO $$
BEGIN
  -- post_likes -> community_likes
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='post_likes'
  ) THEN
    INSERT INTO public.community_likes (id, post_id, liker_user_id, created_at)
    SELECT pl.id, pl.post_id, pl.user_id, COALESCE(pl.created_at, now())
    FROM public.post_likes pl
    WHERE NOT EXISTS (
      SELECT 1 FROM public.community_likes cl 
      WHERE cl.id = pl.id
         OR (cl.post_id = pl.post_id AND cl.liker_user_id = pl.user_id)
    );
  END IF;

  -- post_comments -> community_comments
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='post_comments'
  ) THEN
    INSERT INTO public.community_comments (id, post_id, author_user_id, body_md, parent_comment_id, created_at, updated_at)
    SELECT pc.id, pc.post_id, pc.user_id, pc.content, pc.parent_comment_id, COALESCE(pc.created_at, now()), COALESCE(pc.updated_at, pc.created_at, now())
    FROM public.post_comments pc
    WHERE NOT EXISTS (
      SELECT 1 FROM public.community_comments cc 
      WHERE cc.id = pc.id
         OR (cc.post_id = pc.post_id AND cc.author_user_id = pc.user_id AND cc.body_md = pc.content)
    );
  END IF;
END $$;

-- Ensure realtime captures updates fully
ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
ALTER TABLE public.community_comments REPLICA IDENTITY FULL;
ALTER TABLE public.community_likes REPLICA IDENTITY FULL;

-- Add to realtime publication (ignore if already added)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts';
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments';
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.community_likes';
  EXCEPTION WHEN others THEN NULL; END;
END $$;