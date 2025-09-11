import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { LinkedInComment } from '@/hooks/useLinkedInFeed';
import LinkedInCommentComposer from './LinkedInCommentComposer';

interface LinkedInCommentItemProps {
  comment: LinkedInComment;
  onReplyCreated: (comment: LinkedInComment) => void;
}

export default function LinkedInCommentItem({ comment, onReplyCreated }: LinkedInCommentItemProps) {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

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
    // TODO: Implement comment liking
    console.log('Like comment:', comment.id);
  };

  const handleReply = () => {
    setShowReplyComposer(!showReplyComposer);
  };

  const handleReplyAdded = () => {
    setShowReplyComposer(false);
    // The mutation will handle invalidating queries
  };

  return (
    <div className="px-4 py-3 flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={comment.author?.avatar_url || undefined} 
          alt={getDisplayName()} 
        />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        {/* Comment bubble */}
        <div className="rounded-2xl bg-muted px-3 py-2">
          <div className="text-sm font-medium leading-tight">
            {getDisplayName()}
          </div>
          {comment.author?.headline && (
            <div className="text-xs text-muted-foreground mb-1">
              {comment.author.headline}
            </div>
          )}
          <div className="text-[15px] leading-6 whitespace-pre-wrap">
            {comment.body}
          </div>
        </div>

        {/* Comment actions */}
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <button 
            className={`hover:underline ${comment.you_like ? 'text-primary' : ''}`}
            onClick={handleLike}
            aria-pressed={comment.you_like}
          >
            Gefällt mir ({comment.like_count})
          </button>
          
          <button 
            className="hover:underline" 
            onClick={handleReply}
          >
            Antworten{comment.reply_count > 0 ? ` (${comment.reply_count})` : ''}
          </button>
          
          <span>
            · {formatDistanceToNow(new Date(comment.created_at), { 
              addSuffix: true, 
              locale: de 
            })}
          </span>
        </div>

        {/* Reply composer */}
        {showReplyComposer && (
          <div className="mt-2 pl-10">
            <LinkedInCommentComposer
              postId={comment.post_id}
              parentId={comment.id}
              placeholder="Antwort schreiben..."
              onCommentAdded={handleReplyAdded}
            />
          </div>
        )}

        {/* Show replies button */}
        {comment.reply_count > 0 && (
          <div className="mt-2 pl-10">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies 
                ? `Antworten ausblenden (${comment.reply_count})`
                : `${comment.reply_count} Antworten anzeigen`
              }
            </Button>
          </div>
        )}

        {/* TODO: Render actual replies when showReplies is true */}
        {showReplies && (
          <div className="mt-2 pl-10 text-sm text-muted-foreground">
            Antworten werden geladen...
          </div>
        )}
      </div>
    </div>
  );
}