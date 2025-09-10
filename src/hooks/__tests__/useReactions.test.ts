import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReactions } from '../useReactions';
import { mockUser } from '../../test/utils';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
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

describe('useReactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(
      () => useReactions({ postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.counts).toEqual({});
    expect(result.current.userReaction).toBeNull();
    expect(result.current.totalCount).toBe(0);
    expect(result.current.mostPopular).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should load initial reactions and counts', async () => {
    const mockReactions = [
      { post_id: 'test-post-id', user_id: 'test-user-id', type: 'like' },
    ];
    const mockCounts = { like: 5, love: 2, laugh: 1 };

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockReactions, error: null })),
      })),
    });

    const { result } = renderHook(
      () => useReactions({ 
        postId: 'test-post-id',
        initialReactions: mockReactions,
        initialCounts: mockCounts
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.counts).toEqual(mockCounts);
      expect(result.current.userReaction).toBe('like');
      expect(result.current.totalCount).toBe(8);
    });
  });

  it('should toggle reaction optimistically', async () => {
    const { result } = renderHook(
      () => useReactions({ postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.toggleReaction('like');

    expect(result.current.userReaction).toBe('like');
    expect(result.current.counts.like).toBe(1);
  });

  it('should handle reaction toggle errors', async () => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn(() => Promise.resolve({ data: null, error: new Error('Database error') })),
    });

    const { result } = renderHook(
      () => useReactions({ postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.toggleReaction('like');

    await waitFor(() => {
      expect(result.current.userReaction).toBeNull();
    });
  });

  it('should calculate most popular reaction', async () => {
    const mockCounts = { like: 10, love: 5, laugh: 15, wow: 3, sad: 1, angry: 0 };

    const { result } = renderHook(
      () => useReactions({ 
        postId: 'test-post-id',
        initialCounts: mockCounts
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.mostPopular).toEqual({ type: 'laugh', count: 15 });
    });
  });
});

