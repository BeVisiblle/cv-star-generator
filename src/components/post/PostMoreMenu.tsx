'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Flag, EyeOff, Clock, Undo2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PostMoreMenuProps {
  postId: string;
  authorId?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
}

export function PostMoreMenu({ 
  postId, 
  authorId,
  className,
  size = 'sm',
  variant = 'ghost'
}: PostMoreMenuProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const isOwnPost = user?.id === authorId;

  const handleReport = async () => {
    if (!user || !reportReason) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason: reportReason,
        });
      
      if (error) throw error;
      
      toast.success('Post wurde gemeldet');
      setShowReportDialog(false);
      setReportReason('');
    } catch (error: any) {
      console.error('Error reporting post:', error);
      toast.error('Fehler beim Melden des Posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHide = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('post_mutes')
        .insert({
          profile_id: user.id,
          post_id: postId,
          until: null, // Permanent hide
        });
      
      if (error) throw error;
      
      toast.success('Post wird nicht mehr angezeigt');
    } catch (error: any) {
      console.error('Error hiding post:', error);
      toast.error('Fehler beim Verbergen des Posts');
    }
  };

  const handleSnooze = async (days: number) => {
    if (!user) return;
    
    try {
      const until = new Date();
      until.setDate(until.getDate() + days);
      
      const { error } = await supabase
        .from('post_mutes')
        .insert({
          profile_id: user.id,
          post_id: postId,
          until: until.toISOString(),
        });
      
      if (error) throw error;
      
      toast.success(`Post wird für ${days} Tage ausgeblendet`);
    } catch (error: any) {
      console.error('Error snoozing post:', error);
      toast.error('Fehler beim Snoozen des Posts');
    }
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn(
              "h-8 px-2 text-muted-foreground hover:text-foreground",
              className
            )}
            aria-label={t('moderation.more')}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isOwnPost && (
            <>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <Flag className="h-4 w-4 mr-2" />
                {t('moderation.report')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={handleHide}>
            <EyeOff className="h-4 w-4 mr-2" />
            {t('moderation.hide')}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSnooze(7)}>
            <Clock className="h-4 w-4 mr-2" />
            {t('moderation.snooze_7')}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSnooze(30)}>
            <Clock className="h-4 w-4 mr-2" />
            {t('moderation.snooze_30')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post melden</DialogTitle>
            <DialogDescription>
              Warum möchtest du diesen Post melden?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <RadioGroup value={reportReason} onValueChange={setReportReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spam" id="spam" />
                <Label htmlFor="spam">{t('moderation.report_reasons.spam')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate" id="inappropriate" />
                <Label htmlFor="inappropriate">{t('moderation.report_reasons.inappropriate')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="misleading" id="misleading" />
                <Label htmlFor="misleading">{t('moderation.report_reasons.misleading')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">{t('moderation.report_reasons.other')}</Label>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleReport} disabled={!reportReason || isLoading}>
              Melden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
