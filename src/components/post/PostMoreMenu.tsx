'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Flag, EyeOff, Clock, Undo2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PostMoreMenuProps {
  postId: string;
  authorId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  onPostHidden?: () => void;
  onPostSnoozed?: () => void;
}

export function PostMoreMenu({ 
  postId, 
  authorId,
  className,
  size = 'sm',
  variant = 'ghost',
  onPostHidden,
  onPostSnoozed
}: PostMoreMenuProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isOwnPost = user?.id === authorId;

  const reportReasons = [
    { value: 'spam', label: t('moderation.report_reasons.spam') },
    { value: 'inappropriate', label: t('moderation.report_reasons.inappropriate') },
    { value: 'harassment', label: t('moderation.report_reasons.harassment') },
    { value: 'violence', label: t('moderation.report_reasons.violence') },
    { value: 'false_info', label: t('moderation.report_reasons.false_info') },
    { value: 'other', label: t('moderation.report_reasons.other') },
  ];

  const handleHidePost = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('community_preferences')
        .upsert({
          user_id: user.id,
          blocked_ids: [postId]
        });
      
      if (error) throw error;
      
      toast.success('Post verborgen');
      onPostHidden?.();
    } catch (error) {
      console.error('Error hiding post:', error);
      toast.error('Fehler beim Verbergen des Posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnoozePost = async (days: number) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const snoozeUntil = new Date();
      snoozeUntil.setDate(snoozeUntil.getDate() + days);
      
      const { error } = await supabase
        .from('community_preferences')
        .upsert({
          user_id: user.id,
          blocked_ids: [postId]
        });
      
      if (error) throw error;
      
      toast.success(`Post für ${days} Tage gesnoozed`);
      onPostSnoozed?.();
    } catch (error) {
      console.error('Error snoozing post:', error);
      toast.error('Fehler beim Snoozen des Posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async () => {
    if (!user || !reportReason) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('community_preferences')
        .upsert({
          user_id: user.id,
          blocked_ids: [postId]
        });
      
      if (error) throw error;
      
      toast.success('Meldung gesendet');
      setShowReportDialog(false);
      setReportReason('');
      setReportDetails('');
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Fehler beim Melden des Posts');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
          
          <DropdownMenuItem onClick={handleHidePost} disabled={isLoading}>
            <EyeOff className="h-4 w-4 mr-2" />
            {t('moderation.hide')}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSnoozePost(1)} disabled={isLoading}>
            <Clock className="h-4 w-4 mr-2" />
            {t('moderation.snooze_1')}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleSnoozePost(30)} disabled={isLoading}>
            <Clock className="h-4 w-4 mr-2" />
            {t('moderation.snooze_30')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('moderation.report')}</DialogTitle>
            <DialogDescription>
              Bitte wähle einen Grund für die Meldung aus.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Grund</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Grund auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="details">Zusätzliche Details (optional)</Label>
              <Textarea
                id="details"
                placeholder="Beschreibe das Problem..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleReport}
              disabled={isLoading || !reportReason}
            >
              {isLoading ? 'Wird gesendet...' : 'Melden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
