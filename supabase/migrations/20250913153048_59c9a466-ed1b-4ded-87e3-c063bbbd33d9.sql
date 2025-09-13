-- Step 1: Create storage bucket for post media if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create storage policies for post media
CREATE POLICY "Users can upload their own post media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Post media is publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-media');

CREATE POLICY "Users can update their own post media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Step 3: Migrate existing posts data to community_posts table if posts table exists
DO $$
BEGIN
  -- Check if posts table exists and migrate data
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
    INSERT INTO community_posts (
      id, 
      body_md, 
      media, 
      actor_user_id, 
      actor_company_id, 
      visibility, 
      status, 
      created_at, 
      updated_at
    )
    SELECT 
      id,
      content as body_md,
      CASE 
        WHEN image_url IS NOT NULL THEN jsonb_build_array(jsonb_build_object('type', 'image', 'url', image_url))
        ELSE '[]'::jsonb
      END as media,
      user_id as actor_user_id,
      NULL as actor_company_id,
      COALESCE(visibility::post_visibility, 'public'::post_visibility) as visibility,
      COALESCE(status, 'published') as status,
      created_at,
      updated_at
    FROM posts
    WHERE NOT EXISTS (
      SELECT 1 FROM community_posts cp WHERE cp.id = posts.id
    );
  END IF;
END $$;

-- Step 4: Update interaction counts in community_posts
UPDATE community_posts SET 
  like_count = COALESCE((
    SELECT COUNT(*) FROM community_likes 
    WHERE post_id = community_posts.id
  ), 0),
  comment_count = COALESCE((
    SELECT COUNT(*) FROM community_comments 
    WHERE post_id = community_posts.id
  ), 0),
  share_count = COALESCE((
    SELECT COUNT(*) FROM community_shares 
    WHERE post_id = community_posts.id
  ), 0);