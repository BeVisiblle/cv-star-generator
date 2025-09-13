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

      // Build the query based on sort option
          let query = supabase
            .from('posts')
            .select('*, likes_count, comments_count, shares_count')
            .eq('status', 'published') // Only published posts
            .limit(PAGE_SIZE);

      // Apply sorting based on the selected option
      if (sort === 'newest') {
        // Sort by newest posts first
        query = query.order('published_at', { ascending: false });
      } else {
        // Sort by relevance (combination of engagement and recency)
        // For now, we'll use a simple approach since complex scoring requires custom SQL
        query = query
          .order('likes_count', { ascending: false }) // Posts with more likes first
          .order('comments_count', { ascending: false }) // Then by comments
          .order('published_at', { ascending: false }); // Finally by time
      }

      // Apply pagination
      if (pageParam?.after_published) {
        if (sort === 'newest') {
          query = query.lt('published_at', pageParam.after_published);
        } else {
          // For relevance, we'll use a cursor-based approach with ID
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
          .select('id, status, published_at, created_at')
          .limit(5);
        
        console.log('[feed] All posts (any status):', allPosts?.length, allPosts);
        if (allError) {
          console.error('[feed] Error fetching all posts:', allError);
        }
      }

      // Transform posts table data to match expected structure
      const transformedPosts = posts?.map(post => ({
        id: post.id,
        content: post.content || '',
        body_md: post.content || '',
        image_url: post.image_url,
        media: post.image_url ? [{ type: 'image', url: post.image_url }] : [],
        status: post.status || 'published',
        visibility: post.visibility || 'public',
        user_id: post.user_id,
        actor_user_id: post.user_id,
        author_type: (post.author_type || 'user') as 'user' | 'company',
        author_id: post.author_id || post.user_id,
        company_id: null,
        actor_company_id: null,
        like_count: post.likes_count || 0,
        likes_count: post.likes_count || 0,
        comment_count: post.comments_count || 0,
        comments_count: post.comments_count || 0,
        share_count: post.shares_count || 0,
        shares_count: post.shares_count || 0,
        created_at: post.created_at,
        updated_at: post.updated_at,
        published_at: post.published_at || post.created_at
      })) || [];

      // Get unique user IDs
      const userIds = [...new Set(transformedPosts.map(post => post.actor_user_id).filter(Boolean))];

      // Fetch user profiles with all necessary fields
      let userProfiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id, 
            vorname, 
            nachname, 
            avatar_url, 
            ausbildungsberuf, 
            schule, 
            ausbildungsbetrieb, 
            aktueller_beruf, 
            status, 
            headline,
            branche,
            ort,
            plz,
            profile_published
          `)
          .in('id', userIds)
          .eq('profile_published', true); // Only published profiles
        
        if (profileError) {
          console.error('[feed] profile error', profileError);
        } else {
          userProfiles = profiles || [];
          console.log('[feed] loaded profiles:', userProfiles.length, 'for users:', userIds);
          console.log('[feed] profile details:', userProfiles);
        }
      }

      // Get company profiles for company posts
      const companyIds = [...new Set(transformedPosts.map(post => post.actor_company_id).filter(Boolean))];
      let companyProfiles: any[] = [];
      if (companyIds.length > 0) {
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('id, name, logo_url, description, industry')
          .in('id', companyIds);
        
        if (companyError) {
          console.error('[feed] company error', companyError);
        } else {
          companyProfiles = companies || [];
        }
      }

      // Map posts with author information
      const finalPosts = transformedPosts.map(post => {
        const author = userProfiles.find(p => p.id === post.actor_user_id);
        const company = companyProfiles.find(c => c.id === post.actor_company_id);
        
        console.log('[feed] mapping post:', post.id, 'author_id:', post.actor_user_id, 'found_author:', !!author);
        
        return {
          ...post,
          author: author ? {
            id: author.id,
            vorname: author.vorname || 'Unbekannt',
            nachname: author.nachname || 'User',
            avatar_url: author.avatar_url,
            ausbildungsberuf: author.ausbildungsberuf,
            schule: author.schule,
            ausbildungsbetrieb: author.ausbildungsbetrieb,
            aktueller_beruf: author.aktueller_beruf,
            status: author.status,
            headline: author.headline,
            branche: author.branche,
            ort: author.ort,
            plz: author.plz,
            full_name: `${author.vorname || ''} ${author.nachname || ''}`.trim() || 'Unbekannt User'
          } : {
            id: post.actor_user_id,
            vorname: 'Unbekannt',
            nachname: 'User',
            avatar_url: null,
            ausbildungsberuf: null,
            schule: null,
            ausbildungsbetrieb: null,
            aktueller_beruf: null,
            status: null,
            headline: null,
            branche: null,
            ort: null,
            plz: null,
            full_name: 'Unbekannt User'
          },
          company: company || null
        };
      });

      return {
        posts: finalPosts,
        nextPage: finalPosts.length === PAGE_SIZE ? {
          after_published: finalPosts[finalPosts.length - 1]?.published_at || finalPosts[finalPosts.length - 1]?.created_at,
          after_id: finalPosts[finalPosts.length - 1]?.id
        } : null
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const posts = feedQuery.data?.pages.flatMap(page => page.posts) ?? [];
  const postIds = posts.map(post => post.id);

  if (feedQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (feedQuery.isError) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Fehler beim Laden der Beiträge</p>
        <Button 
          onClick={() => feedQuery.refetch()} 
          variant="outline" 
          className="mt-2"
        >
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
