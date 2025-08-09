import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    created_at: string;
    user_id: string;
    recent_interaction?: string; // z. B. "Florian hat das kommentiert"
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

  const handleLike = () => {
    // Placeholder for like functionality
    console.log('Like functionality not yet implemented');
  };

  const handleComment = () => {
    // Placeholder for comment functionality
    console.log('Comment functionality not yet implemented');
    setNewComment('');
  };

  const handleShare = () => {
    // Placeholder for share functionality
    console.log('Share functionality not yet implemented');
  };

  return (
    <Card className="p-0">
      {/* Interaction hint */}
      {post.recent_interaction && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b">
          {post.recent_interaction}
        </div>
      )}

      <div className="p-6 space-y-4">
      {/* Post Header */}
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author?.avatar_url} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm">{getDisplayName()}</h3>
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
        <p className="text-sm leading-relaxed">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post image"
            className="rounded-lg max-w-full h-auto"
          />
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            className="text-muted-foreground hover:text-red-500"
          >
            <Heart className="h-4 w-4 mr-1" />
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
              disabled={!newComment.trim()}
            >
              Senden
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Kommentar-Feature wird bald verfügbar sein.
          </p>
        </div>
      )}
      </div>
    </Card>
  );
}