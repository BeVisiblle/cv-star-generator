import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useLinkedInComments } from '@/hooks/useLinkedInFeed';
import LinkedInCommentItem from './LinkedInCommentItem';

interface LinkedInCommentsListProps {
  postId: string;
}

export default function LinkedInCommentsList({ postId }: LinkedInCommentsListProps) {
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
  const { data: comments, isLoading, error } = useLinkedInComments(postId);

  if (isLoading) {
    return (
      <div className="px-4 py-3 flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Kommentare werden geladen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 text-center">
        <p className="text-sm text-muted-foreground">
          Fehler beim Laden der Kommentare.
        </p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="px-4 py-3 text-center">
        <p className="text-sm text-muted-foreground">
          Noch keine Kommentare vorhanden.
        </p>
      </div>
    );
  }

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'top') {
      // Sort by like count first, then by creation date
      if (a.like_count !== b.like_count) {
        return b.like_count - a.like_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      // Sort by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="pb-2">
      {/* Sort controls */}
      <div className="px-4 pt-2 pb-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Sortieren:</span>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 px-2" 
          onClick={() => setSortBy(sortBy === 'top' ? 'newest' : 'top')}
        >
          {sortBy === 'top' ? 'Top' : 'Neueste'}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </div>

      {/* Comments */}
      <div className="space-y-1">
        {sortedComments.map((comment) => (
          <LinkedInCommentItem 
            key={comment.id} 
            comment={comment}
            onReplyCreated={() => {
              // Invalidate will be handled by the mutation
            }}
          />
        ))}
      </div>

      {/* Load more button */}
      {comments.length >= 20 && (
        <div className="px-4 pt-2">
          <Button variant="ghost" size="sm" className="text-sm">
            Weitere Kommentare laden
          </Button>
        </div>
      )}
    </div>
  );
}