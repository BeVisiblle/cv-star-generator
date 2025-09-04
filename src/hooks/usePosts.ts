import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { 
  Post, 
  CreatePostRequest, 
  PostFilters 
} from '@/types/groups';

// Posts API
export const usePosts = (groupId: string, filters?: PostFilters) => {
  return useQuery({
    queryKey: ['posts', groupId, filters],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url),
          vote_count:votes(count),
          user_vote:votes!left(value)
        `)
        .eq('group_id', groupId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.pinned !== undefined) {
        query = query.eq('pinned', filters.pinned);
      }
      if (filters?.author_id) {
        query = query.eq('author_id', filters.author_id);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('meta->tags', filters.tags);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!groupId,
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url),
          vote_count:votes(count),
          user_vote:votes!left(value)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      return data as Post;
    },
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostRequest) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          ...data,
          author_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return post;
    },
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', group_id] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      data 
    }: { 
      postId: string; 
      data: Partial<CreatePostRequest> 
    }) => {
      const { error } = await supabase
        .from('posts')
        .update(data)
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};

export const useTogglePostPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, pinned }: { postId: string; pinned: boolean }) => {
      const { error } = await supabase
        .from('posts')
        .update({ pinned })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Votes
export const useVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      value 
    }: { 
      entityType: 'post' | 'question' | 'answer'; 
      entityId: string; 
      value: -1 | 1 
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Upsert vote
      const { error } = await supabase
        .from('votes')
        .upsert({
          entity_type: entityType,
          entity_id: entityId,
          user_id: user.user.id,
          value,
        });

      if (error) throw error;
    },
    onSuccess: (_, { entityType, entityId }) => {
      // Invalidate relevant queries
      if (entityType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['post', entityId] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      } else if (entityType === 'question') {
        queryClient.invalidateQueries({ queryKey: ['question', entityId] });
        queryClient.invalidateQueries({ queryKey: ['questions'] });
      } else if (entityType === 'answer') {
        queryClient.invalidateQueries({ queryKey: ['answer', entityId] });
        queryClient.invalidateQueries({ queryKey: ['answers'] });
      }
    },
  });
};

export const useRemoveVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId 
    }: { 
      entityType: 'post' | 'question' | 'answer'; 
      entityId: string 
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: (_, { entityType, entityId }) => {
      // Invalidate relevant queries
      if (entityType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['post', entityId] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      } else if (entityType === 'question') {
        queryClient.invalidateQueries({ queryKey: ['question', entityId] });
        queryClient.invalidateQueries({ queryKey: ['questions'] });
      } else if (entityType === 'answer') {
        queryClient.invalidateQueries({ queryKey: ['answer', entityId] });
        queryClient.invalidateQueries({ queryKey: ['answers'] });
      }
    },
  });
};
