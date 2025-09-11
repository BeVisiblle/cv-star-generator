'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface BookmarkButtonProps {
  postId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export function BookmarkButton({ 
  postId, 
  className,
  size = 'sm',
  variant = 'ghost',
  onBookmarkChange
}: BookmarkButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if post is bookmarked on mount
  React.useEffect(() => {
    if (!user) return;
    
    const checkBookmarkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking bookmark status:', error);
          return;
        }
        
        setIsBookmarked(!!data);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [user, postId]);

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Bitte melde dich an, um Posts zu speichern');
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        if (error) throw error;
        
        setIsBookmarked(false);
        toast.success(t('bookmark.toast_removed'));
        onBookmarkChange?.(false);
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            post_id: postId
          });
        
        if (error) throw error;
        
        setIsBookmarked(true);
        toast.success(t('bookmark.toast_saved'));
        onBookmarkChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Fehler beim Speichern des Posts');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isLoading}
      onClick={handleBookmark}
      className={cn(
        "h-8 px-2 text-muted-foreground hover:text-foreground",
        isBookmarked && "text-primary hover:text-primary",
        className
      )}
      aria-label={isBookmarked ? t('bookmark.saved') : t('bookmark.save')}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
