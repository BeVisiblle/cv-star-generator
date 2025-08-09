import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SimpleCompany {
  id: string;
  name: string | null;
  logo_url: string | null;
  industry: string | null;
  main_location: string | null;
}

export const CompanyRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<SimpleCompany[]>([]);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("companies")
          .select("id, name, logo_url, industry, main_location, subscription_status, created_at")
          .eq("subscription_status", "active")
          .limit(6) as any;
        const { data, error } = await query;
        if (error) throw error;
        setItems((data as any[]).map(d => ({ id: d.id, name: d.name, logo_url: d.logo_url, industry: d.industry, main_location: d.main_location })));
      } catch (e) {
        // RLS kann den Zugriff beschränken – wir zeigen dann eine leere Liste
        console.warn("Company recommendations restricted by RLS or error.", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const followCompany = (id: string) => {
    toast({ title: "Bald verfügbar", description: "Unternehmen folgen kommt in Kürze." });
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Interessante Unternehmen</h3>
      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {!loading && items.map(c => {
          const name = c.name || "Unternehmen";
          const info = [c.main_location, c.industry].filter(Boolean).join(" • ");
          return (
            <div key={c.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded">
                <AvatarImage src={c.logo_url ?? undefined} alt={`${name} Logo`} />
                <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{name}</div>
                {info && <div className="text-xs text-muted-foreground truncate">{info}</div>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => followCompany(c.id)}>Folgen</Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/unternehmen')}>Ansehen</Button>
              </div>
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <p className="text-xs text-muted-foreground">Aktuell keine Unternehmensempfehlungen verfügbar.</p>
        )}
      </div>
    </Card>
  );
};
