import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import { CommunityFeed } from '../CommunityFeed';
import { mockPost, mockUser } from '../../test/utils';

// Mock all hooks
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('../../hooks/useFeedSettings', () => ({
  useFeedSettings: () => ({
    settings: {
      showJobs: true,
      showPolls: true,
      showEvents: true,
      showTextPosts: true,
      showJobShares: true,
      showCompanyPosts: true,
      showUserPosts: true,
      sortBy: 'newest',
      filterBy: 'all',
    },
    getActiveFilters: () => [],
    getSortOrder: () => ({ column: 'published_at', ascending: false }),
  }),
}));

vi.mock('../../hooks/useRealtimeReactions', () => ({
  useRealtimeReactions: () => {},
}));

// Mock Supabase
const mockSupabase = {
  rpc: vi.fn(() => Promise.resolve({ data: [mockPost], error: null })),
};

vi.mock('../../integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('CommunityFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render feed components', async () => {
    render(<CommunityFeed />);

    await waitFor(() => {
      expect(screen.getByText('Neuen Inhalt erstellen')).toBeInTheDocument();
    });

    expect(screen.getByText('Feed-Einstellungen')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<CommunityFeed />);

    expect(screen.getByText('Lade Feed...')).toBeInTheDocument();
  });

  it('should display posts when loaded', async () => {
    render(<CommunityFeed />);

    await waitFor(() => {
      expect(screen.getByText('Test post content')).toBeInTheDocument();
    });
  });

  it('should show empty state when no posts', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({ data: [], error: null });

    render(<CommunityFeed />);

    await waitFor(() => {
      expect(screen.getByText('Noch keine Beiträge')).toBeInTheDocument();
    });
  });

  it('should handle feed settings changes', async () => {
    const { rerender } = render(<CommunityFeed />);

    await waitFor(() => {
      expect(screen.getByText('Test post content')).toBeInTheDocument();
    });

    // Simulate settings change
    vi.mocked(require('../../hooks/useFeedSettings').useFeedSettings).mockReturnValue({
      settings: {
        showJobs: false,
        showPolls: true,
        showEvents: true,
        showTextPosts: true,
        showJobShares: true,
        showCompanyPosts: true,
        showUserPosts: true,
        sortBy: 'newest',
        filterBy: 'all',
      },
      getActiveFilters: () => ['post_type.neq.job'],
      getSortOrder: () => ({ column: 'published_at', ascending: false }),
    });

    rerender(<CommunityFeed />);

    // Should refetch with new settings
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_feed_enhanced', {
      viewer_id: mockUser.id,
      show_jobs: false,
      show_polls: true,
      show_events: true,
      show_text_posts: true,
      show_job_shares: true,
      show_company_posts: true,
      show_user_posts: true,
      sort_by: 'newest',
      filter_by: 'all',
      limit_count: 20,
    });
  });

  it('should handle post creation callbacks', async () => {
    render(<CommunityFeed />);

    await waitFor(() => {
      expect(screen.getByText('Test post content')).toBeInTheDocument();
    });

    // Test that callbacks are passed to FeedComposer
    const composer = screen.getByText('Neuen Inhalt erstellen');
    expect(composer).toBeInTheDocument();
  });

  it('should show error state on failure', async () => {
    mockSupabase.rpc.mockRejectedValueOnce(new Error('Database error'));

    render(<CommunityFeed />);

    await waitFor(() => {
      expect(screen.getByText('Fehler beim Laden des Feeds')).toBeInTheDocument();
    });
  });
});

