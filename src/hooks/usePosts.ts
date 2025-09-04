import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Post, CreatePostRequest, PostFilters } from '@/types/groups';

// Normalize any DB row shape to our Post interface
const mapDbPostToPost = (row: any, fallbackGroupId?: string): Post => ({
  id: row.id,
  group_id: row.group_id ?? fallbackGroupId ?? '',
  author_id: row.author_id,
  type: row.type ?? 'thread',
  title: row.title ?? undefined,
  body: row.body ?? row.content ?? undefined,
  meta: row.meta ?? {},
  pinned: row.pinned ?? false,
  created_at: row.created_at,
  updated_at: row.updated_at ?? row.created_at,
  author: row.author
    ? {
        id: row.author.id,
        display_name: row.author.display_name,
        avatar_url: row.author.avatar_url ?? undefined,
      }
    : undefined,
});

// Posts API
export const usePosts = (groupId: string, filters?: PostFilters) => {
  return useQuery({
    queryKey: ['posts', groupId, filters ? JSON.stringify(filters) : ''] as const,
    queryFn: async (): Promise<Post[]> => {
      const base = (supabase.from('posts') as any);
      let query = base
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      // Skipping complex filters (type/search) to avoid column/type mismatches across schemas

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((row: any) => mapDbPostToPost(row, groupId));
    },
    staleTime: 30000,
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async (): Promise<Post | null> => {
      const { data, error } = await (supabase.from('posts') as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return mapDbPostToPost(data);
    },
    staleTime: 30000,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostRequest): Promise<Post> => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error('User not authenticated');

      const { data: post, error } = await (supabase.from('posts') as any)
        .insert({
          group_id: data.group_id,
          author_id: user.id,
          type: data.type,
          title: data.title ?? null,
          body: data.body ?? null,
          meta: data.meta ?? {},
        })
        .select('*')
        .single();

      if (error) throw error;
      return mapDbPostToPost(post, data.group_id);
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
      const { data: post, error } = await (supabase.from('posts') as any)
        .update({
          title: data.title,
          body: data.body,
          meta: data.meta,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return mapDbPostToPost(post);
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
      const { error } = await (supabase.from('posts') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
