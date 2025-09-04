-- Create missing posts table for groups
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL,
  author_id uuid,
  type text NOT NULL DEFAULT 'thread',
  title text,
  body text,
  meta jsonb NOT NULL DEFAULT '{}',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Group members can view posts" 
ON public.posts 
FOR SELECT 
USING (auth.uid() IN (
  SELECT gm.user_id 
  FROM group_members gm 
  WHERE gm.group_id = posts.group_id 
  AND gm.status = 'active'
));

CREATE POLICY "Group members can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (
  auth.uid() = author_id 
  AND auth.uid() IN (
    SELECT gm.user_id 
    FROM group_members gm 
    WHERE gm.group_id = posts.group_id 
    AND gm.status = 'active'
  )
);

CREATE POLICY "Authors can update their posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = author_id);

-- Create profiles table for user info (referenced in file uploads)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON public.posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);