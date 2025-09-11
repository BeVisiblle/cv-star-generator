import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, ThumbsUp, MessageCircle, Repeat2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { LinkedInPost } from '@/hooks/useLinkedInFeed';
import { useToggleLinkedInLike } from '@/hooks/useLinkedInFeed';
import LinkedInPostHeader from './LinkedInPostHeader';
import LinkedInPostBody from './LinkedInPostBody';
import LinkedInPostActions from './LinkedInPostActions';
import LinkedInCommentComposer from './LinkedInCommentComposer';
import LinkedInCommentsList from './LinkedInCommentsList';

interface LinkedInPostCardProps {
  post: LinkedInPost;
}

export default function LinkedInPostCard({ post }: LinkedInPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(post.like_count);
  const [localYouLike, setLocalYouLike] = useState(post.you_like || false);
  const toggleLike = useToggleLinkedInLike();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleLike = async () => {
    // Optimistic update
    setLocalYouLike(!localYouLike);
    setLocalLikeCount(prev => localYouLike ? prev - 1 : prev + 1);
    
    try {
      await toggleLike.mutateAsync(post.id);
    } catch (error) {
      // Revert on error
      setLocalYouLike(localYouLike);
      setLocalLikeCount(localLikeCount);
    }
  };

  const handleCommentFocus = () => {
    setShowComments(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <LinkedInPostHeader 
        post={post}
        displayName={getDisplayName()}
        initials={getInitials()}
      />
      
      <LinkedInPostBody post={post} />
      
      {/* Meta Line - Engagement Stats */}
      {(localLikeCount > 0 || post.comment_count > 0 || post.repost_count > 0) && (
        <div className="px-4 pb-2 flex justify-between items-center text-xs text-muted-foreground">
          <div>
            {localLikeCount > 0 && `${localLikeCount} Reaktionen`}
            {localLikeCount > 0 && post.repost_count > 0 && ' · '}
            {post.repost_count > 0 && `${post.repost_count} Reposts`}
          </div>
          {post.comment_count > 0 && (
            <button 
              onClick={() => setShowComments(!showComments)}
              className="hover:underline cursor-pointer"
            >
              {post.comment_count} Kommentare
            </button>
          )}
        </div>
      )}

      <LinkedInPostActions 
        post={{...post, like_count: localLikeCount, you_like: localYouLike}}
        onLike={handleLike}
        onToggleComments={() => setShowComments(!showComments)}
        onCommentFocus={handleCommentFocus}
        showComments={showComments}
        isLiking={toggleLike.isPending}
      />

      {/* Comment Composer - Full Width */}
      <LinkedInCommentComposer 
        postId={post.id} 
        inputRef={commentInputRef}
      />

      {/* Comments List */}
      {showComments && <LinkedInCommentsList postId={post.id} />}
    </Card>
  );
}