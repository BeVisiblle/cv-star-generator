import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { PostComment } from '@/hooks/usePosts';
import { CommentComposer } from './CommentComposer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentItemProps {
  comment: PostComment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const [showReplyComposer, setShowReplyComposer] = useState(false);

  const getDisplayName = () => {
    if (comment.author?.vorname && comment.author?.nachname) {
      return `${comment.author.vorname} ${comment.author.nachname}`;
    }
    return 'Unbekannt';
  };

  const getInitials = () => {
    if (comment.author?.vorname && comment.author?.nachname) {
      return `${comment.author.vorname[0]}${comment.author.nachname[0]}`;
    }
    return 'U';
  };


  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { 
    addSuffix: true, 
    locale: de 
  });

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author?.avatar_url} alt={getDisplayName()} />
          <AvatarFallback className="text-xs">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-muted rounded-2xl px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm">{getDisplayName()}</p>
              <p className="text-xs text-muted-foreground">
                {comment.author?.headline || 'Mitglied'}
              </p>
            </div>
            <p className="text-sm">{comment.body}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-1 ml-3">
            <p className="text-xs text-muted-foreground">
              {timeAgo}
            </p>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-auto p-0 text-xs ${
                comment.you_like 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ThumbsUp className={`h-3 w-3 mr-1 ${comment.you_like ? 'fill-current' : ''}`} />
              Gefällt mir
              {comment.like_count > 0 && ` (${comment.like_count})`}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowReplyComposer(!showReplyComposer)}
            >
              Antworten
            </Button>
          </div>
          
          {showReplyComposer && (
            <div className="mt-3">
              <CommentComposer 
                postId={comment.post_id}
                parentId={comment.id}
                placeholder="Schreibe eine Antwort..."
                onCommentAdded={() => setShowReplyComposer(false)}
              />
            </div>
          )}
          
          {comment.reply_count > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground mt-2 ml-3"
            >
              {comment.reply_count} Antworten anzeigen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}