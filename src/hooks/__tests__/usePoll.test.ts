import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePoll } from '../usePoll';
import { mockUser } from '../../test/utils';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    delete: vi.fn(() => Promise.resolve({ data: [], error: null })),
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

describe('usePoll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(
      () => usePoll({ pollId: 'test-poll-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.poll).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should load poll data successfully', async () => {
    const mockPollData = {
      id: 'test-poll-id',
      post_id: 'test-post-id',
      question: 'Test poll question?',
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      multiple_choice: false,
      show_results_after_vote: true,
      post_poll_options: [
        { id: 'option-1', option_text: 'Option 1' },
        { id: 'option-2', option_text: 'Option 2' },
      ],
    };

    const mockVoteCounts = [
      { option_id: 'option-1' },
      { option_id: 'option-1' },
      { option_id: 'option-2' },
    ];

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'post_polls') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockPollData, error: null })),
            })),
          })),
        };
      }
      if (table === 'post_poll_votes') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: mockVoteCounts, error: null })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    const { result } = renderHook(
      () => usePoll({ pollId: 'test-poll-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.poll).toBeDefined();
    expect(result.current.poll?.question).toBe('Test poll question?');
    expect(result.current.poll?.total_votes).toBe(3);
  });

  it('should handle voting', async () => {
    const { result } = renderHook(
      () => usePoll({ pollId: 'test-poll-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.vote(['option-1']);

    expect(result.current.isVoting).toBe(true);
  });

  it('should prevent voting on ended polls', async () => {
    const mockPollData = {
      id: 'test-poll-id',
      post_id: 'test-post-id',
      question: 'Test poll question?',
      ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ended yesterday
      multiple_choice: false,
      show_results_after_vote: true,
      post_poll_options: [
        { id: 'option-1', option_text: 'Option 1' },
        { id: 'option-2', option_text: 'Option 2' },
      ],
    };

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'post_polls') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockPollData, error: null })),
            })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    const { result } = renderHook(
      () => usePoll({ pollId: 'test-poll-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.poll?.is_ended).toBe(true);
  });

  it('should calculate time remaining correctly', async () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const mockPollData = {
      id: 'test-poll-id',
      post_id: 'test-post-id',
      question: 'Test poll question?',
      ends_at: futureDate.toISOString(),
      multiple_choice: false,
      show_results_after_vote: true,
      post_poll_options: [],
    };

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'post_polls') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockPollData, error: null })),
            })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    const { result } = renderHook(
      () => usePoll({ pollId: 'test-poll-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.poll?.time_remaining).toBeDefined();
    expect(result.current.poll?.time_remaining?.days).toBeGreaterThan(0);
  });
});

