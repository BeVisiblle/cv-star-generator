import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type RSVPStatus = 'going' | 'interested' | 'declined';

interface EventData {
  id: string;
  post_id: string;
  title: string;
  is_online: boolean;
  location?: string;
  link_url?: string;
  start_at: string;
  end_at: string;
  capacity?: number;
  description?: string;
  cover_url?: string;
  rsvp_count: number;
  user_rsvp?: RSVPStatus;
  is_full: boolean;
  is_past: boolean;
  is_ongoing: boolean;
  time_remaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

interface RSVPParticipant {
  id: string;
  display_name: string;
  avatar_url?: string;
  verified?: boolean;
  rsvp_status: RSVPStatus;
  rsvp_date: string;
}

interface UseEventProps {
  eventId: string;
  postId: string;
}

export function useEvent({ eventId, postId }: UseEventProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [optimisticRSVP, setOptimisticRSVP] = useState<RSVPStatus | null>(null);

  // Load event data
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data: eventData, error: eventError } = await supabase
        .from('post_events')
        .select(`
          id,
          post_id,
          title,
          is_online,
          location,
          link_url,
          start_at,
          end_at,
          capacity
        `)
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Get RSVP count
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('event_rsvps')
        .select('status')
        .eq('event_id', eventId);

      if (rsvpError) throw rsvpError;

      // Get user's RSVP if logged in
      let userRSVP: RSVPStatus | undefined;
      if (user) {
        const { data: userRsvpData, error: userRsvpError } = await supabase
          .from('event_rsvps')
          .select('status')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single();

        if (!userRsvpError && userRsvpData) {
          userRSVP = userRsvpData.status as RSVPStatus;
        }
      }

      const rsvpCount = rsvpData?.filter(r => r.status === 'going').length || 0;
      const isFull = eventData.capacity ? rsvpCount >= eventData.capacity : false;
      const now = new Date();
      const startTime = new Date(eventData.start_at);
      const endTime = new Date(eventData.end_at);
      const isPast = endTime < now;
      const isOngoing = startTime <= now && endTime >= now;

      // Calculate time remaining
      const timeRemaining = calculateTimeRemaining(eventData.start_at);

      return {
        id: eventData.id,
        post_id: eventData.post_id,
        title: eventData.title,
        is_online: eventData.is_online,
        location: eventData.location,
        link_url: eventData.link_url,
        start_at: eventData.start_at,
        end_at: eventData.end_at,
        capacity: eventData.capacity,
        rsvp_count: rsvpCount,
        user_rsvp: userRSVP,
        is_full: isFull,
        is_past: isPast,
        is_ongoing: isOngoing,
        time_remaining: timeRemaining
      } as EventData;
    },
    enabled: !!eventId,
    refetchInterval: 60000 // Refetch every minute for time updates
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (status: RSVPStatus) => {
      if (!user) throw new Error('User not authenticated');
      if (!event) throw new Error('Event not loaded');

      if (event.is_past) {
        throw new Error('Event has already ended');
      }

      if (status === 'going' && event.is_full) {
        throw new Error('Event is full');
      }

      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status: status
        });

      if (error) throw error;
      return status;
    },
    onMutate: async (status: RSVPStatus) => {
      // Optimistic update
      setOptimisticRSVP(status);
      
      // Update event data optimistically
      queryClient.setQueryData(['event', eventId], (oldData: EventData | undefined) => {
        if (!oldData) return oldData;

        const previousStatus = oldData.user_rsvp;
        const newRsvpCount = oldData.rsvp_count;
        
        // Adjust RSVP count based on status change
        let adjustedCount = newRsvpCount;
        if (previousStatus === 'going' && status !== 'going') {
          adjustedCount = Math.max(0, adjustedCount - 1);
        } else if (previousStatus !== 'going' && status === 'going') {
          adjustedCount = adjustedCount + 1;
        }

        return {
          ...oldData,
          rsvp_count: adjustedCount,
          user_rsvp: status,
          is_full: oldData.capacity ? adjustedCount >= oldData.capacity : false
        };
      });
    },
    onError: (error, status, context) => {
      // Rollback optimistic update
      setOptimisticRSVP(null);
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      
      console.error('Error updating RSVP:', error);
      toast.error('Fehler beim Aktualisieren der Teilnahme: ' + error.message);
    },
    onSuccess: () => {
      // Invalidate and refetch event data
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    }
  });

  // RSVP function
  const rsvp = useCallback((status: RSVPStatus) => {
    if (!event) return;
    if (event.is_past) {
      toast.error('Das Event ist bereits beendet');
      return;
    }

    if (status === 'going' && event.is_full) {
      toast.error('Das Event ist bereits ausgebucht');
      return;
    }

    rsvpMutation.mutate(status);
  }, [event, rsvpMutation]);

  // Get current RSVP (optimistic or actual)
  const currentRSVP = optimisticRSVP || event?.user_rsvp;

  // Generate calendar event data
  const generateCalendarEvent = useCallback(() => {
    if (!event) return null;

    const start = new Date(event.start_at);
    const end = new Date(event.end_at);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const location = event.is_online 
      ? (event.link_url || 'Online Event')
      : (event.location || 'TBD');

    const description = `Event: ${event.title}\n\n` +
      `Zeit: ${start.toLocaleString('de-DE')} - ${end.toLocaleString('de-DE')}\n` +
      `Ort: ${location}\n\n` +
      `Teilnehmer: ${event.rsvp_count}${event.capacity ? `/${event.capacity}` : ''}`;

    return {
      title: event.title,
      start: formatDate(start),
      end: formatDate(end),
      location: location,
      description: description,
      url: window.location.href
    };
  }, [event]);

  // Download ICS file
  const downloadICS = useCallback(() => {
    const calendarEvent = generateCalendarEvent();
    if (!calendarEvent) return;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Event Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${eventId}@event.com`,
      `DTSTART:${calendarEvent.start}`,
      `DTEND:${calendarEvent.end}`,
      `SUMMARY:${calendarEvent.title}`,
      `LOCATION:${calendarEvent.location}`,
      `DESCRIPTION:${calendarEvent.description}`,
      `URL:${calendarEvent.url}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [event, eventId, generateCalendarEvent]);

  return {
    event,
    isLoading,
    error,
    rsvp,
    currentRSVP,
    generateCalendarEvent,
    downloadICS,
    isRSVPing: rsvpMutation.isPending,
    hasRSVPed: !!currentRSVP
  };
}

function calculateTimeRemaining(startAt: string) {
  const now = new Date();
  const start = new Date(startAt);
  const diff = start.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

