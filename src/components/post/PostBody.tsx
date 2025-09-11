import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Post } from '@/hooks/usePosts';

interface PostBodyProps {
  post: Post;
}

export function PostBody({ post }: PostBodyProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Check if text needs truncation (more than 3 lines ~150 chars)
  const needsTruncation = post.body.length > 150;
  const displayText = expanded || !needsTruncation 
    ? post.body 
    : post.body.slice(0, 150) + '...';

  return (
    <div className="px-4 py-2">
      <div className="text-[15px] leading-6 whitespace-pre-wrap">
        {displayText}
        {needsTruncation && (
          <Button
            variant="link"
            className="h-auto p-0 ml-1 text-[15px] font-normal text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? ' weniger' : ' mehr'}
          </Button>
        )}
      </div>
      
      {/* Attachments would go here */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mt-3">
          {/* File preview components would be rendered here */}
        </div>
      )}
    </div>
  );
}