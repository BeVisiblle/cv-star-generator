import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PollOption {
  id: string;
  option_text: string;
  votes: number;
  percentage?: number;
}

export interface Poll {
  id: string;
  question: string;
  multiple_choice: boolean;
  ends_at: string;
  show_results_after_vote: boolean;
  is_ended: boolean;
  time_remaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  total_votes: number;
  options: PollOption[];
}

export function usePoll({ pollId, postId }: { pollId: string; postId: string }) {
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [currentVote, setCurrentVote] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    loadPoll();
  }, [pollId]);

  const loadPoll = async () => {
    if (!pollId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load poll data
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options (
            id,
            option_text,
            votes: poll_votes(count)
          )
        `)
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      // Load user's vote if authenticated
      let userVote: string[] = [];
      if (user) {
        const { data: voteData } = await supabase
          .from('poll_votes')
          .select('option_id')
          .eq('poll_id', pollId)
          .eq('voter_id', user.id);
        
        userVote = voteData?.map(v => v.option_id) || [];
        setCurrentVote(userVote);
        setHasVoted(userVote.length > 0);
      }

      // Calculate percentages and format data
      const totalVotes = pollData.poll_options?.reduce((sum: number, opt: any) => sum + (opt.votes?.[0]?.count || 0), 0) || 0;
      const options = pollData.poll_options?.map((opt: any) => ({
        id: opt.id,
        option_text: opt.option_text,
        votes: opt.votes?.[0]?.count || 0,
        percentage: totalVotes > 0 ? Math.round((opt.votes?.[0]?.count || 0) / totalVotes * 100) : 0,
      })) || [];

      const endsAt = new Date(pollData.ends_at);
      const now = new Date();
      const isEnded = endsAt < now;

      const timeRemaining = !isEnded ? {
        days: Math.floor((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        hours: Math.floor(((endsAt.getTime() - now.getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor(((endsAt.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor(((endsAt.getTime() - now.getTime()) % (1000 * 60)) / 1000),
      } : undefined;

      setPoll({
        id: pollData.id,
        question: pollData.question,
        multiple_choice: pollData.multiple_choice,
        ends_at: pollData.ends_at,
        show_results_after_vote: pollData.show_results_after_vote,
        is_ended: isEnded,
        time_remaining: timeRemaining,
        total_votes: totalVotes,
        options,
      });

    } catch (err: any) {
      console.error('Error loading poll:', err);
      setError(err.message || 'Fehler beim Laden der Umfrage');
    } finally {
      setIsLoading(false);
    }
  };

  const vote = async (optionIds: string[]) => {
    if (!user || !poll || isVoting) return;
    
    setIsVoting(true);
    
    try {
      // Remove existing votes
      await supabase
        .from('poll_votes')
        .delete()
        .eq('poll_id', pollId)
        .eq('voter_id', user.id);

      // Add new votes
      if (optionIds.length > 0) {
        const votes = optionIds.map(optionId => ({
          poll_id: pollId,
          option_id: optionId,
          voter_id: user.id,
        }));

        const { error } = await supabase
          .from('poll_votes')
          .insert(votes);

        if (error) throw error;
      }

      setCurrentVote(optionIds);
      setHasVoted(optionIds.length > 0);
      
      // Reload poll to get updated counts
      await loadPoll();
      
    } catch (err: any) {
      console.error('Error voting:', err);
      throw err;
    } finally {
      setIsVoting(false);
    }
  };

  const canSeeResults = () => {
    if (!poll) return false;
    if (poll.is_ended) return true;
    if (!poll.show_results_after_vote) return true;
    return hasVoted;
  };

  return {
    poll,
    isLoading,
    error,
    vote,
    currentVote,
    canSeeResults: canSeeResults(),
    isVoting,
    hasVoted,
  };
}