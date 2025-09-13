import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PostCard from './PostCard';
import NewPostsNotification from './NewPostsNotification';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { LogoSpinner } from '@/components/shared/LoadingSkeleton';

type PostWithAuthor = any;

const PAGE_SIZE = 20;

type FeedSortOption = "relevant" | "newest";

interface CommunityFeedProps {
  feedHeadHeight?: number; // Höhe der Feed-Header-Sektion für Sticky-Position
}

export default function CommunityFeed({ feedHeadHeight = 0 }: CommunityFeedProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const viewerId = user?.id || null;
  const [sort, setSort] = useState<FeedSortOption>((localStorage.getItem('feed_sort') as FeedSortOption) || 'relevant');

  // Debug: Log auth state
  console.log('[feed] Auth state:', { user: !!user, userId: user?.id, viewerId });

  useEffect(() => {
    const handler = (e: any) => setSort(e.detail as FeedSortOption);
    window.addEventListener('feed-sort-changed', handler);
    return () => window.removeEventListener('feed-sort-changed', handler);
  }, []);

  const feedQuery = useInfiniteQuery({
    queryKey: ['home-feed', viewerId, sort],
    enabled: true, // Always enabled to load posts
    initialPageParam: { after_published: null as string | null, after_id: null as string | null },
    queryFn: async ({ pageParam }) => {
      console.log('[feed] fetching page', pageParam, sort);

      // Try posts table first (where existing posts are), then fallback to unified view
      let query = supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .limit(PAGE_SIZE);

      // Apply sorting based on the selected option
      if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        // Sort by relevance (combination of engagement and recency)
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (pageParam?.after_published) {
        query = query.lt('created_at', pageParam.after_published);
      }

      let { data: posts, error } = await query;

      // If posts table fails, try the unified view
      if (error && error.code === 'PGRST116') {
        console.log('[feed] posts table not found, trying posts_with_authors view...');
        
        // Fallback to posts_with_authors view
        let fallbackQuery = supabase
          .from('posts_with_authors')
          .select('*')
          .limit(PAGE_SIZE);

        // Apply sorting
        fallbackQuery = fallbackQuery.order('created_at', { ascending: false });

        // Apply pagination
        if (pageParam?.after_published) {
          fallbackQuery = fallbackQuery.lt('created_at', pageParam.after_published);
        }

        const fallbackResult = await fallbackQuery;
        posts = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) {
        console.error('[feed] get_feed error', error);
        throw error;
      }

      console.log('[feed] raw posts from DB:', posts?.length, posts);
      
      // Debug: Check if we have any posts at all
      if (!posts || posts.length === 0) {
        console.warn('[feed] No posts found in database!');
        
        // Try to get all posts without filters to debug
        const { data: allPosts, error: allError } = await supabase
          .from('posts')
          .select('id, status, created_at, content')
          .limit(5);
        
        console.log('[feed] All posts (any status):', allPosts?.length, allPosts);
        if (allError) {
          console.error('[feed] Error fetching all posts:', allError);
        }
      }

      // Transform posts data to match expected structure
      const transformedPosts = posts?.map(post => {
        // Check if this is from the new view (has author_name) or old table
        const hasAuthorInfo = post.author_name || post.author_avatar;
        
        return {
          id: post.id,
          content: post.content || '',
          body_md: post.content || '',
          image_url: post.image_url,
          media: post.image_url ? [{ type: 'image', url: post.image_url }] : (post.media_urls || []).map((url: string) => ({ type: 'image', url })),
          status: post.status || 'published',
          visibility: post.visibility || 'public',
          user_id: post.user_id,
          actor_user_id: post.user_id,
          author_type: (post.author_type || 'user') as 'user' | 'company',
          author_id: post.author_id || post.user_id,
          company_id: post.company_id,
          actor_company_id: post.company_id,
          like_count: 0,
          likes_count: 0,
          comment_count: 0,
          comments_count: 0,
          share_count: 0,
          shares_count: 0,
          created_at: post.created_at,
          updated_at: post.updated_at,
          published_at: post.published_at || post.created_at,
          // Author information - from view if available, otherwise will be fetched separately
          author: hasAuthorInfo ? {
            id: post.author_id,
            full_name: post.author_name,
            avatar_url: post.author_avatar,
            headline: post.author_headline,
            type: post.author_type,
          } : null
        };
      }) || [];

      console.log('[feed] transformed posts:', transformedPosts.length, transformedPosts);

      // If we don't have author info from the view, fetch it separately
      const postsNeedingAuthorInfo = transformedPosts.filter(post => !post.author);
      if (postsNeedingAuthorInfo.length > 0) {
        console.log('[feed] Fetching author info for', postsNeedingAuthorInfo.length, 'posts');
        
        const userIds = [...new Set(postsNeedingAuthorInfo.map(p => p.actor_user_id).filter(Boolean))];
        const companyIds = [...new Set(postsNeedingAuthorInfo.map(p => p.company_id).filter(Boolean))];

        let userProfiles: any[] = [];
        let companyProfiles: any[] = [];

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, headline')
            .in('id', userIds);
          userProfiles = profiles || [];
        }

        if (companyIds.length > 0) {
          const { data: companies } = await supabase
            .from('companies')
            .select('id, name, logo_url, description')
            .in('id', companyIds);
          companyProfiles = companies || [];
        }

        // Add author info to posts that need it
        transformedPosts.forEach(post => {
          if (!post.author) {
            const author = post.author_type === 'company'
              ? companyProfiles.find(c => c.id === post.company_id)
              : userProfiles.find(p => p.id === post.actor_user_id);

            post.author = {
              id: post.author_id,
              full_name: author?.full_name || author?.name || 'Unbekannt',
              avatar_url: author?.avatar_url || author?.logo_url || null,
              headline: author?.headline || author?.description || null,
              type: post.author_type,
            };
          }
        });
      }

      return {
        posts: transformedPosts,
        nextPage: posts && posts.length === PAGE_SIZE
          ? {
              after_published: posts[posts.length - 1].created_at,
              after_id: posts[posts.length - 1].id,
            }
          : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const posts = feedQuery.data?.pages.flatMap(page => page.posts) ?? [];
  const postIds = posts.map(post => post.id);

  if (feedQuery.isLoading && posts.length === 0) {
    return <LogoSpinner size="lg" text="Posts werden geladen..." />;
  }

  if (feedQuery.isError) {
    return (
      <Card className="p-6 text-center text-destructive">
        <p>Fehler beim Laden der Beiträge: {feedQuery.error.message}</p>
        <Button onClick={() => feedQuery.refetch()} className="mt-4">
          Erneut versuchen
        </Button>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Noch keine Beiträge vorhanden</p>
        <p className="text-sm text-muted-foreground mt-1">
          Sei der Erste und teile etwas mit der Community!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <NewPostsNotification 
        onRefresh={() => feedQuery.refetch()} 
        currentPostIds={postIds}
        feedHeadHeight={feedHeadHeight}
      />
      
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {feedQuery.hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            onClick={() => feedQuery.fetchNextPage()}
            disabled={feedQuery.isFetchingNextPage}
            variant="outline"
          >
            {feedQuery.isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lade mehr...
              </>
            ) : (
              'Mehr laden'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}