import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, Repeat2, Send } from 'lucide-react';
import type { LinkedInPost } from '@/hooks/useLinkedInPosts';
import { useTogglePostLike } from '@/hooks/useLinkedInPosts';

interface PostActionsProps {
  post: LinkedInPost;
  onToggleComments: () => void;
  showComments: boolean;
}

export default function PostActions({ post, onToggleComments, showComments }: PostActionsProps) {
  const toggleLike = useTogglePostLike();

  const handleLike = () => {
    toggleLike.mutate(post.id);
  };

  const handleRepost = () => {
    // TODO: Implement repost functionality
  };

  const handleSend = () => {
    // TODO: Implement send functionality
  };

  return (
    <div className="px-2 py-1 border-t grid grid-cols-4 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 h-12 rounded-lg ${
          post.liked_by_user 
            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
            : 'text-muted-foreground hover:bg-muted'
        }`}
        onClick={handleLike}
        disabled={toggleLike.isPending}
        aria-pressed={post.liked_by_user}
      >
        <ThumbsUp 
          className={`h-5 w-5 ${post.liked_by_user ? 'fill-current' : ''}`} 
        />
        <span className="hidden sm:inline">Gefällt mir</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 h-12 rounded-lg ${
          showComments 
            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
            : 'text-muted-foreground hover:bg-muted'
        }`}
        onClick={onToggleComments}
        aria-pressed={showComments}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Kommentieren</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 h-12 rounded-lg text-muted-foreground hover:bg-muted"
        onClick={handleRepost}
      >
        <Repeat2 className="h-5 w-5" />
        <span className="hidden sm:inline">Reposten</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 h-12 rounded-lg text-muted-foreground hover:bg-muted"
        onClick={handleSend}
      >
        <Send className="h-5 w-5" />
        <span className="hidden sm:inline">Senden</span>
      </Button>
    </div>
  );
}