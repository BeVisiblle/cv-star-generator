import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useCommentLikes } from '@/hooks/useCommentLikes';

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    parent_id?: string | null;
    author?: {
      id: string;
      vorname?: string;
      nachname?: string;
      avatar_url?: string;
    };
    likes_count?: number;
    liked_by_user?: boolean;
    replies?: CommentItemProps['comment'][];
  };
  onReply: (commentId: string, authorName: string) => void;
  isReply?: boolean;
}

export default function CommentItem({ comment, onReply, isReply = false }: CommentItemProps) {
  const navigate = useNavigate();
  const [showReplies, setShowReplies] = useState(true);
  
  const { count: likesCount, liked, toggleLike, isToggling } = useCommentLikes(comment.id);

  const name = comment.author?.vorname && comment.author?.nachname
    ? `${comment.author.vorname} ${comment.author.nachname}`
    : 'Unbekannt';
  
  const initials = comment.author?.vorname && comment.author?.nachname
    ? `${comment.author.vorname[0]}${comment.author.nachname[0]}`
    : 'U';

  return (
    <div className={`flex gap-2 ${isReply ? 'ml-10' : ''}`}>
      <Avatar 
        className="h-8 w-8 cursor-pointer flex-shrink-0" 
        onClick={() => navigate(`/u/${comment.author?.id || comment.user_id}`)}
      >
        <AvatarImage src={comment.author?.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-2xl px-3 py-2">
          <button 
            className="text-sm font-semibold hover:underline text-left" 
            onClick={() => navigate(`/u/${comment.author?.id || comment.user_id}`)}
          >
            {name}
          </button>
          <div className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap break-words">
            {comment.content}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <button 
            className={`hover:underline font-medium flex items-center gap-1 ${liked ? 'text-blue-600' : ''}`}
            onClick={() => toggleLike()}
            disabled={isToggling}
          >
            <ThumbsUp className={`h-3 w-3 ${liked ? 'fill-current' : ''}`} />
            {likesCount > 0 ? `Gefällt mir (${likesCount})` : 'Gefällt mir'}
          </button>
          
          <button 
            className="hover:underline font-medium"
            onClick={() => onReply(comment.id, name)}
          >
            Antworten
          </button>
          
          <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: de })}</span>
        </div>
        
        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {showReplies && comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                onReply={onReply}
                isReply={true}
              />
            ))}
            {comment.replies.length > 0 && (
              <button 
                className="text-xs text-muted-foreground hover:underline font-medium"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies 
                  ? `${comment.replies.length} Antworten ausblenden`
                  : `${comment.replies.length} Antworten anzeigen`
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
