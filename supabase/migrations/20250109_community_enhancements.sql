-- Community Features Enhancement Migration
-- Adds missing tables for events, reactions, and enhanced social features

-- 1) Event RSVP System
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.post_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('going', 'interested', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 2) Enhanced Reactions System (beyond just likes)
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- 3) Comment Reactions
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- 4) Enhanced Poll System (multiple choice support)
ALTER TABLE public.post_polls 
ADD COLUMN IF NOT EXISTS multiple_choice boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS show_results_after_vote boolean NOT NULL DEFAULT false;

-- 5) Post Types Enhancement
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS post_type text NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'poll', 'event', 'job_share', 'media'));

-- 6) Enhanced Comments (threaded support)
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS replies_count integer DEFAULT 0;

-- 7) User Settings for Feed Preferences
CREATE TABLE IF NOT EXISTS public.user_feed_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  show_jobs_in_feed boolean NOT NULL DEFAULT true,
  show_events_in_feed boolean NOT NULL DEFAULT true,
  show_polls_in_feed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8) Notifications System
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'follow', 'connection_request', 'connection_accepted', 'event_reminder', 'poll_ended')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9) Enhanced Profiles for Companies and Users
CREATE TABLE IF NOT EXISTS public.profiles_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  profile_type text NOT NULL CHECK (profile_type IN ('person', 'company')),
  display_name text NOT NULL,
  headline text,
  avatar_url text,
  verified boolean DEFAULT false,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  post_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10) Follow System
CREATE TABLE IF NOT EXISTS public.follows_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- 11) Connection System (for networking)
CREATE TABLE IF NOT EXISTS public.connections_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feed_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections_enhanced ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Event RSVPs
CREATE POLICY "Users can view RSVPs for visible events" ON public.event_rsvps
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.post_events pe
    JOIN public.posts p ON p.id = pe.post_id
    WHERE pe.id = event_rsvps.event_id AND can_view_post(p.id, auth.uid())
  )
);

CREATE POLICY "Users can manage their own RSVPs" ON public.event_rsvps
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Post Reactions
CREATE POLICY "Users can view reactions for visible posts" ON public.post_reactions
FOR SELECT USING (can_view_post(post_id, auth.uid()));

CREATE POLICY "Users can manage their own reactions" ON public.post_reactions
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Comment Reactions
CREATE POLICY "Users can view comment reactions for visible posts" ON public.comment_reactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.post_comments pc
    JOIN public.posts p ON p.id = pc.post_id
    WHERE pc.id = comment_reactions.comment_id AND can_view_post(p.id, auth.uid())
  )
);

CREATE POLICY "Users can manage their own comment reactions" ON public.comment_reactions
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for User Feed Settings
CREATE POLICY "Users can manage their own feed settings" ON public.user_feed_settings
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Enhanced Profiles
CREATE POLICY "Users can view enhanced profiles" ON public.profiles_enhanced
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own enhanced profile" ON public.profiles_enhanced
FOR ALL USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- RLS Policies for Follows
CREATE POLICY "Users can view follows" ON public.follows_enhanced
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON public.follows_enhanced
FOR ALL USING (auth.uid() = follower_id)
WITH CHECK (auth.uid() = follower_id);

