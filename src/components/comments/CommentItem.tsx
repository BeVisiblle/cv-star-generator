import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { LinkedInComment } from '@/hooks/useLinkedInPosts';
import { useToggleCommentLike } from '@/hooks/useLinkedInPosts';
import CommentComposer from './CommentComposer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentItemProps {
  comment: LinkedInComment;
  postId: string;
  isReply?: boolean;
}

export default function CommentItem({ comment, postId, isReply = false }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const toggleLike = useToggleCommentLike();

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

  const handleLike = () => {
    toggleLike.mutate(comment.id);
  };

  const handleReply = () => {
    setShowReplyComposer(!showReplyComposer);
  };

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { 
    addSuffix: true, 
    locale: de 
  });

  return (
    <div className={`px-4 py-3 ${isReply ? 'pl-14' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author?.avatar_url} alt={getDisplayName()} />
          <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Comment Bubble */}
          <div className="bg-muted rounded-2xl px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{getDisplayName()}</h4>
                {comment.author?.headline && (
                  <span className="text-xs text-muted-foreground">
                    • {comment.author.headline}
                  </span>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Kommentar melden
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Link kopieren
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="text-sm whitespace-pre-wrap">
              {comment.body}
            </div>
            
            {/* Translation link */}
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowTranslation(!showTranslation)}
            >
              Übersetzung anzeigen
            </Button>
          </div>
          
          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="text-muted-foreground">{timeAgo}</span>
            
            <Button
              variant="link"
              size="sm"
              className={`h-auto p-0 text-xs font-semibold ${
                comment.liked_by_user 
                  ? 'text-blue-600' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={handleLike}
              disabled={toggleLike.isPending}
            >
              <ThumbsUp className={`h-3 w-3 mr-1 ${comment.liked_by_user ? 'fill-current' : ''}`} />
              {comment.like_count > 0 ? `Gefällt mir (${comment.like_count})` : 'Gefällt mir'}
            </Button>
            
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs font-semibold text-muted-foreground hover:text-foreground"
              onClick={handleReply}
            >
              Antworten
            </Button>
            
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Mehr
            </Button>
          </div>
          
          {/* Reply Composer */}
          {showReplyComposer && (
            <div className="mt-3">
              <CommentComposer
                postId={postId}
                parentId={comment.id}
                placeholder={`Antwort an ${getDisplayName()}...`}
                onCommentAdded={() => setShowReplyComposer(false)}
                className="border rounded-lg bg-background"
              />
            </div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {showReplies && (
                <div className="space-y-2">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      isReply={true}
                    />
                  ))}
                </div>
              )}
              
              {comment.reply_count > 3 && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies 
                    ? `${comment.reply_count} Antworten ausblenden`
                    : `${comment.reply_count} weitere Antworten laden`
                  }
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}