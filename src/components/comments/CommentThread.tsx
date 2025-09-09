import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Reply, 
  MoreHorizontal, 
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { CommentItem } from './CommentItem';
import { AvatarClickable } from '../common/AvatarClickable';

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
}

interface CommentThreadProps {
  postId: string;
  sortBy?: 'relevant' | 'newest';
  maxReplies?: number;
}

export function CommentThread({ 
  postId, 
  sortBy = 'relevant',
  maxReplies = 3 
}: CommentThreadProps) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [sortOrder, setSortOrder] = useState<'relevant' | 'newest'>(sortBy);

  // Mock data for now - replace with actual API calls
  const mockComments: Comment[] = [
    {
      id: '1',
      content: 'Das ist ein sehr interessanter Beitrag! Ich stimme voll und ganz zu.',
      author: {
        id: 'user1',
        display_name: 'Max Mustermann',
        avatar_url: '',
        verified: false
      },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes_count: 5,
      replies_count: 2,
      replies: [
        {
          id: '1-1',
          content: 'Danke für deine Meinung!',
          author: {
            id: 'user2',
            display_name: 'Anna Schmidt',
            avatar_url: '',
            verified: true
          },
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          likes_count: 2,
          replies_count: 0,
          is_liked: false
        },
        {
          id: '1-2',
          content: 'Sehe ich genauso!',
          author: {
            id: 'user3',
            display_name: 'Tom Weber',
            avatar_url: '',
            verified: false
          },
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          likes_count: 1,
          replies_count: 0,
          is_liked: true
        }
      ],
      is_liked: false
    },
    {
      id: '2',
      content: 'Kannst du das nochmal genauer erklären?',
      author: {
        id: 'user4',
        display_name: 'Lisa Müller',
        avatar_url: '',
        verified: false
      },
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes_count: 1,
      replies_count: 0,
      is_liked: false
    }
  ];

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual comment submission
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          id: 'current-user',
          display_name: 'Du',
          avatar_url: '',
          verified: false
        },
        created_at: new Date().toISOString(),
        likes_count: 0,
        replies_count: 0,
        is_liked: false
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = (commentId: string) => {
    // TODO: Implement comment like functionality
    console.log('Like comment:', commentId);
  };

  const handleReplyToComment = (commentId: string, replyContent: string) => {
    // TODO: Implement reply functionality
    console.log('Reply to comment:', commentId, replyContent);
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, maxReplies);
  const hasMoreComments = comments.length > maxReplies;

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback>DU</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={t('feed.comments.write_comment')}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Poste...' : 'Kommentieren'}
            </Button>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      {comments.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {comments.length} Kommentar{comments.length !== 1 ? 'e' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={sortOrder === 'relevant' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortOrder('relevant')}
            >
              {t('feed.comments.sort_relevant')}
            </Button>
            <Button
              variant={sortOrder === 'newest' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortOrder('newest')}
            >
              {t('feed.comments.sort_newest')}
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {displayedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onLike={handleLikeComment}
            onReply={handleReplyToComment}
            showReplies={true}
          />
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMoreComments && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllComments(!showAllComments)}
            className="text-muted-foreground"
          >
            {showAllComments ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Weniger anzeigen
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {comments.length - maxReplies} weitere Kommentare anzeigen
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
