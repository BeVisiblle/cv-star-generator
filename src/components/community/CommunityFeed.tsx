import React, { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PostCard from './PostCard';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type PostWithAuthor = any;

const PAGE_SIZE = 20;

type FeedSortOption = "relevant" | "newest";

export default function CommunityFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const viewerId = user?.id || null;
  const [sort, setSort] = useState<FeedSortOption>((localStorage.getItem('feed_sort') as FeedSortOption) || 'relevant');

  useEffect(() => {
    const handler = (e: any) => setSort(e.detail as FeedSortOption);
    window.addEventListener('feed-sort-changed', handler);
    return () => window.removeEventListener('feed-sort-changed', handler);
  }, []);

  const feedQuery = useInfiniteQuery({
    queryKey: ['home-feed', viewerId, sort],
    enabled: !!viewerId,
    initialPageParam: { after_published: null as string | null, after_id: null as string | null },
    queryFn: async ({ pageParam }) => {
      console.log('[feed] fetching page', pageParam, sort);

      // Try to get posts from posts table (existing structure)
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) {
        console.error('[feed] get_feed error', error);
        throw error;
      }

      // Transform posts table data to match expected structure
      const transformedPosts = posts?.map(post => ({
        id: post.id,
        body_md: post.content,
        media: post.image_url ? [{ type: 'image', url: post.image_url }] : [],
        status: 'published',
        visibility: 'CommunityOnly',
        actor_user_id: post.user_id,
        actor_company_id: null,
        like_count: post.likes_count || 0,
        comment_count: post.comments_count || 0,
        share_count: 0,
        created_at: post.created_at,
        updated_at: post.updated_at
      })) || [];

      // Get unique user IDs
      const userIds = [...new Set(transformedPosts.map(post => post.actor_user_id).filter(Boolean))];

      // Fetch user profiles
      let userProfiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, vorname, nachname, avatar_url, ausbildungsberuf, schule, ausbildungsbetrieb, aktueller_beruf, status')
          .in('id', userIds);
        
        if (profileError) {
          console.error('[feed] profile error', profileError);
        } else {
          userProfiles = profiles || [];
        }
      }

      // Create lookup map
      const userMap = Object.fromEntries(userProfiles.map(p => [p.id, p]));
      
      // Transform posts to match PostCard interface
      const finalPosts = transformedPosts.map(post => {
        const author = userMap[post.actor_user_id] || null;

        return {
          id: post.id,
          content: post.body_md || '',
          image_url: post.media?.[0]?.url || null,
          created_at: post.created_at,
          user_id: post.actor_user_id,
          author_type: 'user' as const,
          author_id: post.actor_user_id,
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          share_count: post.share_count || 0,
          author: author ? {
            id: author.id,
            vorname: author.vorname,
            nachname: author.nachname,
            avatar_url: author.avatar_url,
            ausbildungsberuf: author.ausbildungsberuf,
            schule: author.schule,
            ausbildungsbetrieb: author.ausbildungsbetrieb,
            aktueller_beruf: author.aktueller_beruf,
            status: author.status,
            employment_status: null,
            headline: null,
            company_name: null
          } : null,
          company: null
        };
      });

      return {
        posts: finalPosts,
        nextPage: finalPosts.length === PAGE_SIZE ? {
          after_published: finalPosts[finalPosts.length - 1]?.created_at,
          after_id: finalPosts[finalPosts.length - 1]?.id
        } : null
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // Real-time updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('[feed] subscribing realtime');
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
          filter: 'status=eq.published'
        },
        (payload) => {
          console.log('[feed] realtime update', payload);
          queryClient.invalidateQueries({ queryKey: ['home-feed'] });
        }
      )
      .subscribe();

    return () => {
      console.log('[feed] unsubscribing realtime');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const posts: PostWithAuthor[] = useMemo(
    () => (feedQuery.data?.pages || []).flatMap((p: any) => p.posts || []) as PostWithAuthor[],
    [feedQuery.data]
  );

  if (!viewerId) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Bitte melde dich an, um deinen Community‑Feed zu sehen.
        </p>
      </Card>
    );
  }

  if (feedQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (feedQuery.isError) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Fehler beim Laden der Beiträge. Bitte versuche es später erneut.
        </p>
      </Card>
    );
  }

  const isEmpty = !posts || posts.length === 0;

  return (
    <div className="space-y-4">
      {isEmpty ? (
        <>
          {Array.from({ length: 10 }).map((_, i) => {
            const names = ['Lena','Max','Sara','Jonas','Mia','Paul','Amira','Leo','Nina','Tom'];
            const surns = ['K.','M.','S.','J.','B.','P.','A.','L.','N.','T.'];
            const roles = ['Kaufmännische Ausbildung','IT‑Support','Marketing','Handwerk','Technik'];
            const images = [
              'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?q=80&w=1200&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1520975867597-0f0a113a2d97?q=80&w=1200&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1520974722171-5f69e34f56b0?q=80&w=1200&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1520975967075-3f1f3c2d7b68?q=80&w=1200&auto=format&fit=crop'
            ];
            const texts = [
              'Heute habe ich mich für drei neue Ausbildungsstellen beworben – drückt mir die Daumen!',
              'Tipps für ein gelungenes Anschreiben: kurz, prägnant und persönlich.',
              'Mein Wochenziel: Lebenslauf überarbeiten und ein neues Projekt starten.',
              'Wer hat Erfahrungen mit Praktika in Frankfurt? Empfehlungen willkommen!',
              'Kleiner Erfolg: Mein erstes Vorstellungsgespräch steht – ich bin gespannt!',
              'Ich übe gerade technische Basics täglich 30 Minuten – Kontinuität hilft.',
              'Kennt ihr gute Online‑Kurse für Handwerk/IT? Würde mich über Links freuen.',
              'Feedback gesucht: Wie wirkt mein Profiltext? Kurze Hinweise sehr willkommen.',
              'Community‑Frage: Welche Soft Skills sind euch im Team am wichtigsten?',
              'Motivation des Tages: Jeden Tag eine kleine Sache besser machen.'
            ];
            const interactions = [
              "Ein Mitglied hat das kommentiert",
              "Zwei Mitglieder gefällt das",
              `${names[(i+3) % names.length]} hat das kommentiert`,
              `${names[(i+5) % names.length]} gefällt das`
            ];
            return (
              <PostCard
                key={`demo-${i}`}
                post={{
                  id: `demo-${i}`,
                  content: texts[i % texts.length],
                  created_at: new Date(Date.now() - i * 3600_000).toISOString(),
                  user_id: "demo",
                  image_url: images[i % images.length],
                  recent_interaction: interactions[i % interactions.length],
                  author: {
                    id: "demo",
                    vorname: names[i % names.length],
                    nachname: surns[i % surns.length],
                    avatar_url: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
                    ausbildungsberuf: roles[i % roles.length]
                  }
                }}
              />
            );
          })}
        </>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="flex items-center justify-center py-6">
            {feedQuery.hasNextPage ? (
              <Button
                variant="outline"
                disabled={feedQuery.isFetchingNextPage}
                onClick={() => feedQuery.fetchNextPage()}
              >
                {feedQuery.isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Lädt …
                  </>
                ) : (
                  'Mehr laden'
                )}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">Alles geladen</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}