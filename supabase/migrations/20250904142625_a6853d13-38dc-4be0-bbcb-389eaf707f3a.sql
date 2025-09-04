-- Add RLS policies for the newly created tables

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

-- File pages policies
CREATE POLICY "Group members can view file pages" 
ON public.file_pages FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.group_members gm
  JOIN public.files f ON gm.group_id = f.group_id
  WHERE f.id = file_pages.file_id AND gm.status = 'active'
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

-- Annotations policies
CREATE POLICY "Group members can view group annotations" 
ON public.annotations FOR SELECT 
USING (
  visibility = 'group' AND auth.uid() IN (
    SELECT user_id FROM public.group_members gm
    JOIN public.files f ON gm.group_id = f.group_id
    WHERE f.id = annotations.file_id AND gm.status = 'active'
  ) OR (
    visibility = 'private' AND auth.uid() = author_id
  )
);

CREATE POLICY "Group members can create annotations" 
ON public.annotations FOR INSERT 
WITH CHECK (auth.uid() = author_id AND auth.uid() IN (
  SELECT user_id FROM public.group_members gm
  JOIN public.files f ON gm.group_id = f.group_id
  WHERE f.id = annotations.file_id AND gm.status = 'active'
));

-- Create indexes for better performance
CREATE INDEX idx_groups_type ON public.groups(type);
CREATE INDEX idx_groups_visibility ON public.groups(visibility);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_files_group_id ON public.files(group_id);
CREATE INDEX idx_questions_group_id ON public.questions(group_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);