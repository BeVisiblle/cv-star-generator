import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, Send } from 'lucide-react';
import type { Post } from '@/hooks/usePosts';

interface PostActionsProps {
  post: Post;
  onLike: () => void;
  onToggleComments: () => void;
  showComments: boolean;
  isLiking?: boolean;
}

export function PostActions({ 
  post, 
  onLike, 
  onToggleComments, 
  showComments,
  isLiking = false
}: PostActionsProps) {
  return (
    <div className="px-2 py-1 border-t grid grid-cols-4 text-sm">
      <Button 
        variant="ghost" 
        className={`justify-center gap-2 h-12 rounded-lg ${
          post.you_like 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={onLike}
        disabled={isLiking}
        aria-pressed={post.you_like}
      >
        <Heart className={`h-5 w-5 ${post.you_like ? 'fill-current' : ''}`} />
        <span className="hidden sm:inline">Gefällt mir</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className={`justify-center gap-2 h-12 rounded-lg ${
          showComments 
            ? 'text-primary hover:text-primary/80' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={onToggleComments}
        aria-pressed={showComments}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Kommentieren</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className="justify-center gap-2 h-12 rounded-lg text-muted-foreground hover:text-foreground"
      >
        <Share className="h-5 w-5" />
        <span className="hidden sm:inline">Teilen</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className="justify-center gap-2 h-12 rounded-lg text-muted-foreground hover:text-foreground"
      >
        <Send className="h-5 w-5" />
        <span className="hidden sm:inline">Senden</span>
      </Button>
    </div>
  );
}