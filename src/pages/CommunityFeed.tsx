import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FeedComposer } from '@/components/feed/FeedComposer';
import { PostCard } from '@/components/feed/PostCard';
import { InterestingPeopleWidget } from '@/components/widgets/InterestingPeopleWidget';
import { InterestingCompaniesWidget } from '@/components/widgets/InterestingCompaniesWidget';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
import { useRealtimeReactions } from '@/hooks/useRealtimeReactions';
import { useFeedSettings } from '@/hooks/useFeedSettings';
import { FeedSettings } from '@/components/feed/FeedSettings';
import { FeedFilter } from '@/components/feed/FeedFilter';

interface PostAuthor {
  id: string;
  display_name: string;
  headline?: string;
  avatar_url?: string;
  verified?: boolean;
}

interface PostData {
  id: string;
  content: string;
  post_type: 'text' | 'poll' | 'event' | 'job_share' | 'media';
  author_id: string;
  author_type: 'user' | 'company';
  published_at: string;
  created_at: string;
  status: string;
  visibility: string;
  likes_count: number;
  comments_count: number;
  poll_data?: any;
  event_data?: any;
}

interface FeedPost extends PostData {
  author: PostAuthor;
}

export function CommunityFeed() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showJobs, setShowJobs] = useState(true);

  // Feed settings
  const { settings, getActiveFilters, getSortOrder } = useFeedSettings();

  // Enable realtime reactions
  useRealtimeReactions();

  // Load user feed settings
  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      const { data } = await supabase
        .from('user_feed_settings')
        .select('show_jobs_in_feed')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setShowJobs(data.show_jobs_in_feed);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  // Load feed posts with settings
  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['community-feed', user?.id, settings],
    queryFn: async () => {
      if (!user) return [];

      const { data, error: rpcError } = await supabase
        .rpc('get_feed_enhanced', {
          viewer_id: user.id,
          show_jobs: settings.showJobs,
          show_polls: settings.showPolls,
          show_events: settings.showEvents,
          show_text_posts: settings.showTextPosts,
          show_job_shares: settings.showJobShares,
          show_company_posts: settings.showCompanyPosts,
          show_user_posts: settings.showUserPosts,
          sort_by: settings.sortBy,
          filter_by: settings.filterBy,
          limit_count: 20
        });

      if (rpcError) {
        console.error('Error loading feed:', rpcError);
        throw rpcError;
      }

      // Transform posts to include author data
      const postsWithAuthors: FeedPost[] = (data || []).map((post: any) => ({
        ...post,
        author: {
          id: post.author_id,
          display_name: 'Test User', // TODO: Get from profiles table
          headline: 'Software Entwickler',
          avatar_url: '',
          verified: false
        }
      }));

      return postsWithAuthors;
    },
    enabled: !!user
  });

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      // TODO: Implement like functionality
      console.log('Like post:', postId);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = async (postId: string) => {
    try {
      // TODO: Implement share functionality
      console.log('Share post:', postId);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handlePostCreated = () => {
    refetch();
  };

  const handlePollCreated = (pollId: string) => {
    refetch();
    console.log('Poll created:', pollId);
  };

  const handleEventCreated = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-lg font-semibold mb-2">Fehler beim Laden des Feeds</h2>
            <p className="text-muted-foreground mb-4">
              Es gab ein Problem beim Laden der Community-Inhalte.
            </p>
            <Button onClick={() => refetch()}>
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feed Settings and Filter */}
          <div className="flex items-center justify-between">
            <FeedSettings />
            <FeedFilter />
          </div>

          {/* Feed Composer */}
          <FeedComposer 
            onPostCreated={handlePostCreated}
            onPollCreated={handlePollCreated}
            onEventCreated={handleEventCreated}
          />

          {/* Feed Posts */}
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={post.author}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Noch keine Beiträge</h3>
                <p className="text-muted-foreground mb-4">
                  Folge anderen Nutzern oder erstelle deinen ersten Beitrag!
                </p>
                <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Ersten Beitrag erstellen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <InterestingPeopleWidget />
          <InterestingCompaniesWidget />
          
          {/* Feed Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feed-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Jobs im Feed anzeigen
                </label>
                <Button
                  variant={showJobs ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowJobs(!showJobs)}
                >
                  {showJobs ? 'An' : 'Aus'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
