import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Smile, Paperclip, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAddLinkedInComment } from '@/hooks/useLinkedInFeed';

interface LinkedInCommentComposerProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onCommentAdded?: () => void;
  className?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export default function LinkedInCommentComposer({
  postId,
  parentId,
  placeholder = "Kommentar hinzufügen ...",
  onCommentAdded,
  className = "",
  inputRef
}: LinkedInCommentComposerProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { user } = useAuth();
  const addComment = useAddLinkedInComment();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await addComment.mutateAsync({
        postId,
        body: content.trim(),
        parentId
      });
      
      setContent('');
      setIsFocused(false);
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getUserName = () => {
    if ((user as any)?.vorname && (user as any)?.nachname) {
      return `${(user as any).vorname} ${(user as any).nachname}`;
    }
    return user?.email?.split('@')[0] || 'Du';
  };

  const getInitials = () => {
    if ((user as any)?.vorname && (user as any)?.nachname) {
      return `${(user as any).vorname[0]}${(user as any).nachname[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || 'D';
  };

  if (!user) {
    return (
      <div className={`px-4 py-3 border-t text-center ${className}`}>
        <p className="text-sm text-muted-foreground">
          Melden Sie sich an, um zu kommentieren.
        </p>
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 border-t flex gap-3 items-start ${className}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage 
          src={(user as any)?.avatar_url || undefined} 
          alt={getUserName()} 
        />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="relative">
          <Textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !content && setIsFocused(false)}
            placeholder={placeholder}
            className={`w-full rounded-full min-h-[42px] max-h-48 resize-none px-4 py-2 pr-20 
              ${isFocused || content ? 'bg-background border-input' : 'bg-muted border-transparent'}
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
              transition-all duration-200`}
            style={{
              height: 'auto',
              minHeight: '42px'
            }}
          />
          
          {/* Action buttons */}
          <div className="absolute right-2 bottom-1 flex items-center gap-1">
            {(isFocused || content) && (
              <>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8" 
                  title="Emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8" 
                  title="Anhang"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {(isFocused || content) && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8" 
                onClick={handleSubmit}
                disabled={!content.trim() || addComment.isPending}
                title="Senden"
              >
                {addComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}