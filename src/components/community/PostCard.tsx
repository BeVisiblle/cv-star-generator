
import React, { useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { usePostLikes, usePostComments, usePostReposts } from '@/hooks/usePostInteractions';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import QuickMessageDialog from '@/components/community/QuickMessageDialog';
import { useAuth } from '@/hooks/useAuth';
import FilePreview from '@/components/upload/FilePreview';
import { UploadedAttachment } from '@/lib/uploads';
import { BookmarkButton } from '@/components/post/BookmarkButton';
import { ShareMenu } from '@/components/post/ShareMenu';
import { PostMoreMenu } from '@/components/post/PostMoreMenu';
import EmploymentBadge from '@/components/employment/EmploymentBadge';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    media?: string[]; // Support for multiple media files
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

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const commentInputRef = useRef<HTMLInputElement>(null);

  const { count: likeCount, liked, isLoading: likesLoading, toggleLike, isToggling } = usePostLikes(post.id);
  const { comments, commentsCount, isLoading: commentsLoading, addComment, isAdding } = usePostComments(post.id);
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
  if (post.author_type === 'company') return '';
  const a = post.author as any;
  if (!a) return '';
  
  // Use live employment data from profiles_public
  if (a.employment_status && a.headline && a.company_name) {
    return `${a.headline} @${a.company_name}`;
  }
  
  // Fallback to legacy fields for backwards compatibility
  if (a.status === 'schueler' && a.schule) return `Schüler @ ${a.schule}`;
  if (a.status === 'azubi') {
    const job = a.ausbildungsberuf ? `im Bereich ${a.ausbildungsberuf}` : '';
    const company = a.ausbildungsbetrieb ? ` @ ${a.ausbildungsbetrieb}` : '';
    return `Auszubildender ${job}${company}`.trim();
  }
  if (a.status === 'ausgelernt') {
    const job = a.aktueller_beruf || a.ausbildungsberuf || 'Mitarbeiter';
    const company = a.ausbildungsbetrieb ? ` @ ${a.ausbildungsbetrieb}` : '';
    return `${job}${company}`;
  }
  return a.ausbildungsberuf || a.headline || '';
}, [post.author, post.author_type]);

  const truncated = useMemo(() => {
    const maxLen = 240;
    if (expanded) return post.content;
    if (post.content.length <= maxLen) return post.content;
    return post.content.slice(0, maxLen) + '…';
  }, [post.content, expanded]);

  const isLong = post.content.length > 240;

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

  const handleOpenComments = () => {
    setShowComments(true);
    setTimeout(() => commentInputRef.current?.focus(), 0);
  };

  const profileRoute = post.author_type === 'company' && post.company?.id ? `/companies/${post.company.id}` : (user?.id && (post.author?.id === user.id || post.user_id === user.id) ? '/profile' : `/u/${post.author?.id || post.user_id}`);

  const postLink = `${window.location.origin}/marketplace#post-${post.id}`;

  const renderMedia = () => {
    // Support both old image_url and new media array
    const mediaUrls = post.media || (post.image_url ? [post.image_url] : []);
    
    if (mediaUrls.length === 0) return null;

    // Convert media URLs to UploadedAttachment format for FilePreview
    const attachments: UploadedAttachment[] = mediaUrls.map((url, index) => ({
      id: `media-${index}`,
      storage_path: url,
      mime_type: url.includes('.pdf') ? 'application/pdf' : 'image/jpeg', // Simple detection
      url: url
    }));

    return (
      <div className="mt-3">
        <FilePreview files={attachments} />
      </div>
    );
  };

  return (
    <Card id={`post-${post.id}`} className="p-0">
      {post.recent_interaction && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b">
          {post.recent_interaction}
        </div>
      )}

      <div className="p-4 md:p-6 space-y-4">
        {/* Post Header */}
        <div className="flex items-start gap-3">
          <div className="cursor-pointer" onClick={() => navigate(profileRoute)}>
<Avatar className="h-10 w-10">
  <AvatarImage src={post.author_type === 'company' ? (post.company?.logo_url || undefined) : (post.author?.avatar_url || undefined)} />
  <AvatarFallback>{getInitials()}</AvatarFallback>
</Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              <button className="font-semibold text-sm hover:underline text-left truncate" onClick={() => navigate(profileRoute)}>
                {getDisplayName()}
              </button>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: de })}
              </span>
            </div>
            {authorSubtitle && (
              <p className="text-xs text-muted-foreground truncate">{authorSubtitle}</p>
            )}
            {/* Employment Badge */}
            {post.author_type === 'user' && post.author?.employment_status === 'accepted' && post.author?.company_name && (
              <div className="mt-1">
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
        </div>

        {/* Post Content */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed break-words">
            {truncated}
            {!expanded && isLong && (
              <button className="ml-1 text-primary hover:underline text-xs" onClick={() => setExpanded(true)}>
                Mehr anzeigen
              </button>
            )}
          </p>

          {renderMedia()}
        </div>

        {/* Counts row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {likesLoading ? '…' : likeCount}
          </span>
          <span className="cursor-pointer" onClick={handleOpenComments}>
            {commentsLoading ? '…' : `${commentsCount} Kommentare`}
          </span>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex-1 gap-2 hover:bg-red-50 ${liked ? 'text-red-500' : 'text-muted-foreground'}`}
            disabled={isToggling}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            <span>Gefällt mir</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenComments}
            className="flex-1 gap-2 text-muted-foreground hover:bg-gray-50"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Kommentieren</span>
          </Button>
          <div className="flex-1 flex justify-center">
            <BookmarkButton postId={post.id} />
          </div>
          <div className="flex-1 flex justify-center">
            <ShareMenu postId={post.id} />
          </div>
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

        {/* Comment Input - Always visible */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex gap-2 mb-4">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xs">
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                ref={commentInputRef as any}
                placeholder={replyTo ? `Antwort an ${replyTo.name}...` : 'Kommentar hinzufügen...'}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
                className="rounded-full border-gray-200"
              />
            </div>
          </div>

          {/* Comments Section */}
          {commentsLoading ? (
            <p className="text-sm text-muted-foreground py-2">Kommentare werden geladen…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">{commentsCount} Kommentare</p>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-2">{commentsCount} Kommentare</div>
              {comments.map((c) => {
                const name = c.author?.vorname && c.author?.nachname
                  ? `${c.author.vorname} ${c.author.nachname}`
                  : 'Unbekannt';
                const initials = c.author?.vorname && c.author?.nachname
                  ? `${c.author.vorname[0]}${c.author.nachname[0]}`
                  : 'U';
                const mention = `@${name.split(' ')[0]}`;
                return (
                  <div key={c.id} className="flex items-start gap-2">
                    <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate(`/u/${c.author?.id || c.user_id}`)}>
                      <AvatarImage src={c.author?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                      <button className="text-sm font-semibold hover:underline text-left" onClick={() => navigate(`/u/${c.author?.id || c.user_id}`)}>{name}</button>
                      <div className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap break-words">{c.content}</div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <button 
                          className="hover:underline font-medium"
                          onClick={() => {
                            setReplyTo({ id: c.id, name });
                            setNewComment((prev) => (prev.startsWith(mention) ? prev : `${mention} `));
                            setTimeout(() => commentInputRef.current?.focus(), 0);
                          }}
                        >
                          Antworten
                        </button>
                        <span>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: de })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DM dialog */}
      <QuickMessageDialog open={sendOpen} onOpenChange={setSendOpen} initialContent={`Schau dir diesen Beitrag an: ${postLink}`} />
    </Card>
  );
}
