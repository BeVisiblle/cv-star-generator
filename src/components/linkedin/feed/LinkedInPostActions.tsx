import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, Repeat2, Send, Loader2 } from 'lucide-react';
import type { LinkedInPost } from '@/hooks/useLinkedInFeed';

interface LinkedInPostActionsProps {
  post: LinkedInPost;
  onLike: () => void;
  onToggleComments: () => void;
  onCommentFocus: () => void;
  showComments: boolean;
  isLiking?: boolean;
}

export default function LinkedInPostActions({ 
  post, 
  onLike, 
  onToggleComments, 
  onCommentFocus,
  showComments,
  isLiking = false
}: LinkedInPostActionsProps) {
  return (
    <div className="px-2 py-1 border-t grid grid-cols-4 text-sm">
      <Button 
        variant="ghost" 
        className={`justify-center gap-2 ${post.you_like ? 'text-primary' : ''}`} 
        onClick={onLike}
        disabled={isLiking}
        aria-pressed={post.you_like}
      >
        {isLiking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsUp className="h-4 w-4" />
        )}
        Gefällt mir
      </Button>
      
      <Button 
        variant="ghost" 
        className={`justify-center gap-2 ${showComments ? 'text-primary' : ''}`}
        onClick={onToggleComments}
      >
        <MessageCircle className="h-4 w-4" />
        Kommentieren
      </Button>
      
      <Button variant="ghost" className="justify-center gap-2">
        <Repeat2 className="h-4 w-4" />
        Reposten
      </Button>
      
      <Button variant="ghost" className="justify-center gap-2">
        <Send className="h-4 w-4" />
        Senden
      </Button>
    </div>
  );
}