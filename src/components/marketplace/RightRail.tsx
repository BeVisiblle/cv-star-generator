
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function RightRail() {
  const sponsoredQuery = useQuery({
    queryKey: ["marketplace-sponsored"],
    queryFn: async () => {
      // Pick any occupation as "sponsored" for demo
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("type", "occupation")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },
  });

  const companiesQuery = useQuery({
    queryKey: ["marketplace-companies-reco"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, logo_url")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
  });

  const groupsQuery = useQuery({
    queryKey: ["marketplace-groups-trending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("member_count", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      {/* Sponsored */}
      <Card className="p-4 rounded-2xl">
        <div className="text-sm font-medium mb-3">Sponsored</div>
        {sponsoredQuery.data ? (
          <div className="space-y-2">
            {sponsoredQuery.data.image_url && (
              <img src={sponsoredQuery.data.image_url} alt="" className="w-full h-28 object-cover rounded-lg" />
            )}
            <div className="font-semibold text-sm line-clamp-2">{sponsoredQuery.data.title}</div>
            <Button size="sm" className="mt-2">Learn more</Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No sponsored item</div>
        )}
      </Card>

      {/* Recommended Companies */}
      <Card className="p-4 rounded-2xl">
        <div className="text-sm font-medium mb-3">Recommended Companies</div>
        <div className="space-y-3">
          {(companiesQuery.data || []).map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted overflow-hidden">
                {c.logo_url ? <img src={c.logo_url} alt="" /> : null}
              </div>
              <div className="text-sm flex-1 truncate">{c.name}</div>
              <Button size="sm" variant="secondary">Follow</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Trending Groups */}
      <Card className="p-4 rounded-2xl">
        <div className="text-sm font-medium mb-3">Trending Groups</div>
        <div className="space-y-3">
          {(groupsQuery.data || []).map((g: any) => (
            <div key={g.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted overflow-hidden" />
              <div className="text-sm flex-1 truncate">{g.name}</div>
              <Button size="sm" variant="secondary">Join</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default RightRail;