-- RLS Policies for Connections
CREATE POLICY "Users can view their own connections" ON public.connections_enhanced
FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can manage their own connections" ON public.connections_enhanced
FOR ALL USING (auth.uid() = requester_id OR auth.uid() = addressee_id)
WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON public.event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON public.comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_follows_enhanced_follower_id ON public.follows_enhanced(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_enhanced_following_id ON public.follows_enhanced(following_id);
CREATE INDEX IF NOT EXISTS idx_connections_enhanced_requester_id ON public.connections_enhanced(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_enhanced_addressee_id ON public.connections_enhanced(addressee_id);

-- Triggers for maintaining counts
CREATE OR REPLACE FUNCTION public.update_post_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET likes_count = (
      SELECT COUNT(*) FROM public.post_reactions 
      WHERE post_id = NEW.post_id AND reaction_type = 'like'
    )
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET likes_count = (
      SELECT COUNT(*) FROM public.post_reactions 
      WHERE post_id = OLD.post_id AND reaction_type = 'like'
    )
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_post_reaction_counts
AFTER INSERT OR DELETE ON public.post_reactions
FOR EACH ROW EXECUTE FUNCTION public.update_post_reaction_counts();

-- Trigger for comment reaction counts
CREATE OR REPLACE FUNCTION public.update_comment_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.post_comments 
    SET likes_count = (
      SELECT COUNT(*) FROM public.comment_reactions 
      WHERE comment_id = NEW.comment_id AND reaction_type = 'like'
    )
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.post_comments 
    SET likes_count = (
      SELECT COUNT(*) FROM public.comment_reactions 
      WHERE comment_id = OLD.comment_id AND reaction_type = 'like'
    )
    WHERE id = OLD.comment_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_comment_reaction_counts
AFTER INSERT OR DELETE ON public.comment_reactions
FOR EACH ROW EXECUTE FUNCTION public.update_comment_reaction_counts();

-- Trigger for comment reply counts
CREATE OR REPLACE FUNCTION public.update_comment_reply_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_comment_id IS NOT NULL THEN
      UPDATE public.post_comments 
      SET replies_count = replies_count + 1
      WHERE id = NEW.parent_comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.parent_comment_id IS NOT NULL THEN
      UPDATE public.post_comments 
      SET replies_count = replies_count - 1
      WHERE id = OLD.parent_comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_comment_reply_counts
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_comment_reply_counts();

-- RPC Functions for enhanced features
CREATE OR REPLACE FUNCTION public.get_feed_enhanced(
  viewer_id uuid,
  after_published timestamptz DEFAULT NULL,
  after_id uuid DEFAULT NULL,
  limit_count int DEFAULT 20,
  show_jobs boolean DEFAULT true
)
RETURNS TABLE (
  id uuid,
  content text,
  post_type text,
  author_id uuid,
  author_type text,
  published_at timestamptz,
  created_at timestamptz,
  status text,
  visibility text,
  likes_count integer,
  comments_count integer,
  poll_data jsonb,
  event_data jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.content,
    p.post_type,
    p.author_id,
    p.author_type,
    p.published_at,
    p.created_at,
    p.status,
    p.visibility,
    p.likes_count,
    p.comments_count,
    CASE 
      WHEN p.post_type = 'poll' THEN
        jsonb_build_object(
          'question', pp.question,
          'ends_at', pp.ends_at,
          'multiple_choice', pp.multiple_choice,
          'show_results_after_vote', pp.show_results_after_vote,
          'options', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', ppo.id,
                'text', ppo.option_text,
                'votes', (
                  SELECT COUNT(*) FROM public.post_poll_votes ppv 
                  WHERE ppv.option_id = ppo.id
                )
              )
            )
            FROM public.post_poll_options ppo 
            WHERE ppo.poll_id = pp.id
          )
        )
      ELSE NULL
    END as poll_data,
    CASE 
      WHEN p.post_type = 'event' THEN
        jsonb_build_object(
          'title', pe.title,
          'is_online', pe.is_online,
          'location', pe.location,
          'link_url', pe.link_url,
          'start_at', pe.start_at,
          'end_at', pe.end_at,
          'rsvp_count', (
            SELECT COUNT(*) FROM public.event_rsvps er 
            WHERE er.event_id = pe.id AND er.status = 'going'
          )
        )
      ELSE NULL
    END as event_data
  FROM public.posts p
  LEFT JOIN public.post_polls pp ON p.id = pp.post_id
  LEFT JOIN public.post_events pe ON p.id = pe.post_id
  WHERE p.status = 'published'
    AND can_view_post(p.id, viewer_id)
    AND (show_jobs OR p.post_type != 'job_share')
    AND (after_published IS NULL OR (p.published_at, p.id) < (after_published, after_id))
  ORDER BY p.published_at DESC, p.id DESC
  LIMIT greatest(limit_count, 1);
$$;

-- Function to get interesting people/companies
CREATE OR REPLACE FUNCTION public.get_interesting_profiles(
  viewer_id uuid,
  profile_type text,
  limit_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  profile_id uuid,
  profile_type text,
  display_name text,
  headline text,
  avatar_url text,
  verified boolean,
  follower_count integer,
  is_following boolean,
  is_connected boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pe.id,
    pe.profile_id,
    pe.profile_type,
    pe.display_name,
    pe.headline,
    pe.avatar_url,
    pe.verified,
    pe.follower_count,
    EXISTS(
      SELECT 1 FROM public.follows_enhanced fe 
      WHERE fe.follower_id = viewer_id AND fe.following_id = pe.profile_id
    ) as is_following,
    EXISTS(
      SELECT 1 FROM public.connections_enhanced ce 
      WHERE (ce.requester_id = viewer_id AND ce.addressee_id = pe.profile_id AND ce.status = 'accepted')
         OR (ce.addressee_id = viewer_id AND ce.requester_id = pe.profile_id AND ce.status = 'accepted')
    ) as is_connected
  FROM public.profiles_enhanced pe
  WHERE pe.profile_type = get_interesting_profiles.profile_type
    AND pe.profile_id != viewer_id
  ORDER BY pe.follower_count DESC, pe.created_at DESC
  LIMIT limit_count;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_feed_enhanced TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_interesting_profiles TO authenticated;

-- Insert some sample data for testing
INSERT INTO public.profiles_enhanced (profile_id, profile_type, display_name, headline, avatar_url, verified, follower_count)
VALUES 
  (gen_random_uuid(), 'person', 'Max Mustermann', 'Software Entwickler bei TechCorp', null, false, 150),
  (gen_random_uuid(), 'person', 'Anna Schmidt', 'UX Designer & Community Manager', null, true, 89),
  (gen_random_uuid(), 'company', 'TechCorp GmbH', 'Innovative Software-Lösungen für Unternehmen', null, true, 1200),
  (gen_random_uuid(), 'company', 'StartupHub Berlin', 'Dein Partner für erfolgreiche Gründungen', null, false, 450)
ON CONFLICT (profile_id) DO NOTHING;

SELECT 'Community enhancements migration completed successfully!' as status;
