import React, { useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Send, MoreHorizontal, ThumbsUp, Laugh, Globe, Smile, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { usePostLikes, usePostComments, usePostReposts } from '@/hooks/usePostInteractions';
import { useCommentLikes } from '@/hooks/useCommentLikes';
import { useNavigate } from 'react-router-dom';
import QuickMessageDialog from '@/components/community/QuickMessageDialog';
import { useAuth } from '@/hooks/useAuth';
import FilePreview from '@/components/upload/FilePreview';
import { UploadedAttachment } from '@/lib/uploads';
import EmploymentBadge from '@/components/employment/EmploymentBadge';
import CommentItem from './CommentItem';

interface LinkedInPostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    media?: string[];
    created_at: string;
    user_id: string;
    author_type?: 'user' | 'company';
    author_id?: string;
    recent_interaction?: string;
    author?: {
      id: string;
      vorname?: string;
      nachname?: string;
      avatar_url?: string;
      ausbildungsberuf?: string;
      schule?: string;
      ausbildungsbetrieb?: string;
      aktueller_beruf?: string;
      status?: string;
      employment_status?: string;
      company_name?: string;
      company_logo?: string;
      company_id?: string;
    } | null;
    company?: {
      id: string;
      name?: string;
      logo_url?: string;
      industry?: string;
    } | null;
  };
}

interface Comment {
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
  replies?: Comment[];
}

