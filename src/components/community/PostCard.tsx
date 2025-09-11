
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

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
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
  const [imageOpen, setImageOpen] = useState(false);
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

          {post.image_url && (
            <div>
              <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg border">
                <img
                  src={post.image_url}
                  alt="Post Bild"
                  className="h-full w-full object-cover cursor-zoom-in"
                  onClick={() => setImageOpen(true)}
                  loading="lazy"
                />
              </AspectRatio>
              <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                <DialogContent className="max-w-3xl">
                  <img src={post.image_url} alt="Bild groß" className="w-full h-auto rounded" />
                </DialogContent>
              </Dialog>
            </div>
          )}
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
        <div className="flex flex-wrap items-center justify-between gap-1 pt-2 border-t">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`text-muted-foreground hover:text-red-500 ${liked ? 'text-red-500' : ''}`}
              disabled={isToggling}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
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
              onClick={handleShareCommunity}
              className="text-muted-foreground"
              disabled={isReposting}
            >
              <Share2 className="h-4 w-4 mr-1" />
              {hasReposted ? 'Geteilt' : 'Teilen'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSendOpen(true)}
              className="text-muted-foreground"
            >
              <Send className="h-4 w-4 mr-1" />
              Direkt senden
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              <Input
                ref={commentInputRef as any}
                placeholder={replyTo ? `Antwort an ${replyTo.name}…` : 'Schreibe einen Kommentar...'}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-w-0"
              />
              <Button size="sm" onClick={handleComment} disabled={!newComment.trim() || isAdding}>
                Senden
              </Button>
            </div>

            {commentsLoading ? (
              <p className="text-xs text-muted-foreground">Kommentare werden geladen…</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sei der Erste, der kommentiert.</p>
            ) : (
              <div className="space-y-3">
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
                      <div className="flex-1 bg-muted/40 border rounded-lg p-2">
                        <button className="text-xs font-medium hover:underline" onClick={() => navigate(`/u/${c.author?.id || c.user_id}`)}>{name}</button>
                        <div className="text-sm whitespace-pre-wrap">{c.content}</div>
                        <div className="mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] px-2"
                            onClick={() => {
                              setReplyTo({ id: c.id, name });
                              setShowComments(true);
                              setNewComment((prev) => (prev.startsWith(mention) ? prev : `${mention} `));
                              setTimeout(() => commentInputRef.current?.focus(), 0);
                            }}
                          >
                            Antworten
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DM dialog */}
      <QuickMessageDialog open={sendOpen} onOpenChange={setSendOpen} initialContent={`Schau dir diesen Beitrag an: ${postLink}`} />
    </Card>
  );
}
