
import React, { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { usePostLikes, usePostComments } from '@/hooks/usePostInteractions';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    created_at: string;
    user_id: string;
    recent_interaction?: string;
    author?: {
      id: string;
      vorname?: string;
      nachname?: string;
      avatar_url?: string;
      ausbildungsberuf?: string;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { count: likeCount, liked, isLoading: likesLoading, toggleLike, isToggling } = usePostLikes(post.id);
  const { comments, commentsCount, isLoading: commentsLoading, addComment, isAdding } = usePostComments(post.id);

  const getDisplayName = () => {
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname} ${post.author.nachname}`;
    }
    return 'Unbekannter Nutzer';
  };

  const getInitials = () => {
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname[0]}${post.author.nachname[0]}`;
    }
    return 'U';
  };

  const truncated = useMemo(() => {
    const maxLen = 240;
    if (expanded) return post.content;
    if (post.content.length <= maxLen) return post.content;
    return post.content.slice(0, maxLen) + '…';
  }, [post.content, expanded]);

  const isLong = post.content.length > 240;

  const handleLike = () => {
    console.log('toggle like for', post.id);
    toggleLike();
  };

  const handleComment = () => {
    const text = newComment.trim();
    if (!text) return;
    addComment(text);
    setNewComment('');
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/marketplace#post-${post.id}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Link kopiert', description: 'Beitragslink wurde in die Zwischenablage kopiert.' });
    } catch {
      toast({ title: 'Fehler', description: 'Konnte Link nicht kopieren.', variant: 'destructive' });
    }
  };

  return (
    <Card id={`post-${post.id}`} className="p-0">
      {post.recent_interaction && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b">
          {post.recent_interaction}
        </div>
      )}

      <div className="p-4 sm:p-5 md:p-6 space-y-3 md:space-y-4">
        {/* Post Header */}
        <div className="flex items-start space-x-3">
          <div className="cursor-pointer" onClick={() => navigate(`/u/${post.author?.id || post.user_id}`)}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <button className="font-semibold text-sm hover:underline text-left" onClick={() => navigate(`/u/${post.author?.id || post.user_id}`)}>
                {getDisplayName()}
              </button>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </span>
            </div>
            {post.author?.ausbildungsberuf && (
              <p className="text-xs text-muted-foreground">
                {post.author.ausbildungsberuf}
              </p>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            {truncated}
            {!expanded && isLong && (
              <button
                className="ml-1 text-primary hover:underline text-xs"
                onClick={() => setExpanded(true)}
              >
                Mehr anzeigen
              </button>
            )}
          </p>
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Community Post Bild"
              loading="lazy"
              decoding="async"
              className="w-full max-h-[52vh] object-cover rounded-lg"
            />
          )}
        </div>

        {/* Compact counts row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {likesLoading ? '…' : likeCount}
          </span>
          <span>{commentsLoading ? '…' : `${commentsCount} Kommentare`}</span>
        </div>

        {/* Post Actions */}
        <div className="flex flex-wrap items-center justify-between gap-y-1 pt-2 border-t">
          <div className="flex items-center space-x-1 sm:space-x-2">
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
              onClick={handleShare}
              className="text-muted-foreground"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Teilen
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Schreibe einen Kommentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleComment}
                disabled={!newComment.trim() || isAdding}
              >
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
                    : "Unbekannt";
                  const initials =
                    c.author?.vorname && c.author?.nachname
                      ? `${c.author.vorname[0]}${c.author.nachname[0]}`
                      : "U";
                  return (
                    <div key={c.id} className="flex items-start gap-2">
                      <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate(`/u/${c.author?.id || c.user_id}`)}>
                        <AvatarImage src={c.author?.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/40 border rounded-lg p-2">
                        <button className="text-xs font-medium hover:underline" onClick={() => navigate(`/u/${c.author?.id || c.user_id}`)}>{name}</button>
                        <div className="text-sm">{c.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
