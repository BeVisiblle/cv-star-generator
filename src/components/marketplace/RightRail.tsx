import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdCard from "@/components/ads/AdCard";


// Use an untyped Supabase instance to avoid type errors for tables
// that are not present in the generated Supabase types yet.
const sb: any = supabase;

type SponsoredItem = {
  id: string;
  title: string;
  image_url?: string | null;
};

type CompanyReco = {
  id: string;
  name: string;
  logo_url?: string | null;
};

type GroupReco = {
  id: string;
  name: string;
  member_count: number;
};

export function RightRail() {
  const sponsoredImageUrl: string | null = null;

  const companiesQuery = useQuery<CompanyReco[]>({
    queryKey: ["marketplace-companies-reco"],
    queryFn: async () => {
      const { data, error } = await sb
        .rpc('get_companies_public', { search: null, limit_count: 3, offset_count: 0 });
      if (error) return [] as CompanyReco[];
      return (data || []) as CompanyReco[];
    },
  });

  const groups: GroupReco[] = [
    { id: "g1", name: "Azubis Maschinenbau", member_count: 124 },
    { id: "g2", name: "IT Ausbildung & Karriere", member_count: 312 },
    { id: "g3", name: "Handwerk Community DE", member_count: 208 },
  ];

  return (
    <div className="space-y-4">
      {/* Anzeige */}
      <AdCard
        title="Entdecke jetzt die Zukunft deiner Karriere"
        description="Teste unsere Tools für Azubis und Fachkräfte – kostenlos starten!"
        imageUrl={sponsoredImageUrl}
        ctaLabel="Jetzt testen"
      />

      {/* Unternehmen */}
      <Card className="p-4 rounded-2xl">
        <div className="text-sm font-medium mb-3">Interessante Unternehmen</div>
        <div className="space-y-3">
          {(companiesQuery.data || []).map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted overflow-hidden">
                {c.logo_url ? <img src={c.logo_url} alt={c.name} /> : null}
              </div>
              <div className="text-sm flex-1 truncate">{c.name}</div>
              <Button size="sm" variant="secondary">Folgen</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Gruppen */}
      <Card className="p-4 rounded-2xl">
        <div className="text-sm font-medium mb-3">Beliebte Gruppen</div>
        <div className="space-y-3">
          {(groups || []).map((g) => (
            <div key={g.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted overflow-hidden" />
              <div className="text-sm flex-1 truncate">{g.name}</div>
              <Button size="sm" variant="secondary">Beitreten</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Anzeige */}
      <AdCard
        title="Entdecke jetzt die Zukunft deiner Karriere"
        description="Teste unsere Tools für Azubis und Fachkräfte – kostenlos starten!"
        imageUrl={sponsoredImageUrl}
        ctaLabel="Jetzt testen"
      />
    </div>
  );
}

export default RightRail;
