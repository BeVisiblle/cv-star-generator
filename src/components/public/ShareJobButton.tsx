import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ShareJobButtonProps {
  jobId: string;
  orgId?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ShareJobButton({ 
  jobId, 
  orgId, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: ShareJobButtonProps) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  async function shareJob() {
    if (!orgId) {
      toast({
        title: "Fehler",
        description: "Unternehmens-ID fehlt. Job kann nicht geteilt werden.",
        variant: "destructive"
      });
      return;
    }

    setBusy(true);
    
    try {
      const { data, error } = await supabase.rpc('share_job_as_post', { 
        p_company_id: orgId, 
        p_job_id: jobId 
      });
      
      if (error) {
        if (error.message.includes('job_limit_reached')) {
          toast({
            title: "Limit erreicht",
            description: "Sie können nur 1 Job pro Woche teilen.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Fehler beim Teilen",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Job geteilt",
        description: "Der Job wurde erfolgreich in der Community geteilt.",
      });

      // Navigate to community page to see the shared post
      navigate('/community');
      
    } catch (error) {
      console.error('Error sharing job:', error);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={shareJob} 
      disabled={busy || !orgId}
      className={className}
    >
      <Share2 className="h-4 w-4 mr-2" />
      {busy ? 'Teile...' : 'In Community teilen'}
    </Button>
  );
}

export default ShareJobButton;
