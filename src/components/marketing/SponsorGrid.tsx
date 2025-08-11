import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export type Partner = {
  id: string;
  name: string;
  logoUrl?: string;
  url?: string;
};

interface SponsorGridProps {
  endpoint: string; // e.g. "/api/partners?audience=business" (fallback auf Edge Function)
  title?: string;
  subtitle?: string;
  className?: string;
}

const cache = new Map<string, Partner[]>();

export default function SponsorGrid({ endpoint, title = "Sponsort von", subtitle = "Diese Partner machen unsere Mission möglich.", className }: SponsorGridProps) {
  const [data, setData] = useState<Partner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const audience = useMemo(() => {
    try {
      const u = new URL(endpoint, window.location.origin);
      return u.searchParams.get("audience") ?? undefined;
    } catch {
      return undefined;
    }
  }, [endpoint]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (cache.has(endpoint)) {
        setData(cache.get(endpoint)!);
        setLoading(false);
        // SWR: revalidate idle
        if ("requestIdleCallback" in window) {
          (window as any).requestIdleCallback(fetchFresh);
        } else {
          setTimeout(fetchFresh, 0);
        }
        return;
      }
      // try REST first (if user has backend route)
      const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const json = (await res.json()) as Partner[];
        cache.set(endpoint, json);
        setData(json);
        setLoading(false);
        return;
      }
      // fallback to Supabase Edge Function
      await fetchFresh();
    } catch (e: any) {
      setError(e?.message || "Unbekannter Fehler");
      setLoading(false);
    }
  };

  const fetchFresh = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("partners", {
        body: { audience },
      });
      if (error) throw error;
      const items = (data as any)?.partners ?? (data as any) ?? [];
      cache.set(endpoint, items);
      setData(items);
    } catch (e: any) {
      setError(e?.message || "Fehler beim Laden der Partner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const Skeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" aria-busy>
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="bg-muted/40 border-muted">
          <CardContent className="h-20 flex items-center justify-center">
            <div className="h-8 w-24 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const Acronym = ({ name }: { name: string }) => {
    const letters = name
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
    return (
      <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold">
        {letters}
      </div>
    );
  };

  return (
    <section className={cn("py-10", className)} aria-labelledby="sponsors-heading">
      <header className="mb-6 text-center">
        <h2 id="sponsors-heading" className="text-xl md:text-2xl font-semibold">
          {title}
        </h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </header>

      {loading && <Skeleton />}

      {!loading && error && (
        <div className="flex items-center justify-center flex-col gap-3">
          <p className="text-sm text-muted-foreground">Partner konnten nicht geladen werden.</p>
          <Button variant="secondary" onClick={load} aria-label="Erneut versuchen">
            Erneut versuchen
          </Button>
        </div>
      )}

      {!loading && !error && (!data || data.length === 0) && (
        <div className="text-center text-muted-foreground">Bald verfügbar – neue Partner werden gerade ergänzt.</div>
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.map((p) => (
            <Card key={p.id} className="bg-background border-muted hover:shadow-sm transition-shadow">
              <CardContent className="h-20 flex items-center justify-center p-2">
                {p.logoUrl ? (
                  <a href={p.url || "#"} target="_blank" rel="noreferrer" aria-label={`Partner: ${p.name}`} className="flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.logoUrl}
                      alt={`${p.name} Logo`}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        const sibling = (e.currentTarget.parentElement?.querySelector('[data-fallback]') as HTMLElement) || null;
                        if (sibling) sibling.style.display = "flex";
                      }}
                    />
                    <div data-fallback style={{ display: "none" }} className="items-center justify-center hidden">
                      <Acronym name={p.name} />
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center justify-center">
                    <Acronym name={p.name} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
