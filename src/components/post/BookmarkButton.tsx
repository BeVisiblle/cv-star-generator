'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  postId: string;
  isBookmarked?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
}

export function BookmarkButton({ 
  postId, 
  isBookmarked = false, 
  className,
  size = 'sm',
  variant = 'ghost'
}: BookmarkButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (bookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('profile_id', user.id)
          .eq('post_id', postId);
        
        if (error) throw error;
        
        setBookmarked(false);
        toast.success(t('bookmark.toast_removed'));
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            profile_id: user.id,
            post_id: postId,
          });
        
        if (error) throw error;
        
        setBookmarked(true);
        toast.success(t('bookmark.toast_saved'));
      }
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      toast.error('Fehler beim Speichern des Posts');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "h-8 px-2 text-muted-foreground hover:text-foreground",
        bookmarked && "text-primary",
        className
      )}
      aria-label={bookmarked ? t('bookmark.remove') : t('bookmark.save')}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
