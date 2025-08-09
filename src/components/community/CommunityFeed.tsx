
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

export default function CommunityFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const viewerId = user?.id || null;

  const feedQuery = useInfiniteQuery({
    queryKey: ['home-feed', viewerId],
    enabled: !!viewerId,
    initialPageParam: { after_published: null as string | null, after_id: null as string | null },
    queryFn: async ({ pageParam }) => {
      console.log('[feed] fetching page', pageParam);

      const { data: posts, error } = await supabase.rpc('get_feed', {
        viewer_id: viewerId,
        after_published: pageParam.after_published,
        after_id: pageParam.after_id,
        page_size: PAGE_SIZE,
      });

      if (error) {
        console.error('[feed] get_feed error', error);
        throw error;
      }

      const rows = posts || [];
      const authorIds = Array.from(new Set(rows.map((p: any) => p.user_id).filter(Boolean)));

      let profilesMap: Record<string, any> = {};
      if (authorIds.length > 0) {
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('id, vorname, nachname, avatar_url, ausbildungsberuf')
          .in('id', authorIds);

        if (profileErr) {
          console.error('[feed] profiles join error', profileErr);
          throw profileErr;
        }
        profilesMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      }

      const items: PostWithAuthor[] = rows.map((p: any) => ({
        ...p,
        author: profilesMap[p.user_id] || null,
      }));

      const last = rows.length ? rows[rows.length - 1] : null;
      const nextPageParam =
        last ? { after_published: last.published_at, after_id: last.id } : null;

      return { items, nextPageParam };
    },
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    meta: {
      onError: (err: any) => {
        console.error('[feed] error meta', err);
      },
    },
  });

  const posts: PostWithAuthor[] = useMemo(
    () => (feedQuery.data?.pages || []).flatMap((p: any) => p.items) as PostWithAuthor[],
    [feedQuery.data]
  );

  const loadedIds = useMemo(() => new Set((posts || []).map((p: any) => p.id)), [posts]);

  // Buffer für neue Echtzeit-Posts bis der Nutzer "Anzeigen" klickt
  const [incoming, setIncoming] = useState<PostWithAuthor[]>([]);

  // Realtime-Subscription auf Posts (publish-Ereignisse)
  useEffect(() => {
    if (!viewerId) return;

    console.log('[feed] subscribing to realtime');

    const handleIncoming = async (payload: any) => {
      const evt = payload.eventType as 'INSERT' | 'UPDATE';
      const newRow = payload.new;
      const oldRow = payload.old;

      // Nur veröffentlichte Posts berücksichtigen (INSERT published oder UPDATE → published)
      const justPublished =
        newRow?.status === 'published' &&
        (evt === 'INSERT' || (evt === 'UPDATE' && oldRow?.status !== 'published'));

      if (!justPublished) return;

      const postId = newRow.id as string;
      if (!postId) return;

      // Sichtbarkeit per can_view_post absichern
      const { data: allowed, error: allowErr } = await supabase.rpc('can_view_post', {
        p_post_id: postId,
        p_viewer_id: viewerId,
      });

      if (allowErr) {
        console.error('[feed] can_view_post error', allowErr);
        return;
      }
      if (!allowed) {
        console.log('[feed] event ignored: viewer cannot see post', postId);
        return;
      }

      // Duplikate vermeiden
      if (loadedIds.has(postId) || incoming.some((p) => p.id === postId)) {
        return;
      }

      // Autor anreichern
      let author = null;
      if (newRow.user_id) {
        const { data: profiles, error: profErr } = await supabase
          .from('profiles')
          .select('id, vorname, nachname, avatar_url, ausbildungsberuf')
          .eq('id', newRow.user_id)
          .limit(1);
        if (!profErr && profiles && profiles.length) {
          author = profiles[0];
        }
      }

      const enriched: PostWithAuthor = { ...newRow, author };
      setIncoming((prev) => [enriched, ...prev]);
    };

    const channel = supabase
      .channel('home-feed-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        handleIncoming
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        handleIncoming
      )
      .subscribe();

    return () => {
      console.log('[feed] unsubscribing realtime');
      supabase.removeChannel(channel);
    };
  }, [viewerId, loadedIds, incoming]);

  const mergeIncoming = () => {
    if (!incoming.length) return;

    queryClient.setQueryData(['home-feed', viewerId], (oldData: any) => {
      if (!oldData?.pages?.length) return oldData;

      const existingIds = new Set(
        oldData.pages.flatMap((p: any) => p.items.map((it: any) => it.id))
      );
      const toAdd = incoming.filter((p) => !existingIds.has(p.id));

      // prepend in erste Seite, Rest bleibt
      const firstPage = oldData.pages[0];
      const newFirstPage = {
        ...firstPage,
        items: [...toAdd, ...firstPage.items],
      };
      const newPages = [newFirstPage, ...oldData.pages.slice(1)];

      return { ...oldData, pages: newPages };
    });

    setIncoming([]);
  };

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
      {incoming.length > 0 && (
        <div className="sticky top-0 z-10">
          <Card className="p-3 border-primary/30 bg-primary/10 backdrop-blur supports-[backdrop-filter]:bg-primary/15">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {incoming.length} neue Beiträge – Anzeigen
              </span>
              <Button size="sm" onClick={mergeIncoming}>
                Anzeigen
              </Button>
            </div>
          </Card>
        </div>
      )}

      {isEmpty ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Noch keine Beiträge in deinem Netzwerk. Folge anderen, um Beiträge zu sehen!
          </p>
        </Card>
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
