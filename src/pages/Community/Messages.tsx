import React from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMessaging } from "@/hooks/useMessaging";
import QuickMessageDialog from "@/components/community/QuickMessageDialog";

export default function CommunityMessages() {
  const { user } = useAuth();
  const { loadConversationsWithLast } = useMessaging();
  const [query, setQuery] = React.useState("");
  const [showAll, setShowAll] = React.useState(false);
  const [openCompose, setOpenCompose] = React.useState(false);
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await loadConversationsWithLast();
      if (!mounted) return;
      setItems(data);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [loadConversationsWithLast]);

  const filtered = React.useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return items;
    return items.filter((c) => {
      const name = [c.otherUser?.vorname, c.otherUser?.nachname].filter(Boolean).join(" ").toLowerCase();
      const content = c.lastMessage?.content?.toLowerCase() || "";
      return name.includes(t) || content.includes(t);
    });
  }, [items, query]);

  const recent = filtered.slice(0, 4);
  const rest = filtered.slice(4);

  return (
    <main className="w-full py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Nachrichten</h1>
        <Button onClick={() => setOpenCompose(true)}>Neue Nachricht</Button>
      </div>

      <div className="flex items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nachrichten oder Kontakte durchsuchen…"
          aria-label="Nachrichten suchen"
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Neueste Nachrichten</h2>
        <Card className="p-3">
          <div className="space-y-3">
            {(loading ? [] : recent).map((c) => {
              const name = [c.otherUser?.vorname, c.otherUser?.nachname].filter(Boolean).join(" ") || "Unbekannt";
              return (
                <div key={c.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.otherUser?.avatar_url ?? undefined} alt={name} />
                    <AvatarFallback>{name.slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.lastMessage?.content || "—"}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setOpenCompose(true)}>Antworten</Button>
                </div>
              );
            })}
            {loading && <div className="text-sm text-muted-foreground">Lade…</div>}
            {!loading && recent.length === 0 && (
              <div className="text-sm text-muted-foreground">Keine Nachrichten vorhanden.</div>
            )}
          </div>
        </Card>
        {rest.length > 0 && (
          <div className="pt-1">
            <Button variant="link" size="sm" className="px-0" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Weniger anzeigen" : "Mehr anzeigen"}
            </Button>
          </div>
        )}
      </section>

      {showAll && rest.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Weitere Nachrichten</h2>
          <Card className="p-3">
            <div className="space-y-3">
              {rest.map((c) => {
                const name = [c.otherUser?.vorname, c.otherUser?.nachname].filter(Boolean).join(" ") || "Unbekannt";
                return (
                  <div key={c.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c.otherUser?.avatar_url ?? undefined} alt={name} />
                      <AvatarFallback>{name.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.lastMessage?.content || "—"}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setOpenCompose(true)}>Antworten</Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      <QuickMessageDialog open={openCompose} onOpenChange={setOpenCompose} />
    </main>
  );
}

