import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import { useAddCommunityComment } from '@/hooks/useCommunityPosts';

interface CommunityCommentComposerProps {
  postId: string;
  parentCommentId?: string;
  placeholder?: string;
  onCommentAdded?: () => void;
  className?: string;
}

export const CommunityCommentComposer: React.FC<CommunityCommentComposerProps> = ({
  postId,
  parentCommentId,
  placeholder = "Schreibe einen Kommentar...",
  onCommentAdded,
  className = ""
}) => {
  const { user, profile } = useAuth();
  const { company } = useCompany();
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const addComment = useAddCommunityComment();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await addComment.mutateAsync({
        postId,
        body: content.trim(),
        companyId: company?.id,
        parentCommentId
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
      handleSubmit();
    }
  };

  const getUserName = () => {
    if (company?.name) return company.name;
    if (profile?.vorname && profile?.nachname) {
      return `${profile.vorname} ${profile.nachname}`;
    }
    return user?.email || 'Nutzer';
  };

  const getInitials = () => {
    if (company?.name) return company.name.slice(0, 2).toUpperCase();
    if (profile?.vorname && profile?.nachname) {
      return `${profile.vorname[0]}${profile.nachname[0]}`;
    }
    return user?.email?.[0] || 'N';
  };

  const getAvatarUrl = () => {
    if (company?.logo_url) return company.logo_url;
    return profile?.avatar_url;
  };

  if (!user) {
    return (
      <div className={`text-center py-3 ${className}`}>
        <p className="text-sm text-muted-foreground">Melde dich an, um zu kommentieren.</p>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={getAvatarUrl()} alt={getUserName()} />
        <AvatarFallback className="text-xs">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 flex items-center gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !content.trim() && setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="rounded-full border-muted-foreground/20 bg-muted/50 text-sm"
          maxLength={5000}
        />
        
        {(content.trim() || isFocused) && (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || addComment.isPending}
            className="rounded-full h-8 w-8 p-0"
          >
            {addComment.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};