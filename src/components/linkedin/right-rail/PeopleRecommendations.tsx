import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Check, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SimpleProfile {
  id: string;
  vorname: string | null;
  nachname: string | null;
  avatar_url: string | null;
  ort: string | null;
  branche: string | null;
  headline: string | null;
  ausbildungsberuf: string | null;
  geplanter_abschluss: string | null;
  status: string | null;
}
interface PeopleRecommendationsProps {
  limit?: number;
  showMoreLink?: string;
  showMore?: boolean;
}

export const PeopleRecommendations: React.FC<PeopleRecommendationsProps> = ({ limit = 3, showMoreLink = "/entdecken/azubis", showMore = true }) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<SimpleProfile[]>([]);
  const [following, setFollowing] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, vorname, nachname, avatar_url, ort, branche, headline, ausbildungsberuf, geplanter_abschluss, status")
          .eq("profile_published", true)
          .in("status", ["azubi", "schueler"]) as any;
        if (error) throw error;
        const filtered = (data as SimpleProfile[]).filter(p => p.id !== user.id).slice(0, limit);
        setItems(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const connect = async (targetId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
      if (error) throw error;
      setFollowing(prev => ({ ...prev, [targetId]: true }));
      toast({ title: "Verbunden", description: "Anfrage erfolgreich gesendet." });
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", description: "Konnte nicht verbinden.", variant: "destructive" });
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Empfehlungen für Azubis</h3>
      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {!loading && items.map(p => {
          const name = [p.vorname, p.nachname].filter(Boolean).join(" ") || "Unbekannt";
          const infoLine = [p.ort, p.branche].filter(Boolean).join(" • ");
          const subtitle = p.headline || p.ausbildungsberuf || p.geplanter_abschluss || "";
          const isFollowed = !!following[p.id];
          return (
            <div key={p.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={p.avatar_url ?? undefined} alt={`${name} Avatar`} />
                <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{name}</div>
                {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
                {infoLine && <div className="text-xs text-muted-foreground truncate">{infoLine}</div>}
              </div>
              <Button size="sm" variant={isFollowed ? "secondary" : "default"} onClick={() => connect(p.id)} disabled={isFollowed}>
                {isFollowed ? (<><Check className="h-4 w-4 mr-1" /> Verbunden</>) : (<><UserPlus className="h-4 w-4 mr-1" /> Vernetzen</>)}
              </Button>
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <p className="text-xs text-muted-foreground">Keine Empfehlungen gefunden.</p>
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
