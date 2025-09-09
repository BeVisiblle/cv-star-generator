import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n';
import { PersonMiniCard } from '../cards/PersonMiniCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PersonProfile {
  id: string;
  display_name: string;
  headline?: string;
  avatar_url?: string;
  verified?: boolean;
  follower_count?: number;
  is_following?: boolean;
  is_connected?: boolean;
  connection_status?: 'pending' | 'accepted' | 'rejected';
}

export function InterestingPeopleWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInterestingPeople();
    }
  }, [user]);

  const loadInterestingPeople = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the RPC function to get interesting people
      const { data, error: rpcError } = await supabase
        .rpc('get_interesting_profiles', {
          viewer_id: user?.id,
          profile_type: 'person',
          limit_count: 5
        });

      if (rpcError) {
        console.error('Error loading interesting people:', rpcError);
        setError('Fehler beim Laden der Personen');
        return;
      }

      // Transform the data to match our interface
      const transformedPeople: PersonProfile[] = (data || []).map((person: any) => ({
        id: person.profile_id,
        display_name: person.display_name,
        headline: person.headline,
        avatar_url: person.avatar_url,
        verified: person.verified,
        follower_count: person.follower_count,
        is_following: person.is_following,
        is_connected: person.is_connected,
        connection_status: person.is_connected ? 'accepted' : undefined
      }));

      setPeople(transformedPeople);
    } catch (error) {
      console.error('Error loading interesting people:', error);
      setError('Fehler beim Laden der Personen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (personId: string) => {
    try {
      // TODO: Implement connection request
      console.log('Connect to person:', personId);
      
      // Update local state optimistically
      setPeople(prev => prev.map(person => 
        person.id === personId 
          ? { ...person, connection_status: 'pending' }
          : person
      ));
    } catch (error) {
      console.error('Error connecting to person:', error);
    }
  };

  const handleFollow = async (personId: string) => {
    try {
      // TODO: Implement follow functionality
      console.log('Follow person:', personId);
      
      // Update local state optimistically
      setPeople(prev => prev.map(person => 
        person.id === personId 
          ? { ...person, is_following: true }
          : person
      ));
    } catch (error) {
      console.error('Error following person:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('widgets.interesting_people')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('widgets.interesting_people')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={loadInterestingPeople}>
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (people.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('widgets.interesting_people')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Keine interessanten Personen gefunden
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('widgets.interesting_people')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {people.map((person) => (
          <PersonMiniCard
            key={person.id}
            person={person}
            onConnect={handleConnect}
            onFollow={handleFollow}
          />
        ))}
        
        {people.length >= 5 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-xs">
              Alle anzeigen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
