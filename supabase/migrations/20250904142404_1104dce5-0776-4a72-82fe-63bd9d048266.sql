-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'study' CHECK (type IN ('study', 'professional', 'interest')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'hidden')),
  school TEXT,
  course_code TEXT,
  region TEXT,
  cover_image TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'thread' CHECK (type IN ('thread', 'question', 'resource', 'event', 'poll')),
  title TEXT,
  body TEXT,
  meta JSONB DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create files table
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  byte_size INTEGER,
  checksum TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  storage_path TEXT NOT NULL,
  source TEXT,
  license TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create file_pages table
CREATE TABLE public.file_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  text TEXT,
  bbox JSONB,
  thumb_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.file_pages(id) ON DELETE CASCADE,
  anchor JSONB,
  title TEXT NOT NULL,
  body TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'solved', 'outdated')),
  accepted_answer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create annotations table
CREATE TABLE public.annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES public.file_pages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anchor JSONB NOT NULL,
  quote TEXT,
  note TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'group')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Public groups are viewable by everyone" 
ON public.groups FOR SELECT 
USING (visibility = 'public' OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can create groups" 
ON public.groups FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
ON public.groups FOR UPDATE 
USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Group members can view their memberships" 
ON public.group_members FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT user_id FROM public.group_members gm 
  WHERE gm.group_id = group_members.group_id AND gm.role IN ('owner', 'moderator')
));

CREATE POLICY "Users can join groups" 
ON public.group_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Group members can view posts" 
ON public.posts FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.group_members 
  WHERE group_id = posts.group_id AND status = 'active'
));

CREATE POLICY "Group members can create posts" 
ON public.posts FOR INSERT 
WITH CHECK (auth.uid() = author_id AND auth.uid() IN (
  SELECT user_id FROM public.group_members 
  WHERE group_id = posts.group_id AND status = 'active'
));

-- Files policies
CREATE POLICY "Group members can view files" 
ON public.files FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.group_members 
  WHERE group_id = files.group_id AND status = 'active'
));

CREATE POLICY "Group members can upload files" 
ON public.files FOR INSERT 
WITH CHECK (auth.uid() = uploader_id AND auth.uid() IN (
  SELECT user_id FROM public.group_members 
  WHERE group_id = files.group_id AND status = 'active'
));

-- Questions policies
CREATE POLICY "Group members can view questions" 
ON public.questions FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.group_members 
  WHERE group_id = questions.group_id AND status = 'active'
));

CREATE POLICY "Group members can create questions" 
ON public.questions FOR INSERT 
WITH CHECK (auth.uid() = author_id AND auth.uid() IN (
  SELECT user_id FROM public.group_members 
  WHERE group_id = questions.group_id AND status = 'active'
));

-- Answers policies
CREATE POLICY "Users can view answers to questions they can see" 
ON public.answers FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.group_members gm
  JOIN public.questions q ON gm.group_id = q.group_id
  WHERE q.id = answers.question_id AND gm.status = 'active'
));

CREATE POLICY "Group members can create answers" 
ON public.answers FOR INSERT 
WITH CHECK (auth.uid() = author_id AND auth.uid() IN (
  SELECT user_id FROM public.group_members gm
  JOIN public.questions q ON gm.group_id = q.group_id
  WHERE q.id = answers.question_id AND gm.status = 'active'
));

-- Create indexes for better performance
CREATE INDEX idx_groups_type ON public.groups(type);
CREATE INDEX idx_groups_visibility ON public.groups(visibility);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_posts_group_id ON public.posts(group_id);
CREATE INDEX idx_files_group_id ON public.files(group_id);
CREATE INDEX idx_questions_group_id ON public.questions(group_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);