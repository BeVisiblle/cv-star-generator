import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeedSettings } from '../useFeedSettings';
import { mockUser } from '../../test/utils';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    upsert: vi.fn(() => Promise.resolve({ data: [], error: null })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFeedSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default settings', () => {
    const { result } = renderHook(() => useFeedSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.settings).toEqual({
      showJobs: true,
      showPolls: true,
      showEvents: true,
      showTextPosts: true,
      showJobShares: true,
      showCompanyPosts: true,
      showUserPosts: true,
      sortBy: 'newest',
      filterBy: 'all',
    });
  });

  it('should load user settings from database', async () => {
    const mockUserSettings = {
      id: 'settings-id',
      user_id: 'test-user-id',
      show_jobs: false,
      show_polls: true,
      show_events: false,
      show_text_posts: true,
      show_job_shares: false,
      show_company_posts: true,
      show_user_posts: false,
      sort_by: 'popular',
      filter_by: 'following',
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockUserSettings, error: null })),
        })),
      })),
    });

    const { result } = renderHook(() => useFeedSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings.showJobs).toBe(false);
    expect(result.current.settings.showPolls).toBe(true);
    expect(result.current.settings.showEvents).toBe(false);
    expect(result.current.settings.sortBy).toBe('popular');
    expect(result.current.settings.filterBy).toBe('following');
  });

  it('should update settings optimistically', async () => {
    const { result } = renderHook(() => useFeedSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.updateSetting('showJobs', false);

    expect(result.current.settings.showJobs).toBe(false);
    expect(result.current.isSaving).toBe(true);
  });

  it('should reset to default settings', async () => {
    const { result } = renderHook(() => useFeedSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First change a setting
    result.current.updateSetting('showJobs', false);
    expect(result.current.settings.showJobs).toBe(false);

    // Then reset
    result.current.resetToDefaults();

    expect(result.current.settings).toEqual({
      showJobs: true,
      showPolls: true,
      showEvents: true,
      showTextPosts: true,
      showJobShares: true,
      showCompanyPosts: true,
      showUserPosts: true,
      sortBy: 'newest',
      filterBy: 'all',
    });
  });

  it('should generate active filters', async () => {
    const { result } = renderHook(() => useFeedSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Disable some content types
    result.current.updateSetting('showJobs', false);
    result.current.updateSetting('showPolls', false);

    const activeFilters = result.current.getActiveFilters();
    expect(activeFilters).toContain('post_type.neq.job');
    expect(activeFilters).toContain('post_type.neq.poll');
  });

  it('should return correct sort order', async () => {
    const { result } = renderHook(() => useFeedSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test different sort orders
    result.current.updateSetting('sortBy', 'popular');
    expect(result.current.getSortOrder()).toEqual({
      column: 'likes_count',
      ascending: false,
    });

    result.current.updateSetting('sortBy', 'trending');
    expect(result.current.getSortOrder()).toEqual({
      column: 'comments_count',
      ascending: false,
    });

    result.current.updateSetting('sortBy', 'newest');
    expect(result.current.getSortOrder()).toEqual({
      column: 'published_at',
      ascending: false,
    });
  });

  it('should handle database errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: new Error('Database error') })),
        })),
      })),
    });

    const { result } = renderHook(() => useFeedSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should fall back to default settings
    expect(result.current.settings).toEqual({
      showJobs: true,
      showPolls: true,
      showEvents: true,
      showTextPosts: true,
      showJobShares: true,
      showCompanyPosts: true,
      showUserPosts: true,
      sortBy: 'newest',
      filterBy: 'all',
    });
  });
});

