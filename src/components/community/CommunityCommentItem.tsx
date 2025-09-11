import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { CommunityCommentComposer } from './CommunityCommentComposer';

interface CommunityComment {
  id: string;
  body_md: string;
  created_at: string;
  author_user_id?: string;
  author_company_id?: string;
  parent_comment_id?: string;
  author?: any;
  company?: any;
}

interface CommunityCommentItemProps {
  comment: CommunityComment;
  onReplyCreated: (comment: CommunityComment) => void;
}

export const CommunityCommentItem: React.FC<CommunityCommentItemProps> = ({
  comment,
  onReplyCreated
}) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const getDisplayName = () => {
    if (comment.author_company_id && comment.company?.name) {
      return comment.company.name;
    }
    if (comment.author?.vorname && comment.author?.nachname) {
      return `${comment.author.vorname} ${comment.author.nachname}`;
    }
    return 'Unbekannter Nutzer';
  };

  const getInitials = () => {
    if (comment.author_company_id && comment.company?.name) {
      return comment.company.name.slice(0, 2).toUpperCase();
    }
    if (comment.author?.vorname && comment.author?.nachname) {
      return `${comment.author.vorname[0]}${comment.author.nachname[0]}`;
    }
    return 'U';
  };

  const getAvatarUrl = () => {
    if (comment.author_company_id) {
      return comment.company?.logo_url;
    }
    return comment.author?.avatar_url;
  };

  const getSubtitle = () => {
    if (comment.author_company_id) {
      return comment.company?.industry || 'Unternehmen';
    }
    if (comment.author?.headline) {
      return comment.author.headline;
    }
    return '';
  };

  const handleLike = () => {
    // TODO: Implement comment like functionality
    console.log('Like comment:', comment.id);
  };

  const handleReply = () => {
    setShowReplyComposer(!showReplyComposer);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={getAvatarUrl()} />
        <AvatarFallback className="text-xs bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="bg-muted/50 rounded-2xl px-4 py-3">
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">{getDisplayName()}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true, 
                    locale: de 
                  })}
                </span>
              </div>
              {getSubtitle() && (
                <p className="text-xs text-muted-foreground mt-0.5">{getSubtitle()}</p>
              )}
            </div>
          </div>
          
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.body_md}
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-red-500"
          >
            <Heart className="h-3 w-3 mr-1" />
            Gefällt mir
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReply}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Antworten
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
        
        {showReplyComposer && (
          <div className="ml-2">
            <CommunityCommentComposer
              postId={comment.id} // This would need to be the actual post ID
              parentCommentId={comment.id}
              placeholder="Antworte auf diesen Kommentar..."
              onCommentAdded={() => {
                setShowReplyComposer(false);
                onReplyCreated(comment);
              }}
            />
          </div>
        )}
        
        {/* Placeholder for replies */}
        {false && ( // Hide for now, would show when there are replies
          <div className="ml-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="h-auto p-0 text-xs text-primary hover:underline"
            >
              {showReplies ? 'Antworten ausblenden' : 'Antworten anzeigen'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};