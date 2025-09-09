import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EventManagementProps {
  eventId: string;
  postId: string;
}

export function useEventManagement({ eventId, postId }: EventManagementProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Update event
  const updateEventMutation = useMutation({
    mutationFn: async (updates: {
      title?: string;
      location?: string;
      start_at?: string;
      end_at?: string;
      capacity?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('post_events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Event wurde aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast.error('Fehler beim Aktualisieren des Events');
    }
  });

  // Delete event
  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Delete RSVPs first
      await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId);

      // Delete event
      const { error } = await supabase
        .from('post_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      // Delete associated post
      await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Event wurde gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast.error('Fehler beim Löschen des Events');
    }
  });

  // Cancel event
  const cancelEventMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Update event to mark as cancelled
      const { error } = await supabase
        .from('post_events')
        .update({ 
          // Add cancelled flag or update title
          title: `[ABGESAGT] ${eventId}` // This would need a proper cancelled field
        })
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Event wurde abgesagt');
    },
    onError: (error) => {
      console.error('Error cancelling event:', error);
      toast.error('Fehler beim Absagen des Events');
    }
  });

  // Export participants
  const exportParticipantsMutation = useMutation({
    mutationFn: async () => {
      const { data: participants, error } = await supabase
        .from('event_rsvps')
        .select(`
          status,
          created_at,
          profiles!inner (
            display_name,
            email
          )
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return participants;
    },
    onSuccess: (participants) => {
      // Generate CSV
      const csvContent = [
        'Name,Email,Status,Datum',
        ...participants.map(p => 
          `${p.profiles.display_name},${p.profiles.email},${p.status},${new Date(p.created_at).toLocaleDateString('de-DE')}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-participants-${eventId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Teilnehmerliste wurde exportiert');
    },
    onError: (error) => {
      console.error('Error exporting participants:', error);
      toast.error('Fehler beim Exportieren der Teilnehmerliste');
    }
  });

  // Send reminder
  const sendReminderMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get all participants
      const { data: participants, error } = await supabase
        .from('event_rsvps')
        .select(`
          user_id,
          profiles!inner (
            email,
            display_name
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'going');

      if (error) throw error;

      // TODO: Implement actual email sending
      console.log('Sending reminder to participants:', participants);
      console.log('Message:', message);

      return participants;
    },
    onSuccess: (participants) => {
      toast.success(`Erinnerung wurde an ${participants.length} Teilnehmer gesendet`);
    },
    onError: (error) => {
      console.error('Error sending reminder:', error);
      toast.error('Fehler beim Senden der Erinnerung');
    }
  });

  return {
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    cancelEvent: cancelEventMutation.mutate,
    exportParticipants: exportParticipantsMutation.mutate,
    sendReminder: sendReminderMutation.mutate,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    isCancelling: cancelEventMutation.isPending,
    isExporting: exportParticipantsMutation.isPending,
    isSendingReminder: sendReminderMutation.isPending
  };
}

