-- Groups & PDF Q&A System
-- =======================

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('course','exam','profession')) NOT NULL,
  visibility TEXT CHECK (visibility IN ('public','private','hidden')) NOT NULL DEFAULT 'public',
  school TEXT,
  course_code TEXT,
  region TEXT,
  cover_image TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','moderator','member')) DEFAULT 'member',
  status TEXT CHECK (status IN ('active','pending','banned')) DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Posts (Threads/Fragen/Ressourcen/Events/Polls)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('thread','question','resource','event','poll')) NOT NULL,
  title TEXT,
  body TEXT,
  meta JSONB DEFAULT '{}',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Files (Resources)
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  byte_size BIGINT,
  checksum TEXT,
  version INTEGER DEFAULT 1,
  storage_path TEXT NOT NULL,
  source TEXT,
  license TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS files_unique_checksum ON files(checksum);

-- File pages (for PDF processing)
CREATE TABLE IF NOT EXISTS file_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  text TEXT,
  bbox JSONB, -- optional layout data
  thumb_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS file_pages_fts ON file_pages USING gin(to_tsvector('simple', coalesce(text,'')));

-- Questions (PDF-bound optional)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  page_id UUID REFERENCES file_pages(id) ON DELETE SET NULL,
  anchor JSONB, -- {x,y,w,h} relative to page
  title TEXT NOT NULL,
  body TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('open','answered','solved','outdated')) DEFAULT 'open',
  accepted_answer_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Answers
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Annotations (not necessarily questions)
CREATE TABLE IF NOT EXISTS annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  page_id UUID REFERENCES file_pages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  anchor JSONB, -- {x,y,w,h}
  quote TEXT,
  note TEXT,
  visibility TEXT CHECK (visibility IN ('private','group')) DEFAULT 'group',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Votes (Questions, Answers, Posts)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT CHECK (entity_type IN ('post','question','answer')),
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  value SMALLINT CHECK (value IN (-1,1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (entity_type, entity_id, user_id)
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT,
  entity_id UUID,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT,
  payload JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Credits/Token system
CREATE TABLE IF NOT EXISTS credit_wallets (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_visibility ON groups(visibility);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_files_group_id ON files(group_id);
CREATE INDEX IF NOT EXISTS idx_file_pages_file_id ON file_pages(file_id);
CREATE INDEX IF NOT EXISTS idx_questions_group_id ON questions(group_id);
CREATE INDEX IF NOT EXISTS idx_questions_file_id ON questions(file_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_annotations_file_id ON annotations(file_id);
CREATE INDEX IF NOT EXISTS idx_votes_entity ON votes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Groups policies
CREATE POLICY "Public groups are viewable by everyone" ON groups
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Private groups are viewable by members" ON groups
  FOR SELECT USING (
    visibility = 'private' AND 
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = groups.id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Hidden groups are viewable by members" ON groups
  FOR SELECT USING (
    visibility = 'hidden' AND 
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = groups.id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group owners can update their groups" ON groups
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = groups.id AND gm.user_id = auth.uid() AND gm.role = 'owner')
  );

-- Group members policies
CREATE POLICY "Group members can view memberships" ON group_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Users can join public groups" ON group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM groups g WHERE g.id = group_id AND g.visibility = 'public')
  );

CREATE POLICY "Group owners can manage memberships" ON group_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role IN ('owner', 'moderator'))
  );

-- Posts policies
CREATE POLICY "Group members can view posts" ON posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = posts.group_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Group members can create posts" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = posts.group_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Authors can update their posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Group moderators can manage posts" ON posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = posts.group_id AND gm.user_id = auth.uid() AND gm.role IN ('owner', 'moderator'))
  );

