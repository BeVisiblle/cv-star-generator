import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PollManagementProps {
  pollId: string;
  postId: string;
}

export function usePollManagement({ pollId, postId }: PollManagementProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // End poll early
  const endPollMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('post_polls')
        .update({ ends_at: new Date().toISOString() })
        .eq('id', pollId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Umfrage wurde beendet');
    },
    onError: (error) => {
      console.error('Error ending poll:', error);
      toast.error('Fehler beim Beenden der Umfrage');
    }
  });

  // Delete poll
  const deletePollMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Delete poll options first
      await supabase
        .from('post_poll_options')
        .delete()
        .eq('poll_id', pollId);

      // Delete poll votes
      await supabase
        .from('post_poll_votes')
        .delete()
        .eq('poll_id', pollId);

      // Delete poll
      const { error } = await supabase
        .from('post_polls')
        .delete()
        .eq('id', pollId);

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
      toast.success('Umfrage wurde gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting poll:', error);
      toast.error('Fehler beim Löschen der Umfrage');
    }
  });

  // Extend poll duration
  const extendPollMutation = useMutation({
    mutationFn: async (additionalHours: number) => {
      if (!user) throw new Error('User not authenticated');

      // Get current end time
      const { data: poll, error: fetchError } = await supabase
        .from('post_polls')
        .select('ends_at')
        .eq('id', pollId)
        .single();

      if (fetchError) throw fetchError;

      const currentEndTime = new Date(poll.ends_at);
      const newEndTime = new Date(currentEndTime.getTime() + (additionalHours * 60 * 60 * 1000));

      const { error } = await supabase
        .from('post_polls')
        .update({ ends_at: newEndTime.toISOString() })
        .eq('id', pollId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Umfrage wurde verlängert');
    },
    onError: (error) => {
      console.error('Error extending poll:', error);
      toast.error('Fehler beim Verlängern der Umfrage');
    }
  });

  // Reset poll votes (admin only)
  const resetVotesMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('post_poll_votes')
        .delete()
        .eq('poll_id', pollId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Stimmen wurden zurückgesetzt');
    },
    onError: (error) => {
      console.error('Error resetting votes:', error);
      toast.error('Fehler beim Zurücksetzen der Stimmen');
    }
  });

  return {
    endPoll: endPollMutation.mutate,
    deletePoll: deletePollMutation.mutate,
    extendPoll: extendPollMutation.mutate,
    resetVotes: resetVotesMutation.mutate,
    isEnding: endPollMutation.isPending,
    isDeleting: deletePollMutation.isPending,
    isExtending: extendPollMutation.isPending,
    isResetting: resetVotesMutation.isPending
  };
}

