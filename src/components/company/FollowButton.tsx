import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Bell, UserMinus } from 'lucide-react';

type Props = {
  companyId: string;
  profileId: string;
  initialFollowing?: boolean;
  initialBell?: 'off' | 'highlights' | 'all';
  onChange?: (state: { following: boolean; bell: 'off' | 'highlights' | 'all' }) => void;
};

export default function FollowButton({
  companyId,
  profileId,
  initialFollowing = false,
  initialBell = 'highlights',
  onChange
}: Props) {
  const { toast } = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [bellOpen, setBellOpen] = useState(false);
  const [bell, setBell] = useState<'off' | 'highlights' | 'all'>(initialBell);
  const [loading, setLoading] = useState(false);

  const follow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Profile -> Company = immediate accepted
      const { error } = await supabase.functions.invoke('request-follow', {
        body: {
          follower_type: 'profile',
          follower_id: profileId,
          followee_type: 'company',
          followee_id: companyId
        }
      });
      
      if (error) throw error;
      
      setFollowing(true);
      onChange?.({ following: true, bell });
      toast({ description: 'Unternehmen folgen erfolgreich!' });
    } catch (error) {
      console.error('Error following company:', error);
      toast({ 
        variant: 'destructive',
        description: 'Fehler beim Folgen des Unternehmens'
      });
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('unfollow_company', { 
        p_profile_id: profileId, 
        p_company_id: companyId 
      });
      
      if (error) throw error;
      
      setFollowing(false);
      onChange?.({ following: false, bell });
      toast({ description: 'Unternehmen entfolgt' });
    } catch (error) {
      console.error('Error unfollowing company:', error);
      toast({ 
        variant: 'destructive',
        description: 'Fehler beim Entfolgen'
      });
    } finally {
      setLoading(false);
    }
  };

  const setBellPref = async (next: 'off' | 'highlights' | 'all') => {
    setBell(next); // optimistic update
    try {
      const { error } = await supabase.functions.invoke('set-bell', {
        body: { profile_id: profileId, company_id: companyId, bell: next }
      });
      
      if (error) throw error;
      
      onChange?.({ following, bell: next });
      toast({ description: 'Benachrichtigungseinstellungen aktualisiert' });
    } catch (error) {
      console.error('Error setting bell preference:', error);
      // Revert optimistic update
      setBell(initialBell);
      toast({ 
        variant: 'destructive',
        description: 'Fehler beim Speichern der Benachrichtigungseinstellungen'
      });
    }
  };

  if (!following) {
    return (
      <Button
        onClick={follow}
        disabled={loading}
        className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground hover:opacity-90"
      >
        {loading ? 'Folge …' : 'Folgen'}
      </Button>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setBellOpen(v => !v)}
        className="gap-2"
      >
        <Bell className="h-4 w-4" />
        {bell === 'all' ? 'Alle' : bell === 'highlights' ? 'Highlights' : 'Aus'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={unfollow}
        className="gap-2"
      >
        <UserMinus className="h-4 w-4" />
        Entfolgen
      </Button>

      {bellOpen && (
        <div className="absolute right-0 top-11 z-10 w-48 rounded-xl border bg-background p-2 shadow-lg">
          {(['off', 'highlights', 'all'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => { setBellOpen(false); setBellPref(opt); }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                bell === opt ? 'font-semibold bg-accent' : ''
              }`}
            >
              {opt === 'off' ? 'Aus' : opt === 'highlights' ? 'Highlights' : 'Alle'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}