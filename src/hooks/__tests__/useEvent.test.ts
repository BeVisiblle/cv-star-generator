import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvent } from '../useEvent';
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

describe('useEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(
      () => useEvent({ eventId: 'test-event-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.event).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should load event data successfully', async () => {
    const mockEventData = {
      id: 'test-event-id',
      post_id: 'test-post-id',
      title: 'Test Event',
      is_online: true,
      location: 'https://meet.google.com/test',
      start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      capacity: 50,
    };

    const mockRsvpData = [
      { status: 'going' },
      { status: 'going' },
      { status: 'interested' },
    ];

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'post_events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockEventData, error: null })),
            })),
          })),
        };
      }
      if (table === 'event_rsvps') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: mockRsvpData, error: null })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    const { result } = renderHook(
      () => useEvent({ eventId: 'test-event-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.event).toBeDefined();
    expect(result.current.event?.title).toBe('Test Event');
    expect(result.current.event?.rsvp_count).toBe(2); // Only 'going' status
    expect(result.current.event?.is_online).toBe(true);
  });

  it('should handle RSVP', async () => {
    const { result } = renderHook(
      () => useEvent({ eventId: 'test-event-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.rsvp('going');

    expect(result.current.isRSVPing).toBe(true);
  });

  it('should prevent RSVP on past events', async () => {
    const mockEventData = {
      id: 'test-event-id',
      post_id: 'test-post-id',
      title: 'Past Event',
      is_online: true,
      location: 'https://meet.google.com/test',
      start_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      end_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      capacity: 50,
    };

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'post_events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockEventData, error: null })),
            })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    const { result } = renderHook(
      () => useEvent({ eventId: 'test-event-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.event?.is_past).toBe(true);
  });

  it('should handle full events', async () => {
    const mockEventData = {
      id: 'test-event-id',
      post_id: 'test-post-id',
      title: 'Full Event',
      is_online: true,
      location: 'https://meet.google.com/test',
      start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      capacity: 2,
    };

    const mockRsvpData = [
      { status: 'going' },
      { status: 'going' },
    ];

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'post_events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockEventData, error: null })),
            })),
          })),
        };
      }
      if (table === 'event_rsvps') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: mockRsvpData, error: null })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    const { result } = renderHook(
      () => useEvent({ eventId: 'test-event-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.event?.is_full).toBe(true);
  });

  it('should generate calendar event data', async () => {
    const mockEventData = {
      id: 'test-event-id',
      post_id: 'test-post-id',
      title: 'Test Event',
      is_online: true,
      location: 'https://meet.google.com/test',
      start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      capacity: 50,
    };

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'post_events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockEventData, error: null })),
            })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    const { result } = renderHook(
      () => useEvent({ eventId: 'test-event-id', postId: 'test-post-id' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const calendarEvent = result.current.generateCalendarEvent();
    expect(calendarEvent).toBeDefined();
    expect(calendarEvent?.title).toBe('Test Event');
    expect(calendarEvent?.location).toBe('https://meet.google.com/test');
  });
});

