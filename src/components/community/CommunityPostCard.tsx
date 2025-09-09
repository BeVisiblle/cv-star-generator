import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Send, MapPin, Clock, Euro } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CommunityPost, useToggleCommunityLike, useAddCommunityComment } from '@/hooks/useCommunityPosts';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';

interface CommunityPostCardProps {
  post: CommunityPost;
}

export default function CommunityPostCard({ post }: CommunityPostCardProps) {
  const { user } = useAuth();
  const { company } = useCompany();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [imageOpen, setImageOpen] = useState(false);

  const toggleLike = useToggleCommunityLike();
  const addComment = useAddCommunityComment();

  const getDisplayName = () => {
    if (post.actor_company_id && post.company?.name) {
      return post.company.name;
    }
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname} ${post.author.nachname}`;
    }
    return 'Unbekannter Nutzer';
  };

  const getInitials = () => {
    if (post.actor_company_id && post.company?.name) {
      return post.company.name.slice(0, 2).toUpperCase();
    }
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname[0]}${post.author.nachname[0]}`;
    }
    return 'U';
  };

  const getAvatarUrl = () => {
    if (post.actor_company_id) {
      return post.company?.logo_url;
    }
    return post.author?.avatar_url;
  };

  const getSubtitle = () => {
    if (post.actor_company_id) {
      return post.company?.industry || 'Unternehmen';
    }
    if (post.author?.headline) {
      return post.author.headline;
    }
    return '';
  };

  const handleLike = () => {
    if (!user) return;
    
    toggleLike.mutate({
      postId: post.id,
      companyId: company?.id
    });
  };

  const handleComment = () => {
    if (!newComment.trim() || !user) return;

    addComment.mutate({
      postId: post.id,
      body: newComment.trim(),
      companyId: company?.id
    });

    setNewComment('');
  };

  const handleProfileClick = () => {
    if (post.actor_company_id) {
      navigate(`/companies/${post.actor_company_id}`);
    } else if (post.actor_user_id) {
      navigate(`/u/${post.actor_user_id}`);
    }
  };

  const renderJobCard = () => {
    if (post.post_kind !== 'job_share' || !post.job) return null;

    return (
      <Card className="mt-3 border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-base">{post.job.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{post.job.city}</span>
                {post.job.employment_type && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {post.job.employment_type}
                    </Badge>
                  </>
                )}
              </div>
              {(post.job.salary_min || post.job.salary_max) && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <Euro className="h-4 w-4" />
                  <span>
                    {post.job.salary_min && post.job.salary_max
                      ? `${post.job.salary_min} - ${post.job.salary_max} €`
                      : post.job.salary_min
                      ? `ab ${post.job.salary_min} €`
                      : `bis ${post.job.salary_max} €`}
                  </span>
                </div>
              )}
            </div>
            {post.applies_enabled && (
              <Button 
                size="sm" 
                className="ml-4"
                onClick={() => {
                  // TODO: Open application modal
                  console.log('Apply to job:', post.job_id);
                }}
              >
                Jetzt bewerben
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    const firstImage = post.media[0];
    if (!firstImage?.url) return null;

    return (
      <div className="mt-3">
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg border">
          <img
            src={firstImage.url}
            alt="Post media"
            className="h-full w-full object-cover cursor-zoom-in"
            onClick={() => setImageOpen(true)}
            loading="lazy"
          />
        </AspectRatio>
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-3xl">
            <img src={firstImage.url} alt="Media vergrößert" className="w-full h-auto rounded" />
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="cursor-pointer" onClick={handleProfileClick}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={getAvatarUrl()} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                className="font-semibold text-sm hover:underline text-left truncate"
                onClick={handleProfileClick}
              >
                {getDisplayName()}
              </button>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: de })}
              </span>
              {post.post_kind === 'job_share' && (
                <Badge variant="secondary" className="text-xs">
                  Job-Share
                </Badge>
              )}
            </div>
            {getSubtitle() && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {getSubtitle()}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {post.body_md && (
          <div className="mb-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {post.body_md}
            </p>
          </div>
        )}

        {/* Media */}
        {renderMedia()}

        {/* Job Card */}
        {renderJobCard()}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-3 border-t">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post.like_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.comment_count}
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="h-3.5 w-3.5" />
              {post.share_count}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-3 border-t">
        {/* Action Buttons */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`text-muted-foreground hover:text-red-500 ${
                post.liked ? 'text-red-500' : ''
              }`}
              disabled={toggleLike.isPending}
            >
              <Heart className={`h-4 w-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
              Gefällt mir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Kommentieren
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Teilen
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full mt-4 space-y-3 border-t pt-3">
            <div className="flex gap-2">
              <Input
                placeholder="Schreibe einen Kommentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={handleComment} 
                disabled={!newComment.trim() || addComment.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {post.comment_count === 0 
                ? 'Sei der Erste, der kommentiert.' 
                : `${post.comment_count} Kommentare`
              }
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}