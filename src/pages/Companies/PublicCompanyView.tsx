
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useFollowCompany } from '@/hooks/useFollowCompany';
import { ExternalLink, MapPin, Globe, ArrowLeft, Linkedin, Instagram, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
// Minimal shape mapped to existing DB columns
type Company = {
  id: string;
  name: string;
  industry?: string | null;
  logo_url?: string | null;
  header_image?: string | null;
  size_range?: string | null; // employee count
  contact_person?: string | null;
  primary_email?: string | null;
  phone?: string | null;
  description?: string | null;
  website_url?: string | null;
  main_location?: string | null;
  country?: string | null;
  linkedin_url?: string | null;
  instagram_url?: string | null;
  mission_statement?: string | null;
  employee_count?: number | null;
};

export default function PublicCompanyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const pid = profile?.id;

  // Review gate state
  const [pendingFromCompany, setPendingFromCompany] = useState<boolean>(false);
  const [reviewReady, setReviewReady] = useState<boolean>(false);
  const [aboutExpanded, setAboutExpanded] = useState<boolean>(false);

  const companyQuery = useQuery<Company | null>({
    queryKey: ['public-company', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .rpc('get_company_public', { p_id: id });
      if (error) throw error;
      const row = ((data as any[]) || [])[0] || null;
      return row as Company | null;
    },
    enabled: !!id,
  });

  // Check for pending follow request from this company to current profile
  const pendingQuery = useQuery({
    queryKey: ['pending-follow-request', id, pid],
    queryFn: async () => {
      if (!id || !pid) return false;
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_type', 'company')
        .eq('follower_id', id)
        .eq('followee_type', 'profile')
        .eq('followee_id', pid)
        .eq('status', 'pending')
        .maybeSingle();
      return Boolean(data);
    },
    enabled: !!id && !!pid,
  });

  useEffect(() => {
    setPendingFromCompany(pendingQuery.data || false);
  }, [pendingQuery.data]);

  const { isFollowing, loading, toggleFollow } = useFollowCompany(id);

  // Review gate: Scroll >= 60% or expand "About us"
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      if (scrolled >= 0.6) {
        setReviewReady(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const markAboutSeen = () => {
    setReviewReady(true);
    setAboutExpanded(true);
  };

  const acceptFollowRequest = async () => {
    if (!pid || !reviewReady || !id) return;
    
    try {
      const { error } = await supabase
        .from('follows')
        .update({ status: 'accepted' })
        .eq('follower_type', 'company')
        .eq('follower_id', id)
        .eq('followee_type', 'profile')
        .eq('followee_id', pid)
        .eq('status', 'pending');

      if (error) throw error;

      setPendingFromCompany(false);
      toast({ description: 'Follow-Anfrage angenommen!' });
    } catch (error) {
      console.error('Error accepting follow request:', error);
      toast({ 
        variant: 'destructive', 
        description: 'Fehler beim Annehmen der Anfrage' 
      });
    }
  };

  const declineFollowRequest = async () => {
    if (!pid || !id) return;
    
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_type', 'company')
        .eq('follower_id', id)
        .eq('followee_type', 'profile')
        .eq('followee_id', pid)
        .eq('status', 'pending');

      if (error) throw error;

      setPendingFromCompany(false);
      toast({ description: 'Follow-Anfrage abgelehnt' });
    } catch (error) {
      console.error('Error declining follow request:', error);
      toast({ 
        variant: 'destructive', 
        description: 'Fehler beim Ablehnen der Anfrage' 
      });
    }
  };

  // Basic SEO
  useEffect(() => {
    const c = companyQuery.data;
    const title = c ? `${c.name} – Unternehmen` : 'Unternehmen';
    document.title = title;
    const desc = c?.description ? `${c.name}: ${c.description.slice(0, 150)}` : (c ? `${c.name} Unternehmensprofil` : 'Unternehmensprofil');
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;

    // canonical
    const canonicalHref = window.location.origin + window.location.pathname;
    let linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.rel = 'canonical';
      document.head.appendChild(linkEl);
    }
    linkEl.href = canonicalHref;
  }, [companyQuery.data]);

const c = companyQuery.data;

  const tagsQuery = useQuery<Record<string, string[]>>({
    queryKey: ['company-tags', id],
    queryFn: async () => {
      if (!id) return {};
      const { data: links } = await supabase
        .from('company_tags')
        .select('tag_id')
        .eq('company_id', id);
      const ids = (links || []).map((r: any) => r.tag_id);
      if (!ids.length) return {};
      const { data: vocab } = await supabase
        .from('vocab_tags')
        .select('id,label,type')
        .in('id', ids);
      const map: Record<string, string[]> = {};
      (vocab || []).forEach((t: any) => {
        if (!map[t.type]) map[t.type] = [];
        map[t.type].push(t.label);
      });
      Object.keys(map).forEach((k) => map[k].sort((a, b) => a.localeCompare(b)));
      return map;
    },
    enabled: !!id,
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <header className="w-full border-b">
        <div className="mx-auto max-w-6xl w-full px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs sm:text-sm -ml-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> Zurück
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        {/* Cover */}
        <section>
          <div className="w-full h-24 sm:h-32 md:h-40 lg:h-48 rounded-xl overflow-hidden bg-muted">
            {c?.header_image && (
              <img src={c.header_image} alt={`${c.name} Titelbild`} className="w-full h-full object-cover" />
            )}
          </div>
        </section>

        {/* Header row */}
        <section className="relative -mt-8 sm:-mt-10">
          <div className="bg-card rounded-xl shadow-sm p-3 sm:p-4 md:p-5 flex items-start gap-3 sm:gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border bg-muted flex-shrink-0">
              {c?.logo_url && <img src={c.logo_url} alt={`${c?.name} Logo`} className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold truncate">{c?.name || 'Unternehmen'}</h1>
              <div className="text-sm text-muted-foreground mt-1 truncate">
                {[
                  c?.industry,
                  c?.size_range,
                  typeof c?.employee_count === 'number' ? `${c.employee_count} Mitarbeitende` : null,
                ].filter(Boolean).join(' • ')}
              </div>
              <div className="text-sm text-muted-foreground mt-1 truncate">
                {c?.main_location && (
                  <span className="inline-flex items-center"><MapPin className="h-4 w-4 mr-1" />{c.main_location}{c.country ? `, ${c.country}` : ''}</span>
                )}
              </div>
            </div>
            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Review-gated Actions (only if pending) */}
              {pendingFromCompany && (
                <>
                  <Button
                    onClick={acceptFollowRequest}
                    disabled={!reviewReady}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    title={!reviewReady ? 'Bitte Profil ansehen (scrollen/öffnen), um anzunehmen' : 'Anfrage annehmen'}
                  >
                    Anfrage annehmen
                  </Button>
                  <Button
                    onClick={declineFollowRequest}
                    variant="outline"
                    size="sm"
                  >
                    Ablehnen
                  </Button>
                </>
              )}
              {/* Regular follow button */}
              {!pendingFromCompany && (
                <Button onClick={toggleFollow} disabled={loading} variant={isFollowing ? 'secondary' : 'default'}>
                  {isFollowing ? 'Gefolgt' : 'Folgen'}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Main grid */}
        <section className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-3 sm:gap-4 md:gap-6">
          {/* Left */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <Card className="p-3 sm:p-4 md:p-5">
              <Collapsible defaultOpen={aboutExpanded} onOpenChange={(open) => {
                if (open && !aboutExpanded) {
                  markAboutSeen();
                }
              }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Über uns</h2>
                  <div className="flex items-center gap-2">
                    {!aboutExpanded && pendingFromCompany && (
                      <Button 
                        onClick={markAboutSeen}
                        variant="link" 
                        size="sm"
                        className="text-xs p-0 h-auto text-primary"
                      >
                        Gelesen
                      </Button>
                    )}
                    <CollapsibleTrigger className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground [&[data-state=open]>.chev]:rotate-180">
                      <ChevronDown className="chev h-4 w-4 transition-transform" />
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {c?.description || 'Dieses Unternehmen hat noch keine Beschreibung hinzugefügt.'}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {c?.mission_statement && (
              <Card className="p-3 sm:p-4 md:p-5">
                <Collapsible defaultOpen>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Mission</h2>
                    <CollapsibleTrigger className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground [&[data-state=open]>.chev]:rotate-180">
                      <ChevronDown className="chev h-4 w-4 transition-transform" />
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {c.mission_statement}
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}

            {tagsQuery.data && Object.keys(tagsQuery.data).length > 0 && (
              <Card className="p-3 sm:p-4 md:p-5">
                <Collapsible defaultOpen>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Profil-Tags</h2>
                    <CollapsibleTrigger className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground [&[data-state=open]>.chev]:rotate-180">
                      <ChevronDown className="chev h-4 w-4 transition-transform" />
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="mt-2 space-y-3 text-sm">
                      {tagsQuery.data.profession?.length ? (
                        <div>
                          <Label>Berufe/Professionen</Label>
                          <p className="text-muted-foreground mt-1">{tagsQuery.data.profession.join(', ')}</p>
                        </div>
                      ) : null}
                      {tagsQuery.data.must?.length ? (
                        <div>
                          <Label>Must-Haves</Label>
                          <p className="text-muted-foreground mt-1">{tagsQuery.data.must.join(', ')}</p>
                        </div>
                      ) : null}
                      {tagsQuery.data.nice?.length ? (
                        <div>
                          <Label>Nice-to-Haves</Label>
                          <p className="text-muted-foreground mt-1">{tagsQuery.data.nice.join(', ')}</p>
                        </div>
                      ) : null}
                      {tagsQuery.data.benefit?.length ? (
                        <div>
                          <Label>Benefits</Label>
                          <p className="text-muted-foreground mt-1">{tagsQuery.data.benefit.join(', ')}</p>
                        </div>
                      ) : null}
                      {tagsQuery.data.work_env?.length ? (
                        <div>
                          <Label>Arbeitsumfeld</Label>
                          <p className="text-muted-foreground mt-1">{tagsQuery.data.work_env.join(', ')}</p>
                        </div>
                      ) : null}
                      {tagsQuery.data.target_group?.length ? (
                        <div>
                          <Label>Zielgruppen</Label>
                          <p className="text-muted-foreground mt-1">{tagsQuery.data.target_group.join(', ')}</p>
                        </div>
                      ) : null}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}

            <Card className="p-3 sm:p-4 md:p-5">
              <Collapsible defaultOpen>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Kontakt</h2>
                  <CollapsibleTrigger className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground [&[data-state=open]>.chev]:rotate-180">
                    <ChevronDown className="chev h-4 w-4 transition-transform" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="mt-2 text-sm space-y-1">
                    {c?.contact_person && <div>Kontaktperson: {c.contact_person}</div>}
                    {c?.primary_email && <div>E-Mail: <a className="underline" href={`mailto:${c.primary_email}`}>{c.primary_email}</a></div>}
                    {c?.phone && <div>Telefon: <a className="underline" href={`tel:${c.phone}`}>{c.phone}</a></div>}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card className="p-3 sm:p-4 md:p-5">
              <Collapsible defaultOpen>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Standort</h2>
                  <CollapsibleTrigger className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground [&[data-state=open]>.chev]:rotate-180">
                    <ChevronDown className="chev h-4 w-4 transition-transform" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {c?.main_location ? `${c.main_location}${c.country ? `, ${c.country}` : ''}` : '—'}
                  </div>
                  <div className="mt-3 h-40 rounded-lg bg-muted/60 border flex items-center justify-center text-xs text-muted-foreground">
                    Kartenansicht (bald verfügbar)
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card className="p-3 sm:p-4 md:p-5 border-dashed">
              <Collapsible defaultOpen>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Jobs (Bald verfügbar)</h2>
                  <CollapsibleTrigger className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground [&[data-state=open]>.chev]:rotate-180">
                    <ChevronDown className="chev h-4 w-4 transition-transform" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <p className="mt-2 text-sm text-muted-foreground">Wir arbeiten daran, hier Stellenangebote anzuzeigen.</p>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Right */}
          <aside className="space-y-3 sm:space-y-4 md:space-y-6">
            <Card className="p-3 sm:p-4 md:p-5">
              <h2 className="text-lg font-semibold">Links</h2>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                {c?.website_url && (
                  <a href={c.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary hover:underline">
                    <Globe className="h-4 w-4 mr-2" /> Webseite <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
                {c?.linkedin_url && (
                  <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary hover:underline">
                    <Linkedin className="h-4 w-4 mr-2" /> LinkedIn <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
                {c?.instagram_url && (
                  <a href={c.instagram_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary hover:underline">
                    <Instagram className="h-4 w-4 mr-2" /> Instagram <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </Card>
          </aside>
        </section>
      </main>

      {/* Mobile sticky actions */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3">
        <div className="max-w-6xl mx-auto">
          {pendingFromCompany ? (
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={acceptFollowRequest} 
                disabled={!reviewReady}
                title={!reviewReady ? 'Bitte Profil ansehen (scrollen/öffnen), um anzunehmen' : 'Anfrage annehmen'}
              >
                Anfrage annehmen
              </Button>
              <Button 
                variant="outline" 
                onClick={declineFollowRequest}
                className="px-4"
              >
                Ablehnen
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={toggleFollow} disabled={loading}>
              {isFollowing ? 'Gefolgt' : 'Folgen'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
