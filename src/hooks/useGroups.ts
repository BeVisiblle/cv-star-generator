import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { 
  Group, 
  GroupMember, 
  CreateGroupRequest, 
  UpdateGroupRequest, 
  JoinGroupRequest,
  GroupFilters 
} from '@/types/groups';

// Groups API
export const useGroups = (filters?: GroupFilters) => {
  return useQuery({
    queryKey: ['groups', filters],
    queryFn: async () => {
      let query = supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(user_id, role, status),
          member_count:group_members(count)
        `)
        .eq('group_members.user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .eq('group_members.status', 'active');

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }
      if (filters?.school) {
        query = query.eq('school', filters.school);
      }
      if (filters?.region) {
        query = query.eq('region', filters.region);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Group[];
    },
  });
};

export const useGroup = (groupId: string) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(user_id, role, status),
          member_count:group_members(count)
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data as Group;
    },
    enabled: !!groupId,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupRequest) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: group, error } = await supabase
        .from('groups')
        .insert({
          ...data,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.user.id,
          role: 'owner',
        });

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string; data: UpdateGroupRequest }) => {
      const { error } = await supabase
        .from('groups')
        .update(data)
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: JoinGroupRequest) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('group_members')
        .insert({
          ...data,
          user_id: user.user.id,
        });

      if (error) throw error;
    },
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', group_id] });
    },
  });
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });
};

// Group Members
export const useGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          user:profiles(id, display_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!groupId,
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      groupId, 
      userId, 
      role 
    }: { 
      groupId: string; 
      userId: string; 
      role: 'owner' | 'moderator' | 'member' 
    }) => {
      const { error } = await supabase
        .from('group_members')
        .update({ role })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
    },
  });
};
