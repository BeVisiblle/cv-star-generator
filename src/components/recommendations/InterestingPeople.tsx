import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonMiniCard } from '@/components/cards/PersonMiniCard';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

type Person = {
  id: string;
  display_name: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  status?: string | null;
  branche?: string | null;
  ort?: string | null;
  verified?: boolean;
  follower_count?: number;
  is_following?: boolean;
  is_connected?: boolean;
  connection_status?: 'pending' | 'accepted' | 'rejected';
};

export function InterestingPeople() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const viewerId = user?.id;

  useEffect(() => {
    if (!viewerId) return;
    loadPeople();
  }, [viewerId]);

  const loadPeople = async () => {
    if (!viewerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await (supabase as any).rpc("suggest_people", { 
        p_viewer: viewerId, 
        p_limit: 3 
      }) as { data: Person[] | null; error: any };

      if (fetchError) throw fetchError;
      
      setPeople(data || []);
    } catch (err: any) {
      console.error('Error loading people:', err);
      setError(err.message || 'Fehler beim Laden der Empfehlungen');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (personId: string) => {
    if (!viewerId) return;
    
    try {
      await supabase.from("connections").insert({ 
        requester_id: viewerId, 
        addressee_id: personId, 
        status: "pending" 
      });
      
      await supabase.rpc("suggestions_touch", { 
        p_viewer: viewerId, 
        p_type: "profile", 
        p_target: personId 
      });
      
      // Update local state
      setPeople(prev => prev.map(p => 
        p.id === personId 
          ? { ...p, connection_status: 'pending' as const }
          : p
      ));
    } catch (error) {
      console.error('Error connecting:', error);
      throw error;
    }
  };

  const handleFollow = async (personId: string) => {
    if (!viewerId) return;
    
    try {
      await supabase.from("follows").insert({ 
        follower_id: viewerId, 
        target_id: personId 
      });
      
      // Update local state
      setPeople(prev => prev.map(p => 
        p.id === personId 
          ? { ...p, is_following: true }
          : p
      ));
    } catch (error) {
      console.error('Error following:', error);
      throw error;
    }
  };

  if (!viewerId) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {t('widgets.interesting_people')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        
        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}
        
        {!loading && !error && people.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Keine Empfehlungen verfügbar
            </p>
          </div>
        )}
        
        {!loading && !error && people.map((person) => (
          <PersonMiniCard
            key={person.id}
            person={{
              id: person.id,
              display_name: person.display_name || 'Unbekannt',
              headline: person.headline || [person.status, person.branche].filter(Boolean).join(' • '),
              avatar_url: person.avatar_url,
              verified: person.verified,
              follower_count: person.follower_count,
              is_following: person.is_following,
              is_connected: person.is_connected,
              connection_status: person.connection_status,
            }}
            onConnect={handleConnect}
            onFollow={handleFollow}
          />
        ))}
      </CardContent>
    </Card>
  );
}
