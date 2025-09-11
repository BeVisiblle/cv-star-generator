import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePostComments } from '@/hooks/useLinkedInPosts';
import CommentItem from './CommentItem';

interface CommentsListProps {
  postId: string;
}

export default function CommentsList({ postId }: CommentsListProps) {
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
  const { data: comments, isLoading } = usePostComments(postId);

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 bg-muted rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-12 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-muted-foreground text-sm">
          Sei der/die Erste, der/die kommentiert
        </p>
      </div>
    );
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'top') {
      // Sort by like count first, then by date
      if (a.like_count !== b.like_count) {
        return b.like_count - a.like_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      // Sort by newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="border-t">
      {/* Sort Controls */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Sortieren nach:</span>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'top' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('top')}
              className="h-8"
            >
              Top
            </Button>
            <Button
              variant={sortBy === 'newest' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('newest')}
              className="h-8"
            >
              Neueste
            </Button>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="divide-y">
        {sortedComments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment}
            postId={postId}
          />
        ))}
      </div>

      {/* Load More Comments */}
      {comments.length >= 20 && (
        <div className="px-4 py-3 border-t">
          <Button variant="ghost" className="w-full">
            Weitere Kommentare laden
          </Button>
        </div>
      )}
    </div>
  );
}