export default function LinkedInPostCard({ post }: LinkedInPostCardProps) {
  const [showComments, setShowComments] = useState(true); // Always show comments
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const commentInputRef = useRef<HTMLInputElement>(null);

  const { count: likeCount, liked, toggleLike, isToggling } = usePostLikes(post.id);
  const { comments, commentsCount, addComment, isAdding } = usePostComments(post.id);
  const { count: shareCount, hasReposted, repost, isReposting } = usePostReposts(post.id);

  const getDisplayName = () => {
    if (post.author_type === 'company' && post.company?.name) {
      return post.company.name;
    }
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname} ${post.author.nachname}`;
    }
    return 'Unbekannter Nutzer';
  };

  const getInitials = () => {
    if (post.author_type === 'company' && post.company?.name) {
      return post.company.name.slice(0, 2).toUpperCase();
    }
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname[0]}${post.author.nachname[0]}`;
    }
    return 'U';
  };

  const authorSubtitle = useMemo(() => {
    if (post.author_type === 'company') return post.company?.industry || '';
    const a = post.author as any;
    if (!a) return '';
    
    if (a.employment_status && a.headline && a.company_name) {
      return `${a.headline} bei ${a.company_name}`;
    }
    
    if (a.status === 'schueler' && a.schule) return `Schüler bei ${a.schule}`;
    if (a.status === 'azubi') {
      const job = a.ausbildungsberuf ? `${a.ausbildungsberuf}` : 'Auszubildender';
      const company = a.ausbildungsbetrieb ? ` bei ${a.ausbildungsbetrieb}` : '';
      return `${job}${company}`;
    }
    if (a.status === 'ausgelernt') {
      const job = a.aktueller_beruf || a.ausbildungsberuf || 'Mitarbeiter';
      const company = a.ausbildungsbetrieb ? ` bei ${a.ausbildungsbetrieb}` : '';
      return `${job}${company}`;
    }
    return a.ausbildungsberuf || a.headline || '';
  }, [post.author, post.author_type, post.company]);

  const truncated = useMemo(() => {
    const maxLen = 300;
    if (expanded) return post.content;
    if (post.content.length <= maxLen) return post.content;
    return post.content.slice(0, maxLen) + '...';
  }, [post.content, expanded]);

  const isLong = post.content.length > 300;

  const handleLike = () => toggleLike();

  const handleComment = () => {
    const text = newComment.trim();
    if (!text) return;
    addComment(text, replyTo?.id || null);
    setNewComment('');
    setReplyTo(null);
  };

  const handleShareCommunity = async () => {
    if (hasReposted) {
      toast({ title: 'Schon geteilt', description: 'Du hast diesen Beitrag bereits geteilt.' });
      return;
    }
    repost();
  };

  const profileRoute = post.author_type === 'company' && post.company?.id 
    ? `/companies/${post.company.id}` 
    : (user?.id && (post.author?.id === user.id || post.user_id === user.id) 
      ? '/profile' 
      : `/u/${post.author?.id || post.user_id}`);

  const postLink = `${window.location.origin}/marketplace#post-${post.id}`;

  const renderMedia = () => {
    const mediaUrls = post.media || (post.image_url ? [post.image_url] : []);
    if (mediaUrls.length === 0) return null;

    const attachments: UploadedAttachment[] = mediaUrls.map((url, index) => ({
      id: `media-${index}`,
      storage_path: url,
      mime_type: url.includes('.pdf') ? 'application/pdf' : 'image/jpeg',
      url: url
    }));

    return (
      <div className="mt-3">
        <FilePreview files={attachments} />
      </div>
    );
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyTo({ id: commentId, name: authorName });
    setNewComment(`@${authorName.split(' ')[0]} `);
    commentInputRef.current?.focus();
  };

  return (
    <Card className="overflow-hidden">
      {/* Post Header */}
      <div className="p-4">
        {post.recent_interaction && (
          <div className="mb-2 text-xs text-muted-foreground">
            {post.recent_interaction}
          </div>
        )}
        <div className="flex items-start gap-3">
          <Avatar 
            className="h-12 w-12 cursor-pointer" 
            onClick={() => navigate(profileRoute)}
          >
            <AvatarImage 
              src={post.author_type === 'company' 
                ? (post.company?.logo_url || undefined) 
                : (post.author?.avatar_url || undefined)} 
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button 
                className="font-semibold text-sm hover:underline text-left" 
                onClick={() => navigate(profileRoute)}
              >
                {getDisplayName()}
              </button>
              {post.author_type === 'user' && (
                <div className="flex items-center gap-1">
                  <span className="inline-flex h-4 items-center justify-center rounded-[3px] bg-blue-600 px-1.5 text-[10px] font-bold leading-none text-white">
                    in
                  </span>
                </div>
              )}
            </div>
            
            {authorSubtitle && (
              <p className="text-xs text-muted-foreground">{authorSubtitle}</p>
            )}
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: de })}</span>
              <span>•</span>
              <Globe className="h-3 w-3" />
            </div>
            
            {/* Employment Badge */}
            {post.author_type === 'user' && post.author?.employment_status === 'accepted' && post.author?.company_name && (
              <div className="mt-2">
                <EmploymentBadge
                  companyName={post.author.company_name}
                  companyLogo={post.author.company_logo}
                  companyId={post.author.company_id}
                  role="Mitarbeiter"
                  status="accepted"
                  size="sm"
                />
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4">
        <div className="text-sm leading-relaxed break-words">
          {truncated}
          {!expanded && isLong && (
            <button 
              className="ml-1 text-muted-foreground hover:underline" 
              onClick={() => setExpanded(true)}
            >
              ... mehr anzeigen
            </button>
          )}
        </div>
        <button className="mt-2 text-xs text-muted-foreground hover:underline">
          Übersetzung anzeigen
        </button>
        {renderMedia()}
      </div>

      {/* Engagement Stats */}
      {(likeCount > 0 || commentsCount > 0 || shareCount > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-b">
          <div className="flex items-center gap-1">
            {likeCount > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <ThumbsUp className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <Heart className="h-2.5 w-2.5 text-white fill-white" />
                  </div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Laugh className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <span className="ml-1">{likeCount}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {commentsCount > 0 && <span>{commentsCount} Kommentare</span>}
            {shareCount > 0 && <span>{shareCount} Reposts</span>}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-2 flex items-center justify-between border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isToggling}
          className={`flex-1 gap-2 hover:bg-blue-50 ${liked ? 'text-blue-600' : 'text-muted-foreground'}`}
        >
          <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
          <span>Gefällt mir</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2 text-muted-foreground hover:bg-gray-50"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Kommentieren</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShareCommunity}
          disabled={isReposting}
          className={`flex-1 gap-2 hover:bg-green-50 ${hasReposted ? 'text-green-600' : 'text-muted-foreground'}`}
        >
          <Share2 className="h-5 w-5" />
          <span>Reposten</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSendOpen(true)}
          className="flex-1 gap-2 text-muted-foreground hover:bg-gray-50"
        >
          <Send className="h-5 w-5" />
          <span>Senden</span>
        </Button>
      </div>

      {/* Comments Section - Always visible */}
      <div className="px-4 py-3">
        {/* Comment Input */}
        <div className="flex gap-2 mb-4">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs">
              {user?.user_metadata?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center gap-2">
            <Input
              ref={commentInputRef}
              placeholder={replyTo ? `Antwort an ${replyTo.name}...` : 'Kommentar hinzufügen...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
              className="flex-1 rounded-full"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
              <Smile className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {comments.length > 0 && (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id}
                comment={comment as any}
                onReply={handleReply}
              />
            ))}
            
            {commentsCount > comments.length && (
              <button className="text-sm text-muted-foreground hover:underline font-medium">
                Weitere Kommentare laden
              </button>
            )}
          </div>
        )}
      </div>

      {/* DM dialog */}
      <QuickMessageDialog 
        open={sendOpen} 
        onOpenChange={setSendOpen} 
        initialContent={`Schau dir diesen Beitrag an: ${postLink}`} 
      />
    </Card>
  );
}
