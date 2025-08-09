
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const sponsoredQuery = useQuery<SponsoredItem | null>({
    queryKey: ["marketplace-sponsored"],
    queryFn: async () => {
      // Pick any occupation as "sponsored" for demo
      const { data, error } = await sb
        .from("marketplace_items")
        .select("id,title,image_url")
        .eq("type", "occupation")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data?.[0] as SponsoredItem) || null;
    },
  });

  const companiesQuery = useQuery<CompanyReco[]>({
    queryKey: ["marketplace-companies-reco"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("companies")
        .select("id, name, logo_url")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data || []) as CompanyReco[];
    },
  });

  const groupsQuery = useQuery<GroupReco[]>({
    queryKey: ["marketplace-groups-trending"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("groups")
        .select("id,name,member_count")
        .order("member_count", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data || []) as GroupReco[];
    },
  });

  return (
    <div className="space-y-4">
      {/* Sponsored */}
      <Card className="p-4 rounded-2xl">
        <div className="text-sm font-medium mb-3">Anzeige</div>
        {sponsoredQuery.data ? (
          <div className="space-y-2">
            {sponsoredQuery.data.image_url && (
              <img src={sponsoredQuery.data.image_url} alt="Anzeige" className="w-full h-28 object-cover rounded-lg" />
            )}
            <div className="font-semibold text-sm line-clamp-2">{sponsoredQuery.data.title}</div>
            <Button size="sm" className="mt-2">Jetzt testen</Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Keine Anzeige</div>
        )}
      </Card>

      {/* Recommended Companies */}
      <Card className="p-4 rounded-2xl">
        <div className="text-sm font-medium mb-3">Interessante Unternehmen</div>
        <div className="space-y-3">
          {(companiesQuery.data || []).map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted overflow-hidden">
                {c.logo_url ? <img src={c.logo_url} alt="" /> : null}
              </div>
              <div className="text-sm flex-1 truncate">{c.name}</div>
              <Button size="sm" variant="secondary">Folgen</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Trending Groups */}
      <Card className="p-4 rounded-2xl">
        <div className="text-sm font-medium mb-3">Beliebte Gruppen</div>
        <div className="space-y-3">
          {(groupsQuery.data || []).map((g) => (
            <div key={g.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted overflow-hidden" />
              <div className="text-sm flex-1 truncate">{g.name}</div>
              <Button size="sm" variant="secondary">Beitreten</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 rounded-2xl">
        <div className="text-sm font-medium mb-3">Anzeige</div>
        {sponsoredQuery.data ? (
          <div className="space-y-2">
            {sponsoredQuery.data.image_url && (
              <img src={sponsoredQuery.data.image_url} alt="Anzeige" className="w-full h-28 object-cover rounded-lg" />
            )}
            <div className="font-semibold text-sm line-clamp-2">{sponsoredQuery.data.title}</div>
            <Button size="sm" className="mt-2">Jetzt testen</Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Keine Anzeige</div>
        )}
      </Card>
    </div>
  );
}

export default RightRail;
