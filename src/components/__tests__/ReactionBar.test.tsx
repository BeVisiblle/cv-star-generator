import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { ReactionBar } from '../feed/ReactionBar';

// Mock useReactions hook
const mockUseReactions = {
  counts: { like: 5, love: 2, laugh: 1, wow: 0, sad: 0, angry: 0 },
  userReaction: 'like',
  totalCount: 8,
  mostPopular: { type: 'like', count: 5 },
  toggleReaction: vi.fn(),
  isLoading: false,
};

vi.mock('../../hooks/useReactions', () => ({
  useReactions: () => mockUseReactions,
}));

describe('ReactionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render reaction buttons', () => {
    render(
      <ReactionBar
        postId="test-post-id"
        commentsCount={3}
        onComment={vi.fn()}
        onShare={vi.fn()}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument(); // Like count
    expect(screen.getByText('2')).toBeInTheDocument(); // Love count
    expect(screen.getByText('1')).toBeInTheDocument(); // Laugh count
    expect(screen.getByText('3')).toBeInTheDocument(); // Comments count
  });

  it('should show total reaction count', () => {
    render(
      <ReactionBar
        postId="test-post-id"
        commentsCount={3}
        onComment={vi.fn()}
        onShare={vi.fn()}
      />
    );

    expect(screen.getByText('8')).toBeInTheDocument(); // Total count
  });

  it('should handle reaction clicks', async () => {
    render(
      <ReactionBar
        postId="test-post-id"
        commentsCount={3}
        onComment={vi.fn()}
        onShare={vi.fn()}
      />
    );

    const likeButton = screen.getByRole('button', { name: /gefällt mir/i });
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(mockUseReactions.toggleReaction).toHaveBeenCalledWith('like');
    });
  });

  it('should handle comment button click', () => {
    const mockOnComment = vi.fn();
    render(
      <ReactionBar
        postId="test-post-id"
        commentsCount={3}
        onComment={mockOnComment}
        onShare={vi.fn()}
      />
    );

    const commentButton = screen.getByRole('button', { name: /kommentieren/i });
    fireEvent.click(commentButton);

    expect(mockOnComment).toHaveBeenCalledWith('test-post-id');
  });

  it('should handle share button click', () => {
    const mockOnShare = vi.fn();
    render(
      <ReactionBar
        postId="test-post-id"
        commentsCount={3}
        onComment={vi.fn()}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByRole('button', { name: /teilen/i });
    fireEvent.click(shareButton);

    expect(mockOnShare).toHaveBeenCalledWith('test-post-id');
  });

  it('should show reaction picker when enabled', () => {
    render(
      <ReactionBar
        postId="test-post-id"
        commentsCount={3}
        onComment={vi.fn()}
        onShare={vi.fn()}
        showReactionPicker={true}
      />
    );

    // Should show reaction buttons
    expect(screen.getByRole('button', { name: /gefällt mir/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /liebe/i })).toBeInTheDocument();
  });

  it('should highlight user reaction', () => {
    render(
      <ReactionBar
        postId="test-post-id"
        commentsCount={3}
        onComment={vi.fn()}
        onShare={vi.fn()}
      />
    );

    const likeButton = screen.getByRole('button', { name: /gefällt mir/i });
    expect(likeButton).toHaveClass('bg-primary'); // Should be highlighted
  });

  it('should show loading state', () => {
    const loadingMock = {
      ...mockUseReactions,
      isLoading: true,
    };

    vi.mocked(require('../../hooks/useReactions').useReactions).mockReturnValue(loadingMock);

    render(
      <ReactionBar
        postId="test-post-id"
        commentsCount={3}
        onComment={vi.fn()}
        onShare={vi.fn()}
      />
    );

    // Should show loading state
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});

