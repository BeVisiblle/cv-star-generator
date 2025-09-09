import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface EventData {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at?: string;
  location?: string;
  is_online: boolean;
  cover_url?: string;
  capacity?: number;
  rsvp_count?: number;
  user_rsvp?: 'going' | 'interested' | 'declined' | null;
}

interface EventCardProps {
  eventId: string;
  postId: string;
  title: string;
  className?: string;
}

export function EventCard({ eventId, postId, title, className }: EventCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRsvping, setIsRsvping] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          rsvps: event_rsvps(count)
        `)
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Load user's RSVP if authenticated
      let userRsvp: 'going' | 'interested' | 'declined' | null = null;
      if (user) {
        const { data: rsvpData } = await supabase
          .from('event_rsvps')
          .select('status')
          .eq('event_id', eventId)
          .eq('profile_id', user.id)
          .single();
        
        userRsvp = rsvpData?.status || null;
      }

      setEvent({
        id: eventData.id,
        title: eventData.title,
        description: eventData.description,
        start_at: eventData.starts_at,
        end_at: eventData.ends_at,
        location: eventData.location,
        is_online: eventData.is_online,
        cover_url: eventData.cover_url,
        capacity: eventData.capacity,
        rsvp_count: eventData.rsvps?.[0]?.count || 0,
        user_rsvp: userRsvp,
      });

    } catch (err: any) {
      console.error('Error loading event:', err);
      setError(err.message || 'Fehler beim Laden des Events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRSVP = async (status: 'going' | 'interested' | 'declined') => {
    if (!user || !event || isRsvping) return;
    
    setIsRsvping(true);
    
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          profile_id: user.id,
          status,
        });
      
      if (error) throw error;
      
      // Update local state
      setEvent(prev => prev ? {
        ...prev,
        user_rsvp: status,
        rsvp_count: prev.user_rsvp === status ? prev.rsvp_count : prev.rsvp_count + 1,
      } : null);
      
    } catch (err: any) {
      console.error('Error updating RSVP:', err);
    } finally {
      setIsRsvping(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = () => {
    if (!event) return null;
    
    const now = new Date();
    const startDate = new Date(event.start_at);
    const endDate = event.end_at ? new Date(event.end_at) : null;
    
    if (startDate > now) {
      return {
        text: 'Bevorstehend',
        variant: 'default' as const,
        icon: Clock
      };
    } else if (endDate && endDate > now) {
      return {
        text: 'Läuft gerade',
        variant: 'secondary' as const,
        icon: CheckCircle2
      };
    } else {
      return {
        text: 'Beendet',
        variant: 'destructive' as const,
        icon: AlertCircle
      };
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-muted rounded w-20"></div>
              <div className="h-8 bg-muted rounded w-24"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !event) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Fehler beim Laden des Events</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = getEventStatus();
  const StatusIcon = status?.icon;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatEventDate(event.start_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                {event.is_online ? (
                  <ExternalLink className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>{event.location || 'Online'}</span>
              </div>
              {status && (
                <div className="flex items-center gap-1">
                  <StatusIcon className="h-4 w-4" />
                  <span>{status.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {event.description && (
          <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
        )}

        <div className="flex gap-2 mb-4">
          <Button
            variant={event.user_rsvp === 'going' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRSVP('going')}
            disabled={isRsvping}
          >
            {t('feed.event.going')}
          </Button>
          <Button
            variant={event.user_rsvp === 'interested' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRSVP('interested')}
            disabled={isRsvping}
          >
            {t('feed.event.interested')}
          </Button>
          <Button
            variant={event.user_rsvp === 'declined' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRSVP('declined')}
            disabled={isRsvping}
          >
            {t('feed.event.declined')}
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{event.rsvp_count} Teilnehmende</span>
            {event.capacity && (
              <span>• Max. {event.capacity}</span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            {t('feed.event.add_to_calendar')}
          </Button>
        </div>

        {/* Event Type Badge */}
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {event.is_online ? t('feed.event.online_event') : t('feed.event.in_person_event')}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Event</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}