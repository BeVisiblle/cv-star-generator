import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    display_name: 'Test User',
  },
};

// Mock auth context
const mockAuthContext = {
  user: mockUser,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  loading: false,
};

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const mockPost = {
  id: 'test-post-id',
  content: 'Test post content',
  post_type: 'text',
  status: 'published',
  visibility: 'CommunityAndCompanies',
  published_at: new Date().toISOString(),
  likes_count: 5,
  comments_count: 3,
  reactions: [],
  reaction_counts: {},
  author: {
    id: 'test-author-id',
    display_name: 'Test Author',
    headline: 'Software Developer',
    avatar_url: '',
    verified: false,
  },
};

export const mockPoll = {
  id: 'test-poll-id',
  post_id: 'test-post-id',
  question: 'Test poll question?',
  ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  multiple_choice: false,
  show_results_after_vote: true,
  options: [
    { id: 'option-1', option_text: 'Option 1', votes: 5, percentage: 50 },
    { id: 'option-2', option_text: 'Option 2', votes: 5, percentage: 50 },
  ],
  total_votes: 10,
  user_vote: [],
  is_ended: false,
  time_remaining: { days: 6, hours: 23, minutes: 59, seconds: 59 },
};

export const mockEvent = {
  id: 'test-event-id',
  post_id: 'test-post-id',
  title: 'Test Event',
  is_online: true,
  location: 'https://meet.google.com/test',
  start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  end_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
  capacity: 50,
  rsvp_count: 15,
  user_rsvp: null,
  is_full: false,
  is_past: false,
  is_ongoing: false,
  time_remaining: { days: 0, hours: 23, minutes: 59, seconds: 59 },
};

export const mockComment = {
  id: 'test-comment-id',
  content: 'Test comment',
  author: {
    id: 'test-author-id',
    display_name: 'Test Author',
    avatar_url: '',
    verified: false,
  },
  created_at: new Date().toISOString(),
  likes_count: 2,
  replies_count: 1,
  replies: [],
  is_liked: false,
  reactions: [],
  reaction_counts: {},
};

export const mockFeedSettings = {
  showJobs: true,
  showPolls: true,
  showEvents: true,
  showTextPosts: true,
  showJobShares: true,
  showCompanyPosts: true,
  showUserPosts: true,
  sortBy: 'newest' as const,
  filterBy: 'all' as const,
};

// Helper functions
export const createMockSupabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
});

export const createMockQueryResponse = (data: any) => ({
  data,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
});

export const createMockMutationResponse = () => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

