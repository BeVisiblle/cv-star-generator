-- Community RPCs for business logic

-- Helper function to ensure user preferences exist
CREATE OR REPLACE FUNCTION ensure_community_preferences(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO community_preferences (user_id) 
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Create a community post
CREATE OR REPLACE FUNCTION create_community_post(
  p_post_kind post_kind DEFAULT 'text',
  p_actor_user_id uuid DEFAULT NULL,
  p_actor_company_id uuid DEFAULT NULL,
  p_visibility post_visibility DEFAULT 'public',
  p_body_md text DEFAULT NULL,
  p_media jsonb DEFAULT '[]',
  p_job_id uuid DEFAULT NULL,
  p_mentions jsonb DEFAULT '[]'
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_post_id uuid;
  v_mention record;
BEGIN
  -- Validate actor
  IF p_actor_user_id IS NULL AND p_actor_company_id IS NULL THEN
    RAISE EXCEPTION 'Either actor_user_id or actor_company_id must be provided';
  END IF;
  
  IF p_actor_user_id IS NOT NULL AND p_actor_company_id IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot specify both actor_user_id and actor_company_id';
  END IF;
  
  -- Create post
  INSERT INTO community_posts (
    post_kind, actor_user_id, actor_company_id, visibility, 
    body_md, media, job_id, applies_enabled
  ) VALUES (
    p_post_kind, p_actor_user_id, p_actor_company_id, p_visibility,
    p_body_md, p_media, p_job_id, 
    CASE WHEN p_post_kind = 'job_share' THEN true ELSE false END
  )
  RETURNING id INTO v_post_id;
  
  -- Process mentions
  FOR v_mention IN SELECT * FROM jsonb_array_elements(p_mentions)
  LOOP
    INSERT INTO community_mentions (
      post_id, mentioned_user_id, mentioned_company_id, start_pos, end_pos
    ) VALUES (
      v_post_id,
      (v_mention.value->>'mentioned_user_id')::uuid,
      (v_mention.value->>'mentioned_company_id')::uuid,
      (v_mention.value->>'start_pos')::integer,
      (v_mention.value->>'end_pos')::integer
    );
  END LOOP;
  
  RETURN v_post_id;
END;
$$;

-- Share a job as a community post with rate limiting
CREATE OR REPLACE FUNCTION share_job_as_post(
  p_company_id uuid,
  p_job_id uuid,
  p_visibility post_visibility DEFAULT 'public',
  p_custom_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_post_id uuid;
  v_week_start date;
  v_shares_used integer;
  v_weekly_limit integer := 1; -- Default limit
  v_job_title text;
  v_job_location text;
  v_auto_message text;
BEGIN
  -- Check if company has access
  IF NOT has_company_access(p_company_id) THEN
    RAISE EXCEPTION 'Access denied to company';
  END IF;
  
  -- Check if job exists and is active/public
  SELECT title, COALESCE(main_location, 'Remote') 
  INTO v_job_title, v_job_location
  FROM job_posts 
  WHERE id = p_job_id AND company_id = p_company_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found or not active';
  END IF;
  
  -- Calculate current week
  v_week_start := date_trunc('week', CURRENT_DATE);
  
  -- Check rate limit
  SELECT COALESCE(shares_used, 0) INTO v_shares_used
  FROM community_job_limits
  WHERE company_id = p_company_id AND job_id = p_job_id AND week_start = v_week_start;
  
  IF v_shares_used >= v_weekly_limit THEN
    RAISE EXCEPTION 'Weekly job share limit reached for this job';
  END IF;
  
  -- Generate auto message if none provided
  IF p_custom_message IS NULL THEN
    v_auto_message := format('**%s** in %s

Wir suchen Verstärkung für unser Team! 

🎯 Jetzt bewerben', v_job_title, v_job_location);
  ELSE
    v_auto_message := p_custom_message;
  END IF;
  
  -- Create the post
  SELECT create_community_post(
    'job_share',
    NULL, -- actor_user_id  
    p_company_id, -- actor_company_id
    p_visibility,
    v_auto_message,
    '[]'::jsonb,
    p_job_id,
    '[]'::jsonb
  ) INTO v_post_id;
  
  -- Update rate limit counter
  INSERT INTO community_job_limits (company_id, job_id, week_start, shares_used)
  VALUES (p_company_id, p_job_id, v_week_start, 1)
  ON CONFLICT (company_id, job_id, week_start)
  DO UPDATE SET shares_used = community_job_limits.shares_used + 1;
  
  RETURN v_post_id;
END;
$$;

-- Toggle like on a post
CREATE OR REPLACE FUNCTION toggle_community_like(
  p_post_id uuid,
  p_liker_user_id uuid DEFAULT NULL,
  p_liker_company_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_existed boolean;
  v_new_count integer;
BEGIN
  -- Validate liker
  IF p_liker_user_id IS NULL AND p_liker_company_id IS NULL THEN
    RAISE EXCEPTION 'Either liker_user_id or liker_company_id must be provided';
  END IF;
  
  -- Check if already liked
  SELECT true INTO v_existed
  FROM community_likes
  WHERE post_id = p_post_id 
    AND (liker_user_id = p_liker_user_id OR liker_company_id = p_liker_company_id);
  
  IF v_existed THEN
    -- Unlike
    DELETE FROM community_likes
    WHERE post_id = p_post_id 
      AND (liker_user_id = p_liker_user_id OR liker_company_id = p_liker_company_id);
  ELSE
    -- Like
    INSERT INTO community_likes (post_id, liker_user_id, liker_company_id)
    VALUES (p_post_id, p_liker_user_id, p_liker_company_id);
  END IF;
  
  -- Get updated count
  SELECT like_count INTO v_new_count 
  FROM community_posts 
  WHERE id = p_post_id;
  
  RETURN jsonb_build_object(
    'liked', NOT COALESCE(v_existed, false),
    'count', v_new_count
  );
END;
$$;

-- Add comment to a post
CREATE OR REPLACE FUNCTION add_community_comment(
  p_post_id uuid,
  p_body_md text,
  p_author_user_id uuid DEFAULT NULL,
  p_author_company_id uuid DEFAULT NULL,
  p_parent_comment_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_comment_id uuid;
BEGIN
  -- Validate author
  IF p_author_user_id IS NULL AND p_author_company_id IS NULL THEN
    RAISE EXCEPTION 'Either author_user_id or author_company_id must be provided';
  END IF;
  
  INSERT INTO community_comments (
    post_id, body_md, author_user_id, author_company_id, parent_comment_id
  ) VALUES (
    p_post_id, p_body_md, p_author_user_id, p_author_company_id, p_parent_comment_id
  )
  RETURNING id INTO v_comment_id;
  
  RETURN v_comment_id;
END;
$$;

-- Share/repost a community post
CREATE OR REPLACE FUNCTION share_community_post(
  p_post_id uuid,
  p_sharer_user_id uuid DEFAULT NULL,
  p_sharer_company_id uuid DEFAULT NULL,
  p_comment text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_share_id uuid;
  v_new_post_id uuid;
BEGIN
  -- Validate sharer
  IF p_sharer_user_id IS NULL AND p_sharer_company_id IS NULL THEN
    RAISE EXCEPTION 'Either sharer_user_id or sharer_company_id must be provided';
  END IF;
  
  -- Record the share
  INSERT INTO community_shares (post_id, sharer_user_id, sharer_company_id)
  VALUES (p_post_id, p_sharer_user_id, p_sharer_company_id)
  RETURNING id INTO v_share_id;
  
  -- Create a new post that references the shared post
  IF p_comment IS NOT NULL THEN
    v_new_post_id := create_community_post(
      'text',
      p_sharer_user_id,
      p_sharer_company_id,
      'public',
      p_comment || E'\n\n*Geteilter Beitrag von Original-Autor*'
    );
  END IF;
  
  RETURN v_share_id;
END;
$$;

-- Get community feed for user with preferences
CREATE OR REPLACE FUNCTION get_community_feed(
  p_user_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  post_kind post_kind,
  actor_user_id uuid,
  actor_company_id uuid,
  visibility post_visibility,
  body_md text,
  media jsonb,
  job_id uuid,
  applies_enabled boolean,
  like_count integer,
  comment_count integer,
  share_count integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_prefs record;
BEGIN
  -- Ensure preferences exist
  PERFORM ensure_community_preferences(p_user_id);
  
  -- Get user preferences
  SELECT * INTO v_prefs 
  FROM community_preferences 
  WHERE user_id = p_user_id;
  
  RETURN QUERY
  SELECT p.id, p.post_kind, p.actor_user_id, p.actor_company_id,
         p.visibility, p.body_md, p.media, p.job_id, p.applies_enabled,
         p.like_count, p.comment_count, p.share_count,
         p.created_at, p.updated_at
  FROM community_posts p
  WHERE 
    -- Check visibility
    can_view_community_post(p.id, p_user_id)
    -- Apply user preferences
    AND (
      (v_prefs.show_job_shares OR p.post_kind != 'job_share') AND
      (v_prefs.show_company_posts OR p.actor_company_id IS NULL) AND
      (v_prefs.show_user_posts OR p.actor_user_id IS NULL)
    )
    -- Apply muted filters
    AND (p.actor_user_id IS NULL OR NOT (p.actor_user_id = ANY(v_prefs.muted_user_ids)))
    AND (p.actor_company_id IS NULL OR NOT (p.actor_company_id = ANY(v_prefs.muted_company_ids)))
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Get or set user community preferences
CREATE OR REPLACE FUNCTION get_community_preferences(p_user_id uuid)
RETURNS community_preferences
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_prefs community_preferences;
BEGIN
  PERFORM ensure_community_preferences(p_user_id);
  
  SELECT * INTO v_prefs 
  FROM community_preferences 
  WHERE user_id = p_user_id;
  
  RETURN v_prefs;
END;
$$;

CREATE OR REPLACE FUNCTION set_community_preferences(
  p_user_id uuid,
  p_show_job_shares boolean DEFAULT NULL,
  p_show_company_posts boolean DEFAULT NULL,
  p_show_user_posts boolean DEFAULT NULL,
  p_origin_filter text DEFAULT NULL,
  p_radius_km integer DEFAULT NULL,
  p_muted_company_ids uuid[] DEFAULT NULL,
  p_muted_user_ids uuid[] DEFAULT NULL
)
RETURNS community_preferences
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_prefs community_preferences;
BEGIN
  PERFORM ensure_community_preferences(p_user_id);
  
  UPDATE community_preferences
  SET 
    show_job_shares = COALESCE(p_show_job_shares, show_job_shares),
    show_company_posts = COALESCE(p_show_company_posts, show_company_posts),
    show_user_posts = COALESCE(p_show_user_posts, show_user_posts),
    origin_filter = COALESCE(p_origin_filter, origin_filter),
    radius_km = COALESCE(p_radius_km, radius_km),
    muted_company_ids = COALESCE(p_muted_company_ids, muted_company_ids),
    muted_user_ids = COALESCE(p_muted_user_ids, muted_user_ids),
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_prefs;
  
  RETURN v_prefs;
END;
$$;

-- Apply to a job from community post
CREATE OR REPLACE FUNCTION apply_from_community_post(
  p_post_id uuid,
  p_applicant_user_id uuid,
  p_full_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_cv_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_job_id uuid;
  v_company_id uuid;
  v_application_id uuid;
BEGIN
  -- Get job info from post
  SELECT job_id, actor_company_id
  INTO v_job_id, v_company_id
  FROM community_posts
  WHERE id = p_post_id AND post_kind = 'job_share' AND applies_enabled = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post is not a job share or applications are not enabled';
  END IF;
  
  -- Create application (assuming you have an applications table)
  INSERT INTO applications (
    job_id, candidate_id, company_id, source, stage
  ) VALUES (
    v_job_id, p_applicant_user_id, v_company_id, 'community_post', 'new'
  )
  RETURNING id INTO v_application_id;
  
  RETURN v_application_id;
END;
$$;