-- Files policies
CREATE POLICY "Group members can view files" ON files
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = files.group_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Group members can upload files" ON files
  FOR INSERT WITH CHECK (
    auth.uid() = uploader_id AND
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = files.group_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

-- File pages policies
CREATE POLICY "Group members can view file pages" ON file_pages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM files f JOIN group_members gm ON f.group_id = gm.group_id WHERE f.id = file_pages.file_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

-- Questions policies
CREATE POLICY "Group members can view questions" ON questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = questions.group_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Group members can create questions" ON questions
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = questions.group_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Authors can update their questions" ON questions
  FOR UPDATE USING (auth.uid() = author_id);

-- Answers policies
CREATE POLICY "Group members can view answers" ON answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM questions q JOIN group_members gm ON q.group_id = gm.group_id WHERE q.id = answers.question_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Group members can create answers" ON answers
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM questions q JOIN group_members gm ON q.group_id = gm.group_id WHERE q.id = answers.question_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Authors can update their answers" ON answers
  FOR UPDATE USING (auth.uid() = author_id);

-- Annotations policies
CREATE POLICY "Group members can view annotations" ON annotations
  FOR SELECT USING (
    visibility = 'group' AND
    EXISTS (SELECT 1 FROM files f JOIN group_members gm ON f.group_id = gm.group_id WHERE f.id = annotations.file_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

CREATE POLICY "Users can view their private annotations" ON annotations
  FOR SELECT USING (auth.uid() = author_id AND visibility = 'private');

CREATE POLICY "Group members can create annotations" ON annotations
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM files f JOIN group_members gm ON f.group_id = gm.group_id WHERE f.id = annotations.file_id AND gm.user_id = auth.uid() AND gm.status = 'active')
  );

-- Votes policies
CREATE POLICY "Group members can vote" ON votes
  FOR ALL USING (
    auth.uid() = user_id AND
    (
      (entity_type = 'post' AND EXISTS (SELECT 1 FROM posts p JOIN group_members gm ON p.group_id = gm.group_id WHERE p.id = votes.entity_id AND gm.user_id = auth.uid() AND gm.status = 'active')) OR
      (entity_type = 'question' AND EXISTS (SELECT 1 FROM questions q JOIN group_members gm ON q.group_id = gm.group_id WHERE q.id = votes.entity_id AND gm.user_id = auth.uid() AND gm.status = 'active')) OR
      (entity_type = 'answer' AND EXISTS (SELECT 1 FROM answers a JOIN questions q ON a.question_id = q.id JOIN group_members gm ON q.group_id = gm.group_id WHERE a.id = votes.entity_id AND gm.user_id = auth.uid() AND gm.status = 'active'))
    )
  );

-- Reports policies
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view reports" ON reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.user_id = auth.uid() AND gm.role IN ('owner', 'moderator'))
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Credits policies
CREATE POLICY "Users can view their credits" ON credit_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their credit transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Functions

-- Function to check if user is group member
CREATE OR REPLACE FUNCTION is_group_member(p_group_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = p_group_id 
    AND user_id = p_user_id 
    AND status = 'active'
  );
$$;

-- Function to check if user is group moderator
CREATE OR REPLACE FUNCTION is_group_moderator(p_group_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = p_group_id 
    AND user_id = p_user_id 
    AND role IN ('owner', 'moderator')
    AND status = 'active'
  );
$$;

-- Function to get group member count
CREATE OR REPLACE FUNCTION get_group_member_count(p_group_id UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM group_members 
  WHERE group_id = p_group_id 
  AND status = 'active';
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(p_user_id UUID, p_kind TEXT, p_payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, kind, payload)
  VALUES (p_user_id, p_kind, p_payload)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to update question status when answer is accepted
CREATE OR REPLACE FUNCTION update_question_status_on_answer_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If answer is being accepted, update question status
  IF NEW.is_accepted = true AND OLD.is_accepted = false THEN
    UPDATE questions 
    SET status = 'solved', accepted_answer_id = NEW.id
    WHERE id = NEW.question_id;
  END IF;
  
  -- If answer is being unaccepted, update question status
  IF NEW.is_accepted = false AND OLD.is_accepted = true THEN
    UPDATE questions 
    SET status = 'answered', accepted_answer_id = NULL
    WHERE id = NEW.question_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for answer acceptance
CREATE TRIGGER trigger_update_question_status_on_answer_accept
  AFTER UPDATE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_status_on_answer_accept();

-- Function to add credits to user
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_delta INTEGER, p_reason TEXT, p_meta JSONB DEFAULT '{}')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert transaction
  INSERT INTO credit_transactions (user_id, delta, reason, meta)
  VALUES (p_user_id, p_delta, p_reason, p_meta);
  
  -- Update wallet
  INSERT INTO credit_wallets (user_id, balance)
  VALUES (p_user_id, p_delta)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    balance = credit_wallets.balance + p_delta,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
