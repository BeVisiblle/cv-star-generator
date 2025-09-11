-- Enhanced LinkedIn-style Posts System

-- Update profiles table with additional fields for LinkedIn-style experience
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- Posts table (enhanced from previous migration)
CREATE TABLE IF NOT EXISTS public.linkedin_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
  like_count int DEFAULT 0 NOT NULL,
  comment_count int DEFAULT 0 NOT NULL,
  repost_count int DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_posts_created_at ON public.linkedin_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_author_id ON public.linkedin_posts (author_id);

-- Post Likes
CREATE TABLE IF NOT EXISTS public.linkedin_post_likes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.linkedin_posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Comments (parent_id null = Top-Level)
CREATE TABLE IF NOT EXISTS public.linkedin_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.linkedin_posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.linkedin_comments(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  like_count int DEFAULT 0 NOT NULL,
  reply_count int DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_comments_post_id ON public.linkedin_comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_linkedin_comments_parent_id ON public.linkedin_comments (parent_id);

-- Comment Likes
CREATE TABLE IF NOT EXISTS public.linkedin_comment_likes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL REFERENCES public.linkedin_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

-- Company Posts (for company feed)
CREATE TABLE IF NOT EXISTS public.linkedin_company_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  job_id uuid,
  like_count int DEFAULT 0 NOT NULL,
  comment_count int DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_company_posts_created_at ON public.linkedin_company_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_company_posts_company_id ON public.linkedin_company_posts (company_id);

-- Storage buckets for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('linkedin-attachments', 'linkedin-attachments', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('company-attachments', 'company-attachments', true) ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_company_posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "read linkedin_posts" ON public.linkedin_posts FOR SELECT USING (true);
CREATE POLICY "insert own linkedin_posts" ON public.linkedin_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "update own linkedin_posts" ON public.linkedin_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "delete own linkedin_posts" ON public.linkedin_posts FOR DELETE USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "read linkedin_post_likes" ON public.linkedin_post_likes FOR SELECT USING (true);
CREATE POLICY "like linkedin_post" ON public.linkedin_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "unlike linkedin_post" ON public.linkedin_post_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "read linkedin_comments" ON public.linkedin_comments FOR SELECT USING (true);
CREATE POLICY "insert own linkedin_comments" ON public.linkedin_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "delete own linkedin_comments" ON public.linkedin_comments FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "update own linkedin_comments" ON public.linkedin_comments FOR UPDATE USING (auth.uid() = author_id);

-- Comment likes policies
CREATE POLICY "read linkedin_comment_likes" ON public.linkedin_comment_likes FOR SELECT USING (true);
CREATE POLICY "like linkedin_comment" ON public.linkedin_comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "unlike linkedin_comment" ON public.linkedin_comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Company posts policies
CREATE POLICY "read linkedin_company_posts" ON public.linkedin_company_posts FOR SELECT USING (true);
CREATE POLICY "insert linkedin_company_posts" ON public.linkedin_company_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Storage policies
CREATE POLICY "Anyone can view linkedin attachments" ON storage.objects FOR SELECT USING (bucket_id = 'linkedin-attachments');
CREATE POLICY "Users can upload linkedin attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'linkedin-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their linkedin attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'linkedin-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their linkedin attachments" ON storage.objects FOR DELETE USING (bucket_id = 'linkedin-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RPC Functions for LinkedIn interactions
CREATE OR REPLACE FUNCTION public.toggle_linkedin_like(p_post_id uuid, p_liker_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
  v_new_count integer;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM linkedin_post_likes 
    WHERE post_id = p_post_id AND user_id = p_liker_user_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Remove like
    DELETE FROM linkedin_post_likes 
    WHERE post_id = p_post_id AND user_id = p_liker_user_id;
    
    -- Update count
    UPDATE linkedin_posts 
    SET like_count = GREATEST(like_count - 1, 0),
        updated_at = now()
    WHERE id = p_post_id
    RETURNING like_count INTO v_new_count;
    
    RETURN jsonb_build_object('liked', false, 'count', v_new_count);
  ELSE
    -- Add like
    INSERT INTO linkedin_post_likes (user_id, post_id) 
    VALUES (p_liker_user_id, p_post_id);
    
    -- Update count
    UPDATE linkedin_posts 
    SET like_count = like_count + 1,
        updated_at = now()
    WHERE id = p_post_id
    RETURNING like_count INTO v_new_count;
    
    RETURN jsonb_build_object('liked', true, 'count', v_new_count);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_linkedin_comment(
  p_post_id uuid,
  p_body_md text,
  p_author_user_id uuid,
  p_parent_comment_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment_id uuid;
BEGIN
  -- Insert comment
  INSERT INTO linkedin_comments (post_id, parent_id, author_id, body)
  VALUES (p_post_id, p_parent_comment_id, p_author_user_id, p_body_md)
  RETURNING id INTO v_comment_id;
  
  -- Update comment count on post
  UPDATE linkedin_posts 
  SET comment_count = comment_count + 1,
      updated_at = now()
  WHERE id = p_post_id;
  
  -- Update reply count on parent comment if this is a reply
  IF p_parent_comment_id IS NOT NULL THEN
    UPDATE linkedin_comments 
    SET reply_count = reply_count + 1
    WHERE id = p_parent_comment_id;
  END IF;
  
  RETURN v_comment_id;
END;
$$;