import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import LeftOnThisPage from '@/components/marketplace/LeftOnThisPage';
import FilterChipsBar from '@/components/marketplace/FilterChipsBar';
import RightRail from '@/components/marketplace/RightRail';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MarketplaceComposer from '@/components/marketplace/MarketplaceComposer';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

// Simple types for the new sections
type Person = { id: string; vorname?: string | null; nachname?: string | null; avatar_url?: string | null };
type Company = { id: string; name: string; logo_url?: string | null };
type Post = { id: string; content: string; image_url?: string | null };

export default function Marketplace() {
  const [q, setQ] = React.useState('');
  const [appliedQ, setAppliedQ] = React.useState('');
  const [openComposer, setOpenComposer] = React.useState(false);

  const [morePeople, setMorePeople] = React.useState(false);
  const [moreCompanies, setMoreCompanies] = React.useState(false);
  const [morePosts, setMorePosts] = React.useState(false);

  const [searchParams] = useSearchParams();
  React.useEffect(() => {
    const qp = searchParams.get('q') || '';
    setQ(qp);
    setAppliedQ(qp);
  }, [searchParams]);
  const typeParam = (searchParams.get('type') || '').toLowerCase();

  const handleSearch = () => setAppliedQ(q.trim());

  // Queries
  const peopleQuery = useQuery<Person[]>({
    queryKey: ['mp-people', appliedQ, morePeople],
    queryFn: async () => {
      const base = supabase.from('profiles').select('id, vorname, nachname, avatar_url');
      const qy = appliedQ ? base.or(`vorname.ilike.%${appliedQ}%,nachname.ilike.%${appliedQ}%`) : base.order('created_at', { ascending: false });
      const { data, error } = await qy.limit(morePeople ? 18 : 6);
      if (error) throw error;
      return (data || []) as Person[];
    },
  });

  const companiesQuery = useQuery<Company[]>({
    queryKey: ['mp-companies', appliedQ, moreCompanies],
    queryFn: async () => {
      let qy = supabase.from('companies').select('id, name, logo_url');
      if (appliedQ) qy = qy.ilike('name', `%${appliedQ}%`);
      else qy = qy.order('created_at', { ascending: false });
      const { data, error } = await qy.limit(moreCompanies ? 18 : 6);
      if (error) return [] as Company[]; // RLS may block; fail soft
      return (data || []) as Company[];
    },
  });

  const postsQuery = useQuery<Post[]>({
    queryKey: ['mp-posts', appliedQ, morePosts],
    queryFn: async () => {
      let qy = supabase.from('posts').select('id, content, image_url').eq('status', 'published');
      if (appliedQ) qy = qy.ilike('content', `%${appliedQ}%`);
      else qy = qy.order('published_at', { ascending: false });
      const { data, error } = await qy.limit(morePosts ? 18 : 6);
      if (error) throw error;
      return (data || []) as Post[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">

      {/* Chips under header */}
      <div className="border-b">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-3">
          <FilterChipsBar />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_320px] gap-6">
        {/* Left: Auf dieser Seite */}
        <div className="hidden lg:block"><LeftOnThisPage /></div>

        {/* Center: Sections (filter by type) */}
        <div className="space-y-6">
          {(() => {
            const type = typeParam;
            const showPeople = !type || type === 'people';
            const showCompanies = !type || type === 'companies';
            const showPosts = !type || type === 'posts';
            const showGroups = !type || type === 'groups';
            return (
              <>
                {showPeople && (
                  <section id="personen">
                    <Card className="p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Interessante Personen</h2>
                        <Button variant="ghost" size="sm" onClick={() => setMorePeople((v) => !v)}>
                          {morePeople ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(peopleQuery.data || []).map((p) => {
                          const name = `${p.vorname ?? ''} ${p.nachname ?? ''}`.trim() || 'Unbekannt';
                          return (
                            <div key={p.id} className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={p.avatar_url ?? undefined} alt={name} />
                                <AvatarFallback>{name.slice(0,2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-medium truncate">{name}</div>
                              <div className="ml-auto">
                                <Button size="sm" variant="secondary">Vernetzen</Button>
                              </div>
                            </div>
                          );
                        })}
                        {peopleQuery.isLoading && <div className="text-sm text-muted-foreground">Lade Personen…</div>}
                        {!peopleQuery.isLoading && (peopleQuery.data || []).length === 0 && (
                          <div className="text-sm text-muted-foreground">Keine Personen gefunden.</div>
                        )}
                      </div>
                    </Card>
                  </section>
                )}

                {showCompanies && (
                  <section id="unternehmen">
                    <Card className="p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Interessante Unternehmen</h2>
                        <Button variant="ghost" size="sm" onClick={() => setMoreCompanies((v) => !v)}>
                          {moreCompanies ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(companiesQuery.data || []).map((c) => (
                          <div key={c.id} className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-muted overflow-hidden">
                              {c.logo_url ? <img src={c.logo_url} alt={c.name} /> : null}
                            </div>
                            <div className="text-sm font-medium truncate">{c.name}</div>
                            <div className="ml-auto">
                              <Button size="sm" variant="secondary">Folgen</Button>
                            </div>
                          </div>
                        ))}
                        {companiesQuery.isLoading && <div className="text-sm text-muted-foreground">Lade Unternehmen…</div>}
                        {!companiesQuery.isLoading && (companiesQuery.data || []).length === 0 && (
                          <div className="text-sm text-muted-foreground">Keine Unternehmen gefunden.</div>
                        )}
                      </div>
                    </Card>
                  </section>
                )}

                {showPosts && (
                  <section id="beitraege">
                    <Card className="p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Interessante Beiträge</h2>
                        <Button variant="ghost" size="sm" onClick={() => setMorePosts((v) => !v)}>
                          {morePosts ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(postsQuery.data || []).map((post) => (
                          <div key={post.id} className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded bg-muted/60 flex-shrink-0" />
                            <div className="text-sm leading-relaxed line-clamp-3">{post.content}</div>
                          </div>
                        ))}
                        {postsQuery.isLoading && <div className="text-sm text-muted-foreground">Lade Beiträge…</div>}
                        {!postsQuery.isLoading && (postsQuery.data || []).length === 0 && (
                          <div className="text-sm text-muted-foreground">Keine Beiträge gefunden.</div>
                        )}
                      </div>
                    </Card>
                  </section>
                )}

                {showGroups && (
                  <section id="gruppen">
                    <Card className="p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Gruppen</h2>
                        <Button variant="ghost" size="sm" disabled>
                          Mehr anzeigen
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">Gruppen werden hier angezeigt, sobald verfügbar.</div>
                    </Card>
                  </section>
                )}
              </>
            );
          })()}

        </div>

        {/* Right rail */}
        <div className="hidden xl:block"><RightRail /></div>
      </div>

      {/* Mobile FAB */}
      <Button className="md:hidden fixed bottom-5 right-5 h-12 w-12 rounded-full shadow-lg" size="icon" onClick={() => setOpenComposer(true)}>
        <Plus className="h-5 w-5" />
      </Button>

      {/* Composer */}
      <MarketplaceComposer open={openComposer} onOpenChange={setOpenComposer} />
    </div>
  );
}
