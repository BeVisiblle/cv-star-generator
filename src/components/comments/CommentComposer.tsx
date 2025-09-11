import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Smile, Paperclip, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAddComment } from '@/hooks/useLinkedInPosts';

interface CommentComposerProps {
  postId: string;
  parentId?: string | null;
  placeholder?: string;
  onCommentAdded?: () => void;
  className?: string;
}

export default function CommentComposer({ 
  postId, 
  parentId = null, 
  placeholder = "Kommentar hinzufügen ...",
  onCommentAdded,
  className = ""
}: CommentComposerProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const addComment = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      console.error('Error adding comment:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getUserName = () => {
    if (user?.user_metadata?.vorname && user?.user_metadata?.nachname) {
      return `${user.user_metadata.vorname} ${user.user_metadata.nachname}`;
    }
    return 'Du';
  };

  const getInitials = () => {
    if (user?.user_metadata?.vorname && user?.user_metadata?.nachname) {
      return `${user.user_metadata.vorname[0]}${user.user_metadata.nachname[0]}`;
    }
    return 'D';
  };

  if (!user) {
    return (
      <div className={`px-4 py-3 border-t ${className}`}>
        <div className="text-center text-muted-foreground text-sm">
          <p>Melde dich an, um zu kommentieren</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 border-t ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              if (!content.trim()) {
                setIsFocused(false);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full rounded-full bg-muted px-4 py-2 resize-none min-h-[40px] border-0 focus-visible:ring-2 focus-visible:ring-primary transition-all ${
              isFocused || content ? 'min-h-[80px] rounded-lg' : ''
            }`}
            rows={isFocused || content ? 3 : 1}
          />
          
          {(isFocused || content) && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || addComment.isPending}
                className="h-8 px-4"
              >
                {addComment.isPending ? (
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1" />
                    Senden
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}