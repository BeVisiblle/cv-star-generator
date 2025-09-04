import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { 
  Post, 
  CreatePostRequest, 
  PostFilters 
} from '@/types/groups';

type DbPost = Database['public']['Tables']['posts']['Row'];

// Posts API
export const usePosts = (groupId: string, filters?: PostFilters) => {
  return useQuery({
    queryKey: ['posts', groupId, filters],
    queryFn: async (): Promise<Post[]> => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Post[];
    },
    staleTime: 30000,
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async (): Promise<Post | null> => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Post;
    },
    staleTime: 30000,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostRequest): Promise<Post> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          group_id: data.group_id,
          author_id: user.id,
          type: data.type,
          title: data.title,
          body: data.body,
          meta: data.meta || {},
        })
        .select(`
          *,
          author:profiles(id, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return post as Post;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.group_id] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreatePostRequest>): Promise<Post> => {
      const { data: post, error } = await supabase
        .from('posts')
        .update({
          title: data.title,
          body: data.body,
          meta: data.meta,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          author:profiles(id, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return post as Post;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts', post.group_id] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};