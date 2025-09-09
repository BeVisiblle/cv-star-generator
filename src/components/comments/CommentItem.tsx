import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Reply, 
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Smile,
  ThumbsUp,
  Laugh,
  Wow,
  Sad,
  Angry
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { AvatarClickable } from '../common/AvatarClickable';
import { useCommentReactions, ReactionType } from '@/hooks/useCommentReactions';
import { cn } from '@/lib/utils';

interface CommentAuthor {
  id: string;
  display_name: string;
  avatar_url?: string;
  verified?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: CommentAuthor;
  created_at: string;
  likes_count: number;
  replies_count: number;
  replies?: Comment[];
  is_liked?: boolean;
  reactions?: any[];
  reaction_counts?: Record<ReactionType, number>;
}

interface CommentItemProps {
  comment: Comment;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string, replyContent: string) => void;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  showReplies?: boolean;
  isReply?: boolean;
}

const reactionTypes = [
  { type: 'like' as ReactionType, icon: ThumbsUp, label: 'Gefällt mir', color: 'text-blue-500' },
  { type: 'love' as ReactionType, icon: Heart, label: 'Liebe', color: 'text-red-500' },
  { type: 'laugh' as ReactionType, icon: Laugh, label: 'Lachen', color: 'text-yellow-500' },
  { type: 'wow' as ReactionType, icon: Wow, label: 'Wow', color: 'text-purple-500' },
  { type: 'sad' as ReactionType, icon: Sad, label: 'Traurig', color: 'text-gray-500' },
  { type: 'angry' as ReactionType, icon: Angry, label: 'Wütend', color: 'text-orange-500' },
];

export function CommentItem({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  showReplies = false,
  isReply = false
}: CommentItemProps) {
  const { t } = useTranslation();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [showRepliesState, setShowRepliesState] = useState(showReplies);
  const [showReactions, setShowReactions] = useState(false);

  const {
    counts,
    userReaction,
    totalCount,
    toggleReaction,
    isLoading: reactionsLoading
  } = useCommentReactions({
    commentId: comment.id,
    initialReactions: comment.reactions || [],
    initialCounts: comment.reaction_counts || {}
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: de 
    });
  };

  const handleLike = () => {
    onLike?.(comment.id);
  };

  const handleReactionClick = (reactionType: ReactionType) => {
    toggleReaction(reactionType);
    setShowReactions(false);
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply?.(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit?.(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Möchtest du diesen Kommentar wirklich löschen?')) {
      onDelete?.(comment.id);
    }
  };

  const isOwnComment = comment.author.id === 'current-user'; // Replace with actual user check

  return (
    <div className={`space-y-3 ${isReply ? 'ml-8' : ''}`}>
      <div className="flex space-x-3">
        <AvatarClickable
          profileId={comment.author.id}
          profileType="user"
          className="h-8 w-8"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatar_url} />
            <AvatarFallback>
              {comment.author.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </AvatarClickable>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{comment.author.display_name}</h4>
            {comment.author.verified && (
              <span className="text-xs text-blue-500">✓</span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>
                  Speichern
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}

          <div className="flex items-center gap-4 mt-2">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-xs text-muted-foreground",
                userReaction === 'like' && "text-blue-500"
              )}
              onClick={() => handleReactionClick('like')}
              disabled={reactionsLoading}
            >
              <ThumbsUp className={cn("h-3 w-3 mr-1", userReaction === 'like' && "fill-current")} />
              {counts.like > 0 && counts.like}
            </Button>

            {/* Reaction Picker */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={() => setShowReactions(!showReactions)}
                disabled={reactionsLoading}
              >
                <Smile className="h-3 w-3" />
              </Button>

              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-background border rounded-lg shadow-lg flex gap-1 z-10">
                  {reactionTypes.map((reaction) => {
                    const Icon = reaction.icon;
                    const count = counts[reaction.type] || 0;
                    const isActive = userReaction === reaction.type;

                    return (
                      <Button
                        key={reaction.type}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 w-6 p-0 hover:bg-muted",
                          isActive && reaction.color
                        )}
                        onClick={() => handleReactionClick(reaction.type)}
                        title={`${reaction.label}${count > 0 ? ` (${count})` : ''}`}
                        disabled={reactionsLoading}
                      >
                        <Icon className={cn("h-3 w-3", isActive && "fill-current")} />
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total Reaction Count */}
            {totalCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1 text-xs">
                {totalCount}
              </Badge>
            )}

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3 w-3 mr-1" />
                {t('feed.comments.reply')}
              </Button>
            )}

            {isOwnComment && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}

            {!isOwnComment && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={() => console.log('Report comment:', comment.id)}
              >
                <Flag className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder={t('feed.comments.reply_to', { name: comment.author.display_name })}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply}>
                  Antworten
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground mb-2"
                  onClick={() => setShowRepliesState(!showRepliesState)}
                >
                  {showRepliesState ? (
                    <>
                      {t('feed.comments.hide_replies')} ({comment.replies_count})
                    </>
                  ) : (
                    <>
                      {t('feed.comments.show_replies')} ({comment.replies_count})
                    </>
                  )}
                </Button>
              )}

              {showRepliesState && (
                <div className="space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onLike={onLike}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isReply={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
