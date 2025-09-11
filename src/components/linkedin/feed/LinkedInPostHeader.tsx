import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { LinkedInPost } from '@/hooks/useLinkedInFeed';

interface LinkedInPostHeaderProps {
  post: LinkedInPost;
  displayName: string;
  initials: string;
}

export default function LinkedInPostHeader({ post, displayName, initials }: LinkedInPostHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-2 flex gap-3 items-start">
      <Avatar className="h-10 w-10">
        <AvatarImage src={post.author?.avatar_url || undefined} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold truncate">{displayName}</div>
          <span className="text-muted-foreground">•</span>
          <div className="text-xs text-muted-foreground truncate">
            {formatDistanceToNow(new Date(post.created_at), { 
              addSuffix: true, 
              locale: de 
            })}
          </div>
        </div>
        {post.author?.headline && (
          <div className="text-xs text-muted-foreground truncate">
            {post.author.headline}
          </div>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem>Kopierbaren Link erstellen</DropdownMenuItem>
          <DropdownMenuItem>Beitrag verbergen</DropdownMenuItem>
          <DropdownMenuItem>Beitrag melden</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}