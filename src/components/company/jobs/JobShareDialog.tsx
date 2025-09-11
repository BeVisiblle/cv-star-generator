import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Euro } from 'lucide-react';
import { useShareJobAsPost } from '@/hooks/useCommunityPosts';
import { useToast } from '@/hooks/use-toast';

interface JobShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
  companyId: string;
}

export default function JobShareDialog({ 
  open, 
  onOpenChange, 
  job, 
  companyId 
}: JobShareDialogProps) {
  const [message, setMessage] = useState('');
  const { mutate: shareJob, isPending } = useShareJobAsPost();
  const { toast } = useToast();

  // Move early return and computation after all hooks
  const handleShare = () => {
    if (!job) return;

    shareJob({
      jobId: job.id,
      companyId: companyId,
      customMessage: message.trim() || undefined,
      visibility: 'public'
    }, {
      onSuccess: () => {
        toast({
          title: "Job geteilt",
          description: "Der Job wurde erfolgreich im Community-Feed geteilt."
        });
        onOpenChange(false);
        setMessage('');
      },
      onError: (error) => {
        console.error('Error sharing job:', error);
        toast({
          title: "Fehler",
          description: "Der Job konnte nicht geteilt werden.",
          variant: "destructive"
        });
      }
    });
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Job im Community-Feed teilen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Custom Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Deine Nachricht (optional)
            </label>
            <Textarea
              placeholder="Füge eine persönliche Nachricht hinzu..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Job Preview */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Job-Vorschau:
            </label>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-muted-foreground">{job.company_name}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.location && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </Badge>
                    )}
                    {job.employment_type && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.employment_type}
                      </Badge>
                    )}
                    {job.salary_range && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        {job.salary_range}
                      </Badge>
                    )}
                  </div>

                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleShare}
              disabled={isPending}
            >
              {isPending ? 'Wird geteilt...' : 'Job teilen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}