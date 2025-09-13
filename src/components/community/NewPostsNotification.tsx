import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NewPostsNotificationProps {
  onRefresh: () => void;
  currentPostIds: string[];
  feedHeadHeight?: number; // Höhe der Feed-Header-Sektion für Sticky-Position
}

export const NewPostsNotification: React.FC<NewPostsNotificationProps> = ({
  onRefresh,
  currentPostIds,
  feedHeadHeight = 0
}) => {
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const { user } = useAuth();

  // Check for new posts every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(async () => {
      const { data: newPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('status', 'published')
        .gt('created_at', lastChecked.toISOString())
        .not('id', 'in', `(${currentPostIds.join(',')})`);

      if (newPosts && newPosts.length > 0) {
        setNewPostsCount(newPosts.length);
        setIsVisible(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, lastChecked, currentPostIds]);

  const handleRefresh = () => {
    setLastChecked(new Date());
    setNewPostsCount(0);
    setIsVisible(false);
    onRefresh();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setNewPostsCount(0);
  };

  if (!isVisible || newPostsCount === 0) {
    return null;
  }

  // Berechne die Sticky-Position: Navbar (64px) + Feed-Header-Höhe + 8px Abstand
  const stickyTop = 64 + feedHeadHeight + 8;

  return (
    <div 
      className="sticky z-30 bg-primary text-primary-foreground rounded-lg p-4 mb-4 shadow-lg"
      style={{ top: `${stickyTop}px` }}
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowUp className="h-5 w-5 animate-bounce" />
          <div>
            <p className="font-medium">
              {newPostsCount === 1 
                ? '1 neuer Beitrag verfügbar' 
                : `${newPostsCount} neue Beiträge verfügbar`
              }
            </p>
            <p className="text-sm opacity-90">
              Klicke hier, um die neuesten Beiträge zu laden
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="secondary"
            className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
          >
            Neu laden
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewPostsNotification;
