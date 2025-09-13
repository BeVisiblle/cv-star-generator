import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PostCard from './PostCard';
import NewPostsNotification from './NewPostsNotification';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

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

      // Use the unified posts_with_authors view
      let query = supabase
        .from('posts_with_authors')
        .select('*')
        .limit(PAGE_SIZE);

      // Apply sorting based on the selected option
      if (sort === 'newest') {
        query = query.order('published_at', { ascending: false });
      } else {
        // Sort by relevance (combination of engagement and recency)
        query = query
          .order('likes_count', { ascending: false })
          .order('comments_count', { ascending: false })
          .order('published_at', { ascending: false });
      }

      // Apply pagination
      if (pageParam?.after_published) {
        if (sort === 'newest') {
          query = query.lt('published_at', pageParam.after_published);
        } else {
          if (pageParam?.after_id) {
            query = query.lt('id', pageParam.after_id);
          }
        }
      }

      const { data: posts, error } = await query;

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
          .select('id, status, published_at, created_at, content')
          .limit(5);
        
        console.log('[feed] All posts (any status):', allPosts?.length, allPosts);
        if (allError) {
          console.error('[feed] Error fetching all posts:', allError);
        }
      }

      // Transform posts data to match expected structure
      const transformedPosts = posts?.map(post => ({
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
        like_count: post.likes_count || 0,
        likes_count: post.likes_count || 0,
        comment_count: post.comments_count || 0,
        comments_count: post.comments_count || 0,
        share_count: post.shares_count || 0,
        shares_count: post.shares_count || 0,
        created_at: post.created_at,
        updated_at: post.updated_at,
        published_at: post.published_at || post.created_at,
        // Author information from the posts_with_authors view
        author: {
          id: post.author_id,
          full_name: post.author_name,
          avatar_url: post.author_avatar,
          headline: post.author_headline,
          type: post.author_type,
        }
      })) || [];

      console.log('[feed] transformed posts:', transformedPosts.length, transformedPosts);

      return {
        posts: transformedPosts,
        nextPage: posts && posts.length === PAGE_SIZE
          ? {
              after_published: sort === 'newest' ? posts[posts.length - 1].published_at : null,
              after_id: sort !== 'newest' ? posts[posts.length - 1].id : null,
            }
          : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const posts = feedQuery.data?.pages.flatMap(page => page.posts) ?? [];
  const postIds = posts.map(post => post.id);

  if (feedQuery.isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse w-3/4"></div>
                <div className="h-4 bg-muted animate-pulse w-1/2"></div>
              </div>
            </div>
            <div className="h-20 bg-muted animate-pulse mt-4 rounded-md"></div>
          </Card>
        ))}
      </div>
    );
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