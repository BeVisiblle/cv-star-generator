import React from 'react';
import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';
import { useSocialPostComments } from '@/hooks/useSocialFeed';

interface CommentDrawerProps {
  postId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function CommentDrawer({ postId, isOpen, onToggle }: CommentDrawerProps) {
  const { data: comments, isLoading } = useSocialPostComments(postId);

  if (!isOpen) return null;

  return (
    <div className="border-t border-border">
      <div className="p-4 space-y-4">
        <CommentComposer postId={postId} />
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Kommentare werden geladen...
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Sei der Erste, der kommentiert.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}