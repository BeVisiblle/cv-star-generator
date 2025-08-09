
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
        viewer_id: viewerId as string,
        after_published: pageParam.after_published,
        after_id: pageParam.after_id,
        limit_count: PAGE_SIZE,
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
        _post_id: postId,
        _viewer: viewerId as string,
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
      <Card className="p-4 sm:p-5 md:p-6">
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
      <Card className="p-4 sm:p-5 md:p-6">
        <p className="text-center text-muted-foreground">
          Fehler beim Laden der Beiträge. Bitte versuche es später erneut.
        </p>
      </Card>
    );
  }

  const isEmpty = !posts || posts.length === 0;

  return (
    <div className="space-y-4 max-md:snap-y max-md:snap-mandatory">
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
              <div className="mx-auto w-full max-w-[420px] px-2 max-md:snap-start">
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
              </div>
            );
          })}
        </>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post: any) => (
              <div key={post.id} className="mx-auto w-full max-w-[420px] px-2 max-md:snap-start">
                <PostCard post={post} />
              </div>
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
