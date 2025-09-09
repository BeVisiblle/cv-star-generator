import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface FeedSettings {
  showJobs: boolean;
  showPolls: boolean;
  showEvents: boolean;
  showTextPosts: boolean;
  showJobShares: boolean;
  showCompanyPosts: boolean;
  showUserPosts: boolean;
  sortBy: 'newest' | 'popular' | 'trending';
  filterBy: 'all' | 'following' | 'connections' | 'companies';
}

const defaultSettings: FeedSettings = {
  showJobs: true,
  showPolls: true,
  showEvents: true,
  showTextPosts: true,
  showJobShares: true,
  showCompanyPosts: true,
  showUserPosts: true,
  sortBy: 'newest',
  filterBy: 'all'
};

export function useFeedSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<FeedSettings>(defaultSettings);

  // Load user's feed settings
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['feedSettings', user?.id],
    queryFn: async () => {
      if (!user) return defaultSettings;

      const { data, error } = await supabase
        .from('user_feed_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading feed settings:', error);
        return defaultSettings;
      }

      if (data) {
        return {
          showJobs: data.show_jobs ?? defaultSettings.showJobs,
          showPolls: data.show_polls ?? defaultSettings.showPolls,
          showEvents: data.show_events ?? defaultSettings.showEvents,
          showTextPosts: data.show_text_posts ?? defaultSettings.showTextPosts,
          showJobShares: data.show_job_shares ?? defaultSettings.showJobShares,
          showCompanyPosts: data.show_company_posts ?? defaultSettings.showCompanyPosts,
          showUserPosts: data.show_user_posts ?? defaultSettings.showUserPosts,
          sortBy: data.sort_by ?? defaultSettings.sortBy,
          filterBy: data.filter_by ?? defaultSettings.filterBy
        } as FeedSettings;
      }

      return defaultSettings;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update local settings when user settings load
  useEffect(() => {
    if (userSettings) {
      setLocalSettings(userSettings);
    }
  }, [userSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: FeedSettings) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_feed_settings')
        .upsert({
          user_id: user.id,
          show_jobs: settings.showJobs,
          show_polls: settings.showPolls,
          show_events: settings.showEvents,
          show_text_posts: settings.showTextPosts,
          show_job_shares: settings.showJobShares,
          show_company_posts: settings.showCompanyPosts,
          show_user_posts: settings.showUserPosts,
          sort_by: settings.sortBy,
          filter_by: settings.filterBy,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedSettings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      toast.success('Feed-Einstellungen gespeichert');
    },
    onError: (error) => {
      console.error('Error saving feed settings:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    }
  });

  // Update setting function
  const updateSetting = (key: keyof FeedSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    saveSettingsMutation.mutate(newSettings);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setLocalSettings(defaultSettings);
    saveSettingsMutation.mutate(defaultSettings);
  };

  // Get active filters for feed query
  const getActiveFilters = () => {
    const filters = [];
    
    if (!localSettings.showJobs) filters.push('post_type.neq.job');
    if (!localSettings.showPolls) filters.push('post_type.neq.poll');
    if (!localSettings.showEvents) filters.push('post_type.neq.event');
    if (!localSettings.showTextPosts) filters.push('post_type.neq.text');
    if (!localSettings.showJobShares) filters.push('post_type.neq.job_share');
    
    return filters;
  };

  // Get sort order for feed query
  const getSortOrder = () => {
    switch (localSettings.sortBy) {
      case 'popular':
        return { column: 'likes_count', ascending: false };
      case 'trending':
        return { column: 'comments_count', ascending: false };
      case 'newest':
      default:
        return { column: 'published_at', ascending: false };
    }
  };

  return {
    settings: localSettings,
    isLoading,
    updateSetting,
    resetToDefaults,
    getActiveFilters,
    getSortOrder,
    isSaving: saveSettingsMutation.isPending
  };
}

