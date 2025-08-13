import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SimpleCompany {
  id: string;
  name: string | null;
  logo_url: string | null;
  industry: string | null;
  main_location: string | null;
}
interface CompanyRecommendationsProps {
  limit?: number;
  showMoreLink?: string;
  showMore?: boolean;
}

export const CompanyRecommendations: React.FC<CompanyRecommendationsProps> = ({ limit = 3, showMoreLink = "/entdecken/unternehmen", showMore = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<SimpleCompany[]>([]);
  const [following, setFollowing] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_companies_public', { search: null, limit_count: 12, offset_count: 0 });
        if (error) throw error;
        setItems(((data as any[]) || []).map(d => ({ id: d.id, name: d.name, logo_url: d.logo_url, industry: d.industry, main_location: d.main_location })).slice(0, limit));
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

  React.useEffect(() => {
    const loadFollows = async () => {
      if (!user || items.length === 0) return;
      const ids = items.map(i => i.id);
      const { data, error } = await supabase
        .from('follows')
        .select('followee_id')
        .eq('follower_id', user.id)
        .eq('follower_type', 'profile')
        .eq('followee_type', 'company')
        .in('followee_id', ids);
      if (!error && data) {
        setFollowing(new Set((data as any[]).map((d: any) => d.followee_id as string)));
      }
    };
    loadFollows();
  }, [items, user]);

  const followCompany = async (id: string) => {
    if (!user) { window.location.href = '/auth'; return; }
    try {
      if (following.has(id)) {
        const { error } = await supabase.from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followee_id', id)
          .eq('follower_type', 'profile')
          .eq('followee_type', 'company');
        if (!error) {
          setFollowing(prev => { const n = new Set(prev); n.delete(id); return n; });
        }
      } else {
        const { error } = await supabase.from('follows').insert({ 
          follower_id: user.id, 
          followee_id: id,
          follower_type: 'profile',
          followee_type: 'company',
          status: 'accepted' 
        });
        if (!error) {
          setFollowing(prev => new Set(prev).add(id));
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Fehler', description: 'Aktion fehlgeschlagen.', variant: 'destructive' });
    }
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
                <Button size="sm" variant="outline" onClick={() => navigate(`/companies/${c.id}`)}>Ansehen</Button>
              </div>
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <p className="text-xs text-muted-foreground">Aktuell keine Unternehmensempfehlungen verfügbar.</p>
        )}
      {showMore && (
        <div className="pt-2">
          <Button variant="link" size="sm" className="px-0" onClick={() => (window.location.href = showMoreLink)}>
            Mehr anzeigen <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  </Card>
  );
};
