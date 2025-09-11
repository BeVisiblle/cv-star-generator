import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Post } from '@/hooks/usePosts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  const getDisplayName = () => {
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname} ${post.author.nachname}`;
    }
    return 'Unbekannt';
  };

  const getInitials = () => {
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname[0]}${post.author.nachname[0]}`;
    }
    return 'U';
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { 
    addSuffix: true, 
    locale: de 
  });

  return (
    <div className="flex items-start justify-between p-4 pb-0">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={post.author?.avatar_url} alt={getDisplayName()} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        
        <div>
          <p className="font-semibold text-sm leading-tight">{getDisplayName()}</p>
          <p className="text-xs text-muted-foreground leading-tight">
            {post.author?.headline || 'Mitglied'}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            {timeAgo}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Beitrag melden</DropdownMenuItem>
          <DropdownMenuItem>Link kopieren</DropdownMenuItem>
          <DropdownMenuItem>Beitrag ausblenden</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}