
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFollowCompany } from '@/hooks/useFollowCompany';
import { ExternalLink, MapPin, Globe, ArrowLeft, Linkedin, Instagram } from 'lucide-react';

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

  const { isFollowing, loading, toggleFollow } = useFollowCompany(id);

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

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <header className="w-full border-b">
        <div className="mx-auto max-w-6xl w-full px-3 sm:px-6 py-3 flex items-center gap-3">
          <Link to="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Zurück zum Marktplatz
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl w-full px-3 sm:px-6 py-4 sm:py-6">
        {/* Cover */}
        <section>
          <div className="w-full h-40 sm:h-56 md:h-72 rounded-xl overflow-hidden bg-muted">
            {c?.header_image && (
              <img src={c.header_image} alt={`${c.name} Titelbild`} className="w-full h-full object-cover" />
            )}
          </div>
        </section>

        {/* Header row */}
        <section className="relative -mt-10 sm:-mt-12">
          <div className="bg-card rounded-xl shadow-sm p-4 sm:p-5 md:p-6 flex items-start gap-4">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden border bg-muted flex-shrink-0">
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
            {/* Desktop follow */}
            <div className="hidden md:flex items-center gap-2">
              <Button onClick={toggleFollow} disabled={loading} variant={isFollowing ? 'secondary' : 'default'}>
                {isFollowing ? 'Gefolgt' : 'Folgen'}
              </Button>
            </div>
          </div>
        </section>

        {/* Main grid */}
        <section className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4 md:gap-6">
          {/* Left */}
          <div className="space-y-4 md:space-y-6">
            <Card className="p-4 sm:p-5 md:p-6">
              <h2 className="text-lg font-semibold">Über uns</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {c?.description || 'Dieses Unternehmen hat noch keine Beschreibung hinzugefügt.'}
              </p>
            </Card>

            {c?.mission_statement && (
              <Card className="p-4 sm:p-5 md:p-6">
                <h2 className="text-lg font-semibold">Mission</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {c.mission_statement}
                </p>
              </Card>
            )}

            <Card className="p-4 sm:p-5 md:p-6">
              <h2 className="text-lg font-semibold">Kontakt</h2>
              <div className="mt-2 text-sm space-y-1">
                {c?.contact_person && <div>Kontaktperson: {c.contact_person}</div>}
                {c?.primary_email && <div>E-Mail: <a className="underline" href={`mailto:${c.primary_email}`}>{c.primary_email}</a></div>}
                {c?.phone && <div>Telefon: <a className="underline" href={`tel:${c.phone}`}>{c.phone}</a></div>}
              </div>
            </Card>

            <Card className="p-4 sm:p-5 md:p-6">
              <h2 className="text-lg font-semibold">Standort</h2>
              <div className="mt-2 text-sm text-muted-foreground">
                {c?.main_location ? `${c.main_location}${c.country ? `, ${c.country}` : ''}` : '—'}
              </div>
              <div className="mt-3 h-40 rounded-lg bg-muted/60 border flex items-center justify-center text-xs text-muted-foreground">
                Kartenansicht (bald verfügbar)
              </div>
            </Card>

            <Card className="p-4 sm:p-5 md:p-6 border-dashed">
              <h2 className="text-lg font-semibold">Jobs (Bald verfügbar)</h2>
              <p className="mt-2 text-sm text-muted-foreground">Wir arbeiten daran, hier Stellenangebote anzuzeigen.</p>
            </Card>
          </div>

          {/* Right */}
          <aside className="space-y-4 md:space-y-6">
            <Card className="p-4 sm:p-5 md:p-6">
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

      {/* Mobile sticky follow */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3">
        <div className="max-w-6xl mx-auto">
          <Button className="w-full" onClick={toggleFollow} disabled={loading}>
            {isFollowing ? 'Gefolgt' : 'Folgen'}
          </Button>
        </div>
      </div>
    </div>
  );
}
