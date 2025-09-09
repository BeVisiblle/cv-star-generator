import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Smile,
  ThumbsUp,
  Laugh,
  Wow,
  Sad,
  Angry
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useReactions, ReactionType } from '@/hooks/useReactions';
import { BookmarkButton } from '@/components/post/BookmarkButton';
import { ShareMenu } from '@/components/post/ShareMenu';
import { PostMoreMenu } from '@/components/post/PostMoreMenu';

interface ReactionBarProps {
  postId: string;
  commentsCount: number;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  showReactionPicker?: boolean;
  initialReactions?: any[];
  initialCounts?: Record<ReactionType, number>;
  isBookmarked?: boolean;
  authorId?: string;
}

const reactionTypes = [
  { type: 'like' as ReactionType, icon: ThumbsUp, label: 'Gefällt mir', color: 'text-blue-500' },
  { type: 'love' as ReactionType, icon: Heart, label: 'Liebe', color: 'text-red-500' },
  { type: 'laugh' as ReactionType, icon: Laugh, label: 'Lachen', color: 'text-yellow-500' },
  { type: 'wow' as ReactionType, icon: Wow, label: 'Wow', color: 'text-purple-500' },
  { type: 'sad' as ReactionType, icon: Sad, label: 'Traurig', color: 'text-gray-500' },
  { type: 'angry' as ReactionType, icon: Angry, label: 'Wütend', color: 'text-orange-500' },
];

export function ReactionBar({
  postId,
  commentsCount,
  onComment,
  onShare,
  showReactionPicker = true,
  initialReactions = [],
  initialCounts = {},
  isBookmarked = false,
  authorId
}: ReactionBarProps) {
  const { t } = useTranslation();
  const [showReactions, setShowReactions] = useState(false);
  
  const {
    counts,
    userReaction,
    totalCount,
    mostPopular,
    toggleReaction,
    isLoading
  } = useReactions({
    postId,
    initialReactions,
    initialCounts
  });

  const handleComment = () => {
    onComment?.(postId);
  };

  const handleShare = () => {
    onShare?.(postId);
  };

  const handleReactionClick = (reactionType: ReactionType) => {
    toggleReaction(reactionType);
    setShowReactions(false);
  };

  const getReactionButton = (reactionType: ReactionType) => {
    const reaction = reactionTypes.find(r => r.type === reactionType);
    if (!reaction) return null;

    const Icon = reaction.icon;
    const count = counts[reactionType] || 0;
    const isActive = userReaction === reactionType;

    return (
      <Button
        key={reactionType}
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-2 text-muted-foreground hover:text-foreground",
          isActive && reaction.color
        )}
        onClick={() => handleReactionClick(reactionType)}
        disabled={isLoading}
      >
        <Icon className={cn("h-4 w-4 mr-1", isActive && "fill-current")} />
        <span className="text-xs">
          {count > 0 ? count : ''}
        </span>
      </Button>
    );
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t">
      <div className="flex items-center gap-1">
        {/* Quick Like Button */}
        {getReactionButton('like')}

        {/* Reaction Picker */}
        {showReactionPicker && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowReactions(!showReactions)}
              disabled={isLoading}
            >
              <Smile className="h-4 w-4" />
            </Button>

            {showReactions && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-background border rounded-lg shadow-lg flex gap-1 z-10">
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
                        "h-8 w-8 p-0 hover:bg-muted",
                        isActive && reaction.color
                      )}
                      onClick={() => handleReactionClick(reaction.type)}
                      title={`${reaction.label}${count > 0 ? ` (${count})` : ''}`}
                      disabled={isLoading}
                    >
                      <Icon className={cn("h-4 w-4", isActive && "fill-current")} />
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Total Reaction Count */}
        {totalCount > 0 && (
          <Badge variant="secondary" className="h-6 px-2 text-xs">
            {totalCount}
          </Badge>
        )}

        {/* Comments */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={handleComment}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">
            {commentsCount > 0 ? commentsCount : ''}
          </span>
        </Button>

        {/* Share */}
        <ShareMenu postId={postId} onShare={handleShare} />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Bookmark */}
        <BookmarkButton postId={postId} isBookmarked={isBookmarked} />
        
        {/* More menu */}
        <PostMoreMenu postId={postId} authorId={authorId} />
      </div>

      {/* Most Popular Reaction Display */}
      {mostPopular.count > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Meistgewählt:</span>
          {(() => {
            const reaction = reactionTypes.find(r => r.type === mostPopular.type);
            if (!reaction) return null;
            const Icon = reaction.icon;
            return (
              <div className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                <span>{reaction.label}</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
