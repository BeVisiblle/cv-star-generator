-- Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  visibility text DEFAULT 'public',
  like_count int DEFAULT 0 NOT NULL,
  comment_count int DEFAULT 0 NOT NULL,
  repost_count int DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts (author_id);

-- Post Likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Comments (parent_id null = Top-Level)
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  like_count int DEFAULT 0 NOT NULL,
  reply_count int DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments (parent_id);

-- Comment Likes
CREATE TABLE IF NOT EXISTS public.comment_likes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

-- Trigger functions for keeping counts
CREATE OR REPLACE FUNCTION public.inc_post_comment_count() RETURNS trigger AS $$
BEGIN
  UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  IF NEW.parent_id IS NOT NULL THEN
    UPDATE public.comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.dec_post_comment_count() RETURNS trigger AS $$
BEGIN
  UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  IF OLD.parent_id IS NOT NULL THEN
    UPDATE public.comments SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.parent_id;
  END IF;
  RETURN OLD;
END; $$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trg_comments_inc ON public.comments;
CREATE TRIGGER trg_comments_inc AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.inc_post_comment_count();

DROP TRIGGER IF EXISTS trg_comments_dec ON public.comments;
CREATE TRIGGER trg_comments_dec AFTER DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.dec_post_comment_count();

CREATE OR REPLACE FUNCTION public.inc_post_like_count() RETURNS trigger AS $$
BEGIN
  UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.dec_post_like_count() RETURNS trigger AS $$
BEGIN
  UPDATE public.posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_post_likes_inc ON public.post_likes;
CREATE TRIGGER trg_post_likes_inc AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.inc_post_like_count();

DROP TRIGGER IF EXISTS trg_post_likes_dec ON public.post_likes;
CREATE TRIGGER trg_post_likes_dec AFTER DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.dec_post_like_count();

CREATE OR REPLACE FUNCTION public.inc_comment_like_count() RETURNS trigger AS $$
BEGIN
  UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.dec_comment_like_count() RETURNS trigger AS $$
BEGIN
  UPDATE public.comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
  RETURN OLD;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comment_likes_inc ON public.comment_likes;
CREATE TRIGGER trg_comment_likes_inc AFTER INSERT ON public.comment_likes
FOR EACH ROW EXECUTE FUNCTION public.inc_comment_like_count();

DROP TRIGGER IF EXISTS trg_comment_likes_dec ON public.comment_likes;
CREATE TRIGGER trg_comment_likes_dec AFTER DELETE ON public.comment_likes
FOR EACH ROW EXECUTE FUNCTION public.dec_comment_like_count();

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "read posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "read post_likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "like post" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "unlike post" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "insert own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "delete own comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "update own comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "read comment_likes" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "like comment" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "unlike comment" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- View for comments with author info
CREATE OR REPLACE VIEW public.v_comments AS
SELECT c.*, 
       CONCAT(p.vorname, ' ', p.nachname) as full_name, 
       p.avatar_url, 
       p.headline,
       p.vorname,
       p.nachname
FROM public.comments c
JOIN public.profiles p ON p.id = c.author_id;