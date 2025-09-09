import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeedComposerProvider } from '@/components/feed/ComposerProvider';
import { FeedComposer } from '@/components/feed/FeedComposer';
import { PersonMiniCard } from '@/components/cards/PersonMiniCard';
import { CompanyMiniCard } from '@/components/cards/CompanyMiniCard';
import { AvatarClickable } from '@/components/common/AvatarClickable';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}));

// Mock auth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' }
  })
}));

// Mock i18n
vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('Community Features', () => {
  it('should render feed composer with tabs', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <FeedComposerProvider>
          <FeedComposer />
        </FeedComposerProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('feed.composer.tab_post')).toBeInTheDocument();
    expect(screen.getByText('feed.composer.tab_poll')).toBeInTheDocument();
    expect(screen.getByText('feed.composer.tab_event')).toBeInTheDocument();
  });

  it('should render person mini card with German labels', () => {
    const mockPerson = {
      id: 'person-1',
      display_name: 'Max Mustermann',
      headline: 'Softwareentwickler',
      avatar_url: null,
      verified: false,
      follower_count: 42,
      is_following: false,
      is_connected: false,
      connection_status: undefined,
    };

    render(<PersonMiniCard person={mockPerson} />);

    expect(screen.getByText('Max Mustermann')).toBeInTheDocument();
    expect(screen.getByText('Softwareentwickler')).toBeInTheDocument();
    expect(screen.getByText('widgets.connect')).toBeInTheDocument();
    expect(screen.getByText('🙂')).toBeInTheDocument();
  });

  it('should render company mini card with German labels', () => {
    const mockCompany = {
      id: 'company-1',
      display_name: 'TechCorp GmbH',
      headline: 'Software & IT',
      avatar_url: null,
      verified: true,
      follower_count: 150,
      is_following: false,
    };

    render(<CompanyMiniCard company={mockCompany} />);

    expect(screen.getByText('TechCorp GmbH')).toBeInTheDocument();
    expect(screen.getByText('Software & IT')).toBeInTheDocument();
    expect(screen.getByText('widgets.follow')).toBeInTheDocument();
    expect(screen.getByText('🏢')).toBeInTheDocument();
  });

  it('should prevent duplicate composer mounts', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <FeedComposerProvider>
          <FeedComposer />
          <FeedComposer />
        </FeedComposerProvider>
      </QueryClientProvider>
    );

    // Should only render one composer
    const composers = screen.getAllByTestId('composer');
    expect(composers).toHaveLength(1);
  });

  it('should render avatar clickable with proper accessibility', () => {
    const mockChild = <div>Avatar</div>;
    
    render(
      <AvatarClickable 
        profileId="test-profile" 
        profileType="user"
        ariaLabel="Test profile"
      >
        {mockChild}
      </AvatarClickable>
    );

    const button = screen.getByRole('link');
    expect(button).toHaveAttribute('aria-label', 'Test profile');
    expect(button).toHaveAttribute('tabIndex', '0');
  });
});
