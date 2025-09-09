import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Clock, 
  Users,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { ReactionBar } from './ReactionBar';
import { CommentThread } from '../comments/CommentThread';
import { AvatarClickable } from '../common/AvatarClickable';
import { PollCard } from './PollCard';
import { EventCard } from './EventCard';

interface PostAuthor {
  id: string;
  display_name: string;
  headline?: string;
  avatar_url?: string;
  verified?: boolean;
}

interface PostData {
  id: string;
  content: string;
  post_type: 'text' | 'poll' | 'event' | 'job_share' | 'media';
  author_id: string;
  author_type: 'user' | 'company';
  published_at: string;
  created_at: string;
  status: string;
  visibility: string;
  likes_count: number;
  comments_count: number;
  poll_data?: any;
  event_data?: any;
}

interface PostCardProps {
  post: PostData;
  author: PostAuthor;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  isLiked?: boolean;
  showComments?: boolean;
}

export function PostCard({ 
  post, 
  author, 
  onLike, 
  onComment, 
  onShare, 
  isLiked = false,
  showComments = false 
}: PostCardProps) {
  const { t } = useTranslation();
  const [showCommentThread, setShowCommentThread] = useState(showComments);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: de 
    });
  };

  const handleLike = () => {
    onLike?.(post.id);
  };

  const handleComment = () => {
    setShowCommentThread(!showCommentThread);
    onComment?.(post.id);
  };

  const handleShare = () => {
    onShare?.(post.id);
  };

  const renderPostContent = () => {
    switch (post.post_type) {
      case 'poll':
        return <PollCard pollId={post.id} postId={post.id} question={post.content} />;
      case 'event':
        return <EventCard eventId={post.id} postId={post.id} title={post.content} />;
      case 'job_share':
        return <JobShareContent content={post.content} />;
      default:
        return <TextContent content={post.content} />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AvatarClickable
              profileId={author.id}
              profileType={post.author_type}
              className="h-10 w-10"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={author.avatar_url} />
                <AvatarFallback>
                  {author.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </AvatarClickable>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">
                  {author.display_name}
                </h3>
                {author.verified && (
                  <Badge variant="secondary" className="text-xs">
                    ✓
                  </Badge>
                )}
              </div>
              {author.headline && (
                <p className="text-xs text-muted-foreground truncate">
                  {author.headline}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(post.published_at)}</span>
                <Badge variant="outline" className="text-xs">
                  {post.visibility === 'CommunityOnly' ? 'Community' : 'Öffentlich'}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {renderPostContent()}
        
        <ReactionBar
          postId={post.id}
          commentsCount={post.comments_count}
          onComment={handleComment}
          onShare={handleShare}
          showReactionPicker={true}
        />

        {showCommentThread && (
          <div className="mt-4 pt-4 border-t">
            <CommentThread postId={post.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Poll Content Component
function PollContent({ pollData }: { pollData: any }) {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  if (!pollData) return null;

  const isPollEnded = new Date(pollData.ends_at) < new Date();
  const canVote = !isPollEnded && !hasVoted;

  const handleOptionSelect = (optionId: string) => {
    if (!canVote) return;

    if (pollData.multiple_choice) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) return;
    // TODO: Implement vote submission
    setHasVoted(true);
  };

  const getTotalVotes = () => {
    return pollData.options?.reduce((sum: number, option: any) => sum + (option.votes || 0), 0) || 0;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{pollData.question}</h3>
      
      <div className="space-y-2">
        {pollData.options?.map((option: any) => {
          const percentage = getTotalVotes() > 0 ? (option.votes / getTotalVotes()) * 100 : 0;
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <div key={option.id} className="space-y-1">
              <button
                onClick={() => handleOptionSelect(option.id)}
                disabled={!canVote}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  canVote 
                    ? isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted'
                    : 'border-border cursor-default'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option.text}</span>
                  {!canVote && (
                    <span className="text-xs text-muted-foreground">
                      {option.votes || 0} Stimmen
                    </span>
                  )}
                </div>
                {!canVote && (
                  <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {canVote && (
        <Button 
          onClick={handleVote}
          disabled={selectedOptions.length === 0}
          className="w-full"
        >
          {t('feed.poll.vote')}
        </Button>
      )}

      {isPollEnded && (
        <p className="text-sm text-muted-foreground text-center">
          {t('feed.poll.ended')}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('feed.poll.total_votes', { count: getTotalVotes() })}</span>
        <span>
          Endet {formatDistanceToNow(new Date(pollData.ends_at), { addSuffix: true, locale: de })}
        </span>
      </div>
    </div>
  );
}

// Event Content Component
function EventContent({ eventData }: { eventData: any }) {
  const { t } = useTranslation();
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'interested' | 'declined' | null>(null);

  if (!eventData) return null;

  const handleRSVP = (status: 'going' | 'interested' | 'declined') => {
    setRsvpStatus(status);
    // TODO: Implement RSVP submission
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{eventData.title}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatEventDate(eventData.start_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              {eventData.is_online ? (
                <ExternalLink className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>{eventData.location || 'Online'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={rsvpStatus === 'going' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRSVP('going')}
        >
          {t('feed.event.going')}
        </Button>
        <Button
          variant={rsvpStatus === 'interested' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRSVP('interested')}
        >
          {t('feed.event.interested')}
        </Button>
        <Button
          variant={rsvpStatus === 'declined' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRSVP('declined')}
        >
          {t('feed.event.declined')}
        </Button>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{t('feed.event.attendee_count', { count: eventData.rsvp_count || 0 })}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          {t('feed.event.add_to_calendar')}
        </Button>
      </div>
    </div>
  );
}

// Job Share Content Component
function JobShareContent({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm">{content}</p>
      <Badge variant="secondary">Job-Anzeige</Badge>
    </div>
  );
}

// Text Content Component
function TextContent({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );
}
