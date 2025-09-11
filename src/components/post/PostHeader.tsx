import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { LinkedInPost } from '@/hooks/useLinkedInPosts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostHeaderProps {
  post: LinkedInPost;
  displayName: string;
  initials: string;
}

export default function PostHeader({ post, displayName, initials }: PostHeaderProps) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { 
    addSuffix: true, 
    locale: de 
  });

  return (
    <div className="px-4 pt-4 pb-2 flex gap-3 items-start">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={post.author?.avatar_url} alt={displayName} />
        <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm leading-tight">{displayName}</h3>
          <span className="text-muted-foreground text-xs">•</span>
          <time className="text-muted-foreground text-xs">{timeAgo}</time>
        </div>
        
        {post.author?.headline && (
          <p className="text-muted-foreground text-sm leading-tight mt-0.5">
            {post.author.headline}
          </p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 flex-shrink-0"
            aria-label="Mehr Optionen"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            Beitrag melden
          </DropdownMenuItem>
          <DropdownMenuItem>
            Link kopieren
          </DropdownMenuItem>
          <DropdownMenuItem>
            Beitrag verbergen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}