import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostMetaProps {
  likeCount: number;
  commentCount: number;
  onToggleComments: () => void;
}

export function PostMeta({ likeCount, commentCount, onToggleComments }: PostMetaProps) {
  if (likeCount === 0 && commentCount === 0) return null;

  return (
    <>
      <div className="px-4 pb-2 flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {likeCount > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 fill-current text-red-500" />
              <span>{likeCount}</span>
            </div>
          )}
        </div>
        
        {commentCount > 0 && (
          <Button 
            variant="ghost" 
            className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
            onClick={onToggleComments}
          >
            {commentCount} Kommentare
          </Button>
        )}
      </div>
      
      <div className="mx-4 border-t border-border" />
    </>
  );
}