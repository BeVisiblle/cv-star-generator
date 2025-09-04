import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  requested_at: string;
  responded_at?: string;
  responded_by?: string;
  group?: {
    id: string;
    title: string;
  };
  user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

// Get join requests for a specific group (for moderators/owners)
export const useGroupJoinRequests = (groupId: string) => {
  return useQuery({
    queryKey: ['group-join-requests', groupId],
    queryFn: async (): Promise<JoinRequest[]> => {
      const { data, error } = await supabase
        .from('group_join_requests')
        .select(`
          *,
          group:groups(id, title)
        `)
        .eq('group_id', groupId)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        user: undefined // Remove invalid user relation for now
      })) as JoinRequest[];
    },
    staleTime: 30000,
  });
};

// Get user's own join requests
export const useMyJoinRequests = () => {
  return useQuery({
    queryKey: ['my-join-requests'],
    queryFn: async (): Promise<JoinRequest[]> => {
      const { data, error } = await supabase
        .from('group_join_requests')
        .select(`
          *,
          group:groups(id, title)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        user: undefined // Remove invalid user relation for now
      })) as JoinRequest[];
    },
    staleTime: 30000,
  });
};

// Approve or reject a join request
export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, approve }: { requestId: string; approve: boolean }): Promise<boolean> => {
      const { data, error } = await supabase.rpc('approve_join_request', {
        request_id: requestId,
        approve: approve
      });

      if (error) throw error;
      return data as boolean;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-join-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-join-requests'] });
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};