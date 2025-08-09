import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConnections } from "@/hooks/useConnections";
import { useNavigate } from "react-router-dom";

interface ConnectionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BasicProfile { id: string; vorname: string | null; nachname: string | null; avatar_url: string | null; headline: string | null; ort: string | null; }

export const ConnectionsDrawer: React.FC<ConnectionsDrawerProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { acceptRequest, declineRequest, cancelRequest } = useConnections();

  const [incoming, setIncoming] = React.useState<string[]>([]);
  const [outgoing, setOutgoing] = React.useState<string[]>([]);
  const [accepted, setAccepted] = React.useState<string[]>([]);
  const [profiles, setProfiles] = React.useState<Record<string, BasicProfile>>({});
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [inc, out, acc] = await Promise.all([
        supabase.from("connections").select("requester_id").eq("addressee_id", user.id).eq("status", "pending"),
        supabase.from("connections").select("addressee_id").eq("requester_id", user.id).eq("status", "pending"),
        supabase.from("connections").select("requester_id,addressee_id").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).eq("status", "accepted"),
      ]);

      const incomingIds = (inc.data || []).map(r => (r as any).requester_id as string);
      const outgoingIds = (out.data || []).map(r => (r as any).addressee_id as string);
      const acceptedIds = (acc.data || []).map(r => ((r as any).requester_id === user.id ? (r as any).addressee_id : (r as any).requester_id) as string);

      setIncoming(incomingIds);
      setOutgoing(outgoingIds);
      setAccepted(acceptedIds);

      const ids = Array.from(new Set([...incomingIds, ...outgoingIds, ...acceptedIds]));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, vorname, nachname, avatar_url, headline, ort")
          .in("id", ids);
        const map: Record<string, BasicProfile> = {};
        (profs || []).forEach((p: any) => { map[p.id] = p as BasicProfile; });
        setProfiles(map);
      } else {
        setProfiles({});
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  const fullName = (p?: BasicProfile) => [p?.vorname, p?.nachname].filter(Boolean).join(" ") || "Unbekannt";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Mein Netzwerk</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 grid gap-4">
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">Anfragen</h3>
            <Card className="p-3">
              <div className="space-y-3">
                {loading && <div className="text-sm text-muted-foreground">Lädt…</div>}
                {!loading && incoming.length === 0 && outgoing.length === 0 && (
                  <div className="text-sm text-muted-foreground">Keine Anfragen.</div>
                )}
                {incoming.map((id) => (
                  <div key={`inc-${id}`} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={profiles[id]?.avatar_url ?? undefined} /><AvatarFallback>{fullName(profiles[id]).slice(0,2)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{fullName(profiles[id])}</div>
                      <div className="text-xs text-muted-foreground truncate">{profiles[id]?.headline || profiles[id]?.ort}</div>
                    </div>
                    <Button size="sm" onClick={async () => { await acceptRequest(id); await load(); }}>Annehmen</Button>
                    <Button size="sm" variant="outline" onClick={async () => { await declineRequest(id); await load(); }}>Ablehnen</Button>
                  </div>
                ))}
                {outgoing.map((id) => (
                  <div key={`out-${id}`} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={profiles[id]?.avatar_url ?? undefined} /><AvatarFallback>{fullName(profiles[id]).slice(0,2)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{fullName(profiles[id])}</div>
                      <div className="text-xs text-muted-foreground truncate">Ausstehend…</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={async () => { await cancelRequest(id); await load(); }}>Zurückziehen</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">Kontakte</h3>
            <Card className="p-3">
              <div className="space-y-3">
                {loading && <div className="text-sm text-muted-foreground">Lädt…</div>}
                {!loading && accepted.length === 0 && (
                  <div className="text-sm text-muted-foreground">Noch keine Verbindungen.</div>
                )}
                {accepted.map((id) => (
                  <div key={`acc-${id}`} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={profiles[id]?.avatar_url ?? undefined} /><AvatarFallback>{fullName(profiles[id]).slice(0,2)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{fullName(profiles[id])}</div>
                      <div className="text-xs text-muted-foreground truncate">{profiles[id]?.headline || profiles[id]?.ort}</div>
                    </div>
                    <Button size="sm" onClick={() => navigate("/community/messages")}>Nachricht</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ConnectionsDrawer;
