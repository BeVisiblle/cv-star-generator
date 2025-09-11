import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Check, ChevronRight, MessageSquare, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConnections, type ConnectionState } from "@/hooks/useConnections";

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
  const navigate = useNavigate();
  const { getStatuses, requestConnection, acceptRequest, declineRequest, cancelRequest } = useConnections();

  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<SimpleProfile[]>([]);
  const [statusMap, setStatusMap] = React.useState<Record<string, ConnectionState>>({});

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, vorname, nachname, avatar_url, ort, branche, headline, ausbildungsberuf, geplanter_abschluss, status")
          .eq("profile_published", true)
        .in("status", ["azubi", "schueler"]) as any;
        if (error) throw error;
        if (!user) {
          setItems([]);
          return;
        }
        const filtered = (data as SimpleProfile[]).filter(p => p.id !== user.id).slice(0, limit);
        setItems(filtered);
        // Preload connection statuses
        const ids = filtered.map(f => f.id);
        const statuses = await getStatuses(ids);
        setStatusMap(statuses);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, limit, getStatuses]);

  const onConnect = async (targetId: string) => {
    try {
      await requestConnection(targetId);
      setStatusMap(prev => ({ ...prev, [targetId]: "pending" }));
      toast({ title: "Anfrage gesendet", description: "Deine Verbindungsanfrage ist jetzt ausstehend." });
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", description: "Konnte Anfrage nicht senden.", variant: "destructive" });
    }
  };

  const onAccept = async (fromId: string) => {
    try {
      await acceptRequest(fromId);
      setStatusMap(prev => ({ ...prev, [fromId]: "accepted" }));
      toast({ title: "Verbunden", description: "Ihr könnt jetzt chatten." });
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", description: "Konnte Anfrage nicht annehmen.", variant: "destructive" });
    }
  };

  const onDecline = async (fromId: string) => {
    try {
      await declineRequest(fromId);
      setStatusMap(prev => ({ ...prev, [fromId]: "declined" }));
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", description: "Konnte Anfrage nicht ablehnen.", variant: "destructive" });
    }
  };

  const onCancel = async (targetId: string) => {
    try {
      await cancelRequest(targetId);
      setStatusMap(prev => ({ ...prev, [targetId]: "none" }));
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", description: "Konnte Anfrage nicht zurückziehen.", variant: "destructive" });
    }
  };

  return (
    <Card className="p-3">
      <h3 className="text-sm font-semibold mb-2">Empfehlungen für Azubis</h3>
      <div className="space-y-2">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-7 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {!loading && (
          (items.filter(p => (statusMap[p.id] ?? 'none') === 'none' && p.id !== user?.id)).map(p => {
            const name = [p.vorname, p.nachname].filter(Boolean).join(" ") || "Unbekannt";
            const infoLine = [p.ort, p.branche].filter(Boolean).join(" • ");
            const subtitle = p.headline || p.ausbildungsberuf || p.geplanter_abschluss || "";
            const st = statusMap[p.id] || "none";
            return (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate(`/u/${p.id}`)}>
                  <AvatarImage src={p.avatar_url ?? undefined} alt={`${name} Avatar`} />
                  <AvatarFallback className="text-xs">{name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/u/${p.id}`)}>
                  <div className="text-sm font-medium truncate">{name}</div>
                  {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
                  {infoLine && <div className="text-xs text-muted-foreground truncate">{infoLine}</div>}
                </div>
                {st === "accepted" && (
                  <Button size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(`/community/messages`)}> 
                    <MessageSquare className="h-3 w-3 mr-1" /> Nachricht
                  </Button>
                )}
                {st === "none" && (
                  <Button size="sm" className="h-7 px-2 text-xs" onClick={() => onConnect(p.id)}>
                    <UserPlus className="h-3 w-3 mr-1" /> Vernetzen
                  </Button>
                )}
                {st === "pending" && (
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="secondary" className="h-7 px-2 text-xs" disabled>
                      <Check className="h-3 w-3 mr-1" /> Ausstehend
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Anfrage zurückziehen" onClick={() => onCancel(p.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {st === "incoming" && (
                  <div className="flex items-center gap-1">
                    <Button size="sm" className="h-7 px-2 text-xs" onClick={() => onAccept(p.id)}>Annehmen</Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => onDecline(p.id)}>Ablehnen</Button>
                  </div>
                )}
                {st === "declined" && (
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => onConnect(p.id)}>Erneut senden</Button>
                )}
              </div>
            );
          })
        )}
        {!loading && items.filter(p => (statusMap[p.id] ?? 'none') === 'none' && p.id !== user?.id).length === 0 && (
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
