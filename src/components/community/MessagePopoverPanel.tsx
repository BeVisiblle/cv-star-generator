import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMessaging } from "@/hooks/useMessaging";
import { useNavigate } from "react-router-dom";

const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: sameYear ? "short" : "2-digit" });
};

interface MessagePopoverPanelProps {
  onCompose: () => void;
}

export const MessagePopoverPanel: React.FC<MessagePopoverPanelProps> = ({ onCompose }) => {
  const navigate = useNavigate();
  const { loadConversationsWithLast } = useMessaging();

  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<any[]>([]);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await loadConversationsWithLast();
      if (!mounted) return;
      setItems((data || []).slice(0, 4));
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

  return (
    <div className="w-[420px] max-w-[90vw]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="text-sm font-medium">Nachrichten</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onCompose}>Neue Nachricht</Button>
          <Button size="sm" variant="ghost" onClick={() => navigate('/community/messages')}>Alle öffnen</Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nachrichten durchsuchen" aria-label="Nachrichten durchsuchen" />
      </div>

      {/* List */}
      <div className="max-h-[60vh] overflow-auto p-2">
        {loading && (
          <div className="space-y-3 p-2 text-sm text-muted-foreground">Lade…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-3 text-sm text-muted-foreground">Keine Nachrichten gefunden.</div>
        )}
        {!loading && filtered.map((c) => {
          const name = [c.otherUser?.vorname, c.otherUser?.nachname].filter(Boolean).join(" ") || "Unbekannt";
          return (
            <button key={c.id} className="w-full text-left px-2 py-2 rounded-lg hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-start gap-3" onClick={() => navigate('/community/messages')}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={c.otherUser?.avatar_url ?? undefined} alt={name} />
                <AvatarFallback>{name.slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium truncate flex-1">{name}</div>
                  <div className="text-[11px] text-muted-foreground">{formatDate(c.lastMessageAt)}</div>
                </div>
                <div className="text-xs text-muted-foreground truncate">{c.lastMessage?.content || '—'}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MessagePopoverPanel;
