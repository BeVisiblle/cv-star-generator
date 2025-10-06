import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useCommentLikes, type PostComment } from '@/hooks/usePostInteractions';

interface CommentItemProps {
  comment: PostComment;
  onReply: (commentId: string, name: string) => void;
  depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, depth = 0 }) => {
  const navigate = useNavigate();
  const [showReplies, setShowReplies] = useState(false);
  
  const { count: likeCount, liked, toggleLike, isToggling } = useCommentLikes(comment.id);

  const name = comment.author?.vorname && comment.author?.nachname
    ? `${comment.author.vorname} ${comment.author.nachname}`
    : 'Unbekannt';
    
  const initials = comment.author?.vorname && comment.author?.nachname
    ? `${comment.author.vorname[0]}${comment.author.nachname[0]}`
    : 'U';

  // Comment author headline wie bei LinkedIn
  const employer = comment.author?.employer_free || comment.author?.ausbildungsbetrieb || comment.author?.company_name || null;
  let commentHeadline = '';
  if (comment.author?.headline) {
    commentHeadline = employer ? `${comment.author.headline} @ ${employer}` : comment.author.headline;
  } else if (comment.author?.aktueller_beruf) {
    commentHeadline = employer ? `${comment.author.aktueller_beruf} @ ${employer}` : comment.author.aktueller_beruf;
  } else if (employer) {
    commentHeadline = `@ ${employer}`;
  }

  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length || 0;

  return (
    <div className={`${depth > 0 ? 'ml-6 sm:ml-10' : ''}`}>
      <div className="flex items-start gap-2">
        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer flex-shrink-0" onClick={() => navigate(`/u/${comment.author?.id || comment.user_id}`)}>
          <AvatarImage src={comment.author?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-muted/40 border rounded-lg p-2 sm:p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <button 
                  className="text-xs font-semibold hover:underline block truncate" 
                  onClick={() => navigate(`/u/${comment.author?.id || comment.user_id}`)}
                >
                  {name}
                </button>
                {commentHeadline && (
                  <p className="text-[11px] text-muted-foreground truncate">{commentHeadline}</p>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: de })}
              </span>
            </div>
            
            <div className="text-sm whitespace-pre-wrap break-words">{comment.content}</div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-1 ml-1 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('Comment like clicked:', { commentId: comment.id, currentLiked: liked, currentCount: likeCount });
                toggleLike();
              }}
              disabled={isToggling}
              className={`h-6 text-[11px] px-2 ${liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
            >
              <Heart className={`h-3 w-3 mr-1 ${liked ? 'fill-current' : ''}`} />
              {likeCount > 0 ? `Gefällt mir (${likeCount})` : 'Gefällt mir'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
              onClick={() => onReply(comment.id, name)}
            >
              Antworten
            </Button>
            
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] px-2 text-primary hover:text-primary/80"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? `Antworten ausblenden (${replyCount})` : `${replyCount} ${replyCount === 1 ? 'Antwort' : 'Antworten'} anzeigen`}
              </Button>
            )}
          </div>
          
          {/* Nested Replies */}
          {showReplies && hasReplies && (
            <div className="mt-3 space-y-3">
              {comment.replies!.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
