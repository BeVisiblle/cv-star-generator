'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareMenuProps {
  postId: string;
  postUrl?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
}

export function ShareMenu({ 
  postId, 
  postUrl,
  className,
  size = 'sm',
  variant = 'ghost'
}: ShareMenuProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const getPostUrl = () => {
    if (postUrl) return postUrl;
    return `${window.location.origin}/post/${postId}`;
  };

  const handleCopyLink = async () => {
    setIsLoading(true);
    try {
      const url = getPostUrl();
      await navigator.clipboard.writeText(url);
      toast.success(t('share.copied'));
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Fehler beim Kopieren des Links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemShare = async () => {
    if (!navigator.share) {
      // Fallback to copy link
      await handleCopyLink();
      return;
    }

    try {
      await navigator.share({
        title: 'Beitrag teilen',
        text: 'Schau dir diesen Beitrag an',
        url: getPostUrl(),
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Fehler beim Teilen');
      }
    }
  };

  const canUseSystemShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isLoading}
          className={cn(
            "h-8 px-2 text-muted-foreground hover:text-foreground",
            className
          )}
          aria-label={t('share.share')}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink} disabled={isLoading}>
          <Copy className="h-4 w-4 mr-2" />
          {t('share.copy_link')}
        </DropdownMenuItem>
        {canUseSystemShare && (
          <DropdownMenuItem onClick={handleSystemShare}>
            <ExternalLink className="h-4 w-4 mr-2" />
            {t('share.system_share')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
