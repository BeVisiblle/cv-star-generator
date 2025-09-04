import { useQuery } from '@tanstack/react-query';
import { searchGroups } from '@/api/groups';
import { supabase } from '@/lib/supabase';
import type { Group, Post, File } from '@/types/groups';

export interface SearchFilters {
  type?: 'study' | 'professional' | 'interest';
  visibility?: 'public' | 'private';
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResult {
  groups: Group[];
  posts: Post[];
  files: File[];
  total: number;
}

export function useSearch(query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: async (): Promise<SearchResult> => {
      const results: SearchResult = {
        groups: [],
        posts: [],
        files: [],
        total: 0
      };

      if (!query.trim()) {
        return results;
      }

      try {
        // Search groups
        const groupsResult = await searchGroups(query, {
          type: filters?.type,
          visibility: filters?.visibility,
          tags: filters?.tags
        });

        if (groupsResult.success && groupsResult.groups) {
          results.groups = groupsResult.groups;
        }

        // Search posts
        let postsQuery = supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_author_id_fkey (
              id,
              username,
              full_name,
              avatar_url
            ),
            groups!inner (
              id,
              title,
              type
            )
          `)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (filters?.type) {
          postsQuery = postsQuery.eq('groups.type', filters.type);
        }

        if (filters?.dateRange) {
          postsQuery = postsQuery
            .gte('created_at', filters.dateRange.start.toISOString())
            .lte('created_at', filters.dateRange.end.toISOString());
        }

        const { data: posts, error: postsError } = await postsQuery;

        if (!postsError && posts) {
          results.posts = posts;
        }

        // Search files
        let filesQuery = supabase
          .from('files')
          .select(`
            *,
            groups!inner (
              id,
              title,
              type
            ),
            profiles!files_uploaded_by_fkey (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (filters?.type) {
          filesQuery = filesQuery.eq('groups.type', filters.type);
        }

        if (filters?.dateRange) {
          filesQuery = filesQuery
            .gte('created_at', filters.dateRange.start.toISOString())
            .lte('created_at', filters.dateRange.end.toISOString());
        }

        const { data: files, error: filesError } = await filesQuery;

        if (!filesError && files) {
          results.files = files;
        }

        results.total = results.groups.length + results.posts.length + results.files.length;

        return results;

      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    },
    enabled: !!query.trim(),
    staleTime: 30000, // 30 seconds
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) {
        return [];
      }

      try {
        // Get tag suggestions
        const { data: tags } = await supabase
          .from('groups')
          .select('tags')
          .not('tags', 'is', null);

        const allTags = tags?.flatMap(group => group.tags || []) || [];
        const uniqueTags = [...new Set(allTags)];
        const matchingTags = uniqueTags
          .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5);

        // Get group title suggestions
        const { data: groups } = await supabase
          .from('groups')
          .select('title')
          .ilike('title', `%${query}%`)
          .limit(3);

        const groupTitles = groups?.map(group => group.title) || [];

        return [...matchingTags, ...groupTitles];

      } catch (error) {
        console.error('Search suggestions error:', error);
        return [];
      }
    },
    enabled: !!query.trim() && query.length >= 2,
    staleTime: 60000, // 1 minute
  });
}

export function useRecentSearches() {
  return useQuery({
    queryKey: ['recent-searches'],
    queryFn: async () => {
      // This would typically be stored in localStorage or user preferences
      // For now, return empty array
      return [];
    },
    staleTime: 300000, // 5 minutes
  });
}
