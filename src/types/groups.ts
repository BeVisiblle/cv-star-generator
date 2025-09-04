// Groups & PDF Q&A System Types
// =============================

export interface Group {
  id: string;
  title: string;
  description?: string;
  type: 'course' | 'exam' | 'profession';
  visibility: 'public' | 'private' | 'hidden';
  school?: string;
  course_code?: string;
  region?: string;
  cover_image?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  last_activity?: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'owner' | 'moderator' | 'member';
  status: 'active' | 'pending' | 'banned';
  joined_at: string;
  user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface Post {
  id: string;
  group_id: string;
  author_id?: string;
  type: 'thread' | 'question' | 'resource' | 'event' | 'poll';
  title?: string;
  body?: string;
  meta: Record<string, any>;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  vote_count?: number;
  user_vote?: number;
  comment_count?: number;
}

export interface File {
  id: string;
  group_id: string;
  uploader_id?: string;
  filename: string;
  mime_type?: string;
  byte_size?: number;
  checksum: string;
  version: number;
  storage_path: string;
  source?: string;
  license?: string;
  created_at: string;
  uploader?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  page_count?: number;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface FilePage {
  id: string;
  file_id: string;
  page_number: number;
  text?: string;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  thumb_path?: string;
  created_at: string;
}

export interface Question {
  id: string;
  group_id: string;
  author_id?: string;
  file_id?: string;
  page_id?: string;
  anchor?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  title: string;
  body?: string;
  tags: string[];
  status: 'open' | 'answered' | 'solved' | 'outdated';
  accepted_answer_id?: string;
  created_at: string;
  author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  answer_count?: number;
  vote_count?: number;
  user_vote?: number;
  file?: File;
  page?: FilePage;
}

export interface Answer {
  id: string;
  question_id: string;
  author_id?: string;
  body: string;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  vote_count?: number;
  user_vote?: number;
}

export interface Annotation {
  id: string;
  file_id: string;
  page_id: string;
  author_id?: string;
  anchor: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quote?: string;
  note?: string;
  visibility: 'private' | 'group';
  created_at: string;
  author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface Vote {
  id: string;
  entity_type: 'post' | 'question' | 'answer';
  entity_id: string;
  user_id: string;
  value: -1 | 1;
  created_at: string;
}

export interface Report {
  id: string;
  entity_type: string;
  entity_id: string;
  reporter_id?: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  kind: string;
  payload: Record<string, any>;
  read_at?: string;
  created_at: string;
}

export interface CreditWallet {
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  delta: number;
  reason: string;
  meta: Record<string, any>;
  created_at: string;
}

// API Request/Response Types
export interface CreateGroupRequest {
  title: string;
  description?: string;
  type: 'course' | 'exam' | 'profession';
  visibility: 'public' | 'private' | 'hidden';
  school?: string;
  course_code?: string;
  region?: string;
  cover_image?: string;
}

export interface UpdateGroupRequest {
  title?: string;
  description?: string;
  visibility?: 'public' | 'private' | 'hidden';
  school?: string;
  course_code?: string;
  region?: string;
  cover_image?: string;
}

export interface JoinGroupRequest {
  group_id: string;
}

export interface CreatePostRequest {
  group_id: string;
  type: 'thread' | 'question' | 'resource' | 'event' | 'poll';
  title?: string;
  body?: string;
  meta?: Record<string, any>;
}

export interface CreateQuestionRequest {
  group_id: string;
  file_id?: string;
  page_id?: string;
  anchor?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  title: string;
  body?: string;
  tags?: string[];
}

export interface CreateAnswerRequest {
  question_id: string;
  body: string;
}

export interface CreateAnnotationRequest {
  file_id: string;
  page_id: string;
  anchor: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quote?: string;
  note?: string;
  visibility?: 'private' | 'group';
}

export interface VoteRequest {
  entity_type: 'post' | 'question' | 'answer';
  entity_id: string;
  value: -1 | 1;
}

export interface ReportRequest {
  entity_type: string;
  entity_id: string;
  reason: string;
}

// Search and Filter Types
export interface GroupFilters {
  type?: 'course' | 'exam' | 'profession';
  visibility?: 'public' | 'private' | 'hidden';
  school?: string;
  region?: string;
  search?: string;
}

export interface PostFilters {
  type?: 'thread' | 'question' | 'resource' | 'event' | 'poll';
  pinned?: boolean;
  author_id?: string;
  tags?: string[];
}

export interface QuestionFilters {
  status?: 'open' | 'answered' | 'solved' | 'outdated';
  file_id?: string;
  tags?: string[];
  author_id?: string;
}

// PDF Processing Types
export interface PDFProcessingResult {
  file_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pages: FilePage[];
  error?: string;
}

export interface PDFSearchResult {
  page_id: string;
  page_number: number;
  text: string;
  score: number;
  highlights: {
    start: number;
    end: number;
  }[];
}

// UI Component Props
export interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
  showActions?: boolean;
}

export interface QuestionCardProps {
  question: Question;
  onAnswer?: (questionId: string) => void;
  onVote?: (questionId: string, value: number) => void;
  onAcceptAnswer?: (answerId: string) => void;
  showActions?: boolean;
}

export interface AnswerCardProps {
  answer: Answer;
  questionId: string;
  onVote?: (answerId: string, value: number) => void;
  onAccept?: (answerId: string) => void;
  canAccept?: boolean;
  showActions?: boolean;
}

export interface PDFViewerProps {
  file: File;
  onQuestionCreate?: (pageId: string, anchor: any) => void;
  onAnnotationCreate?: (pageId: string, anchor: any) => void;
  initialPage?: number;
}

export interface PageThumbnailsProps {
  file: File;
  currentPage: number;
  onPageSelect: (pageNumber: number) => void;
}

export interface PDFSidebarProps {
  file: File;
  currentPage: number;
  questions: Question[];
  annotations: Annotation[];
  onQuestionCreate: (pageId: string, anchor: any) => void;
  onAnnotationCreate: (pageId: string, anchor: any) => void;
  onQuestionClick: (questionId: string) => void;
  onAnnotationClick: (annotationId: string) => void;
}
