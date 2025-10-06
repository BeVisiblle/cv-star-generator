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

type PostWithAuthor = {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  author_type?: "company" | "user";
  author_id?: string;
  recent_interaction?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  author?: any;
  company?: any;
  [key: string]: any;
};

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

      // Use simple posts table
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_user_id_fkey(
            id,
            vorname,
            nachname,
            avatar_url
          )
        `)
        .limit(PAGE_SIZE);

      // Apply sorting based on the selected option
      if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        // For 'relevant' sorting, use newest for now
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (pageParam?.after_published) {
        query = query.lt('created_at', pageParam.after_published);
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
          .select('id, status, created_at, content')
          .limit(5);
        
        console.log('[feed] All posts (any status):', allPosts?.length, allPosts);
        if (allError) {
          console.error('[feed] Error fetching all posts:', allError);
        }
      }

      // Transform posts data to match expected structure
      const transformedPosts = posts?.map(post => {
        const author = post.author || null;
        
        return {
          id: post.id,
          content: post.content || '',
          body_md: post.content || '',
          image_url: null,
          media: [],
          status: 'published',
          visibility: 'public',
          user_id: post.user_id,
          author_type: 'user' as 'user' | 'company',
          author_id: post.user_id,
          like_count: 0,
          likes_count: 0,
          comment_count: 0,
          comments_count: 0,
          share_count: 0,
          shares_count: 0,
          created_at: post.created_at,
          updated_at: post.updated_at,
          published_at: post.created_at,
          author: author
        };
      }) || [];

      console.log('[feed] transformed posts:', transformedPosts.length, transformedPosts);

      // If we don't have author info from the view, fetch it separately
      const postsNeedingAuthorInfo = transformedPosts.filter(post => !post.author);
      if (postsNeedingAuthorInfo.length > 0) {
        console.log('[feed] Fetching author info for', postsNeedingAuthorInfo.length, 'posts');
        
        const userIds = [...new Set(postsNeedingAuthorInfo.map(p => p.user_id).filter(Boolean))];

        let userProfiles: any[] = [];

        if (userIds.length > 0) {
          console.log('[feed] Fetching user profiles for IDs:', userIds);
          
          // Try multiple profile queries to handle different table structures
          let { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, vorname, nachname, avatar_url')
            .in('id', userIds);
          
          // If no profiles found, create fallback profiles
          if (!profiles || profiles.length === 0) {
            console.log('[feed] No profiles found, creating fallback profiles');
            profiles = userIds.map(id => ({
              id: id,
              vorname: 'Nutzer',
              nachname: id.slice(0, 8),
              avatar_url: null
            }));
          }
          
          console.log('[feed] User profiles result:', profiles, profileError);
          userProfiles = profiles || [];
        }


        // Add author info to posts that need it
        transformedPosts.forEach(post => {
          if (!post.author) {
            const author = userProfiles.find(p => p.id === post.user_id);

            console.log('[feed] Post author lookup:', {
              postId: post.id,
              userId: post.user_id,
              foundAuthor: author,
              userProfilesCount: userProfiles.length
            });

            if (author) {
              (post as any).author = {
                id: author.id,
                vorname: author.vorname,
                nachname: author.nachname,
                avatar_url: author.avatar_url
              };
            }
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
      
      {posts.map((post: any) => (
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