import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, ThumbsUp, MessageCircle, Repeat2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { LinkedInPost } from '@/hooks/useLinkedInPosts';
import PostHeader from './PostHeader';
import PostBody from './PostBody';
import PostActions from './PostActions';
import LikeFaces from './LikeFaces';
import CommentComposer from '../comments/CommentComposer';
import CommentsList from '../comments/CommentsList';

interface LinkedInPostCardProps {
  post: LinkedInPost;
}

export default function LinkedInPostCard({ post }: LinkedInPostCardProps) {
  const [showComments, setShowComments] = useState(false);

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

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <PostHeader 
        post={post}
        displayName={getDisplayName()}
        initials={getInitials()}
      />
      
      <PostBody post={post} />
      
      {/* Like Faces - Show who liked */}
      {post.like_count > 0 && (
        <LikeFaces postId={post.id} likeCount={post.like_count} />
      )}
      
      {/* Meta Line - Engagement Stats */}
      <div className="px-4 pb-2 text-xs text-muted-foreground">
        <span>
          {post.like_count > 0 && `${post.like_count} Reaktionen`}
          {post.like_count > 0 && post.comment_count > 0 && ' · '}
          {post.comment_count > 0 && `${post.comment_count} Kommentare`}
          {(post.like_count > 0 || post.comment_count > 0) && post.repost_count > 0 && ' · '}
          {post.repost_count > 0 && `${post.repost_count} Reposts`}
        </span>
      </div>

      <PostActions 
        post={post} 
        onToggleComments={() => setShowComments(!showComments)}
        showComments={showComments}
      />

      {/* Comment Composer - Full Width */}
      <CommentComposer postId={post.id} />

      {/* Comments List */}
      {showComments && <CommentsList postId={post.id} />}
    </Card>
  );
}