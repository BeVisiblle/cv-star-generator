import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { PostHeader } from './PostHeader';
import { PostBody } from './PostBody';
import { PostMeta } from './PostMeta';
import { PostActions } from './PostActions';
import { CommentDrawer } from '../comments/CommentDrawer';
import { SocialProofBar } from './SocialProofBar';
import { useToggleSocialPostLike, useSocialProof, type Post } from '@/hooks/useSocialFeed';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(post.like_count);
  const [localYouLike, setLocalYouLike] = useState(post.you_like || false);
  
  const toggleLike = useToggleSocialPostLike();
  const { data: socialProof } = useSocialProof(post.id);

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

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-sm mb-6">
      {socialProof && <SocialProofBar socialProof={socialProof} />}
      
      <PostHeader post={post} />
      <PostBody post={post} />
      
      <PostMeta 
        likeCount={localLikeCount}
        commentCount={post.comment_count}
        onToggleComments={handleToggleComments}
      />
      
      <PostActions 
        post={{...post, like_count: localLikeCount, you_like: localYouLike}}
        onLike={handleLike}
        onToggleComments={handleToggleComments}
        showComments={showComments}
        isLiking={toggleLike.isPending}
      />
      
      <CommentDrawer 
        postId={post.id}
        isOpen={showComments}
        onToggle={handleToggleComments}
      />
    </Card>
  );
}