import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConnections } from "@/hooks/useConnections";
import { useNavigate } from "react-router-dom";
import { CompanyRecommendations } from "@/components/linkedin/right-rail/CompanyRecommendations";

interface BasicProfile {
  id: string; vorname: string | null; nachname: string | null; avatar_url: string | null;
  headline: string | null; ort: string | null; branche: string | null;
}

export default function Contacts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { acceptRequest, declineRequest, cancelRequest } = useConnections();

  const [incoming, setIncoming] = React.useState<string[]>([]);
  const [outgoing, setOutgoing] = React.useState<string[]>([]);
  const [friends, setFriends] = React.useState<string[]>([]);
  const [profiles, setProfiles] = React.useState<Record<string, BasicProfile>>({});
  const [loading, setLoading] = React.useState(true);

  

  const fullName = (p?: BasicProfile) => [p?.vorname, p?.nachname].filter(Boolean).join(" ") || "Unbekannt";

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [inc, out, acc] = await Promise.all([
        supabase.from("connections").select("requester_id").eq("addressee_id", user.id).eq("status", "pending"),
        supabase.from("connections").select("addressee_id").eq("requester_id", user.id).eq("status", "pending"),
        supabase.from("connections").select("requester_id,addressee_id").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).eq("status", "accepted"),
      ]);
      const incIds = (inc.data || []).map(r => (r as any).requester_id as string);
      const outIds = (out.data || []).map(r => (r as any).addressee_id as string);
      const friendIds = (acc.data || []).map(r => ((r as any).requester_id === user.id ? (r as any).addressee_id : (r as any).requester_id) as string);
      setIncoming(incIds);
      setOutgoing(outIds);
      setFriends(friendIds);

      const ids = Array.from(new Set([...incIds, ...outIds, ...friendIds]));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, vorname, nachname, avatar_url, headline, ort, branche")
          .in("id", ids);
        const map: Record<string, BasicProfile> = {};
        (profs || []).forEach((p: any) => { map[p.id] = p; });
        setProfiles(map);
      } else {
        setProfiles({});
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <main className="w-full py-6">
      <h1 className="text-xl font-semibold mb-4">Meine Freunde</h1>

      {/* Pending Requests */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">Ausstehende Anfragen</h2>
        <Card className="p-3">
          <div className="space-y-3">
            {loading && <div className="text-sm text-muted-foreground">Lädt…</div>}
            {!loading && incoming.length === 0 && outgoing.length === 0 && (
              <div className="text-sm text-muted-foreground">Keine ausstehenden Anfragen.</div>
            )}
            {incoming.map((id) => (
              <div key={`inc-${id}`} className="flex items-center gap-3">
                <Avatar className="h-9 w-9"><AvatarImage src={profiles[id]?.avatar_url ?? undefined} /><AvatarFallback>{fullName(profiles[id]).slice(0,2)}</AvatarFallback></Avatar>
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
                <Avatar className="h-9 w-9"><AvatarImage src={profiles[id]?.avatar_url ?? undefined} /><AvatarFallback>{fullName(profiles[id]).slice(0,2)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{fullName(profiles[id])}</div>
                  <div className="text-xs text-muted-foreground truncate">Anfrage gesendet…</div>
                </div>
                <Button size="sm" variant="ghost" onClick={async () => { await cancelRequest(id); await load(); }}>Zurückziehen</Button>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Friends list */}
      <section>
        <h2 className="text-sm font-semibold mb-2">Freunde</h2>
        <Card className="p-3">
          <div className="space-y-3">
            {loading && <div className="text-sm text-muted-foreground">Lädt…</div>}
            {!loading && friends.length === 0 && (
              <div className="text-sm text-muted-foreground">Noch keine Verbindungen.</div>
            )}
            {friends.map((id) => (
              <div key={`fr-${id}`} className="flex items-center gap-3">
                <Avatar className="h-9 w-9"><AvatarImage src={profiles[id]?.avatar_url ?? undefined} /><AvatarFallback>{fullName(profiles[id]).slice(0,2)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{fullName(profiles[id])}</div>
                  <div className="text-xs text-muted-foreground truncate">{profiles[id]?.headline || [profiles[id]?.ort, profiles[id]?.branche].filter(Boolean).join(" • ")}</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/u/${id}`)}>Profil</Button>
                <Button size="sm" onClick={() => navigate("/community/messages")}>Nachricht</Button>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Company Recommendations */}
      <section>
        <CompanyRecommendations limit={3} showMore={true} showMoreLink="/entdecken/unternehmen" />
      </section>

    </main>
  );
}
