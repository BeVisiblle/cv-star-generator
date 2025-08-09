import React from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, FileText, User2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface SuggestionPerson {
  id: string;
  vorname?: string | null;
  nachname?: string | null;
  avatar_url?: string | null;
}

interface SuggestionCompany {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface SuggestionPost {
  id: string;
  content: string;
}

export type SuggestionType = "person" | "company" | "post";

export interface SearchAutosuggestProps {
  query: string;
  onSelect: (type: SuggestionType, payload: { id: string; label: string }) => void;
  open: boolean;
}

const MAX_PER_GROUP = 5;

export default function SearchAutosuggest({ query, onSelect, open }: SearchAutosuggestProps) {
  const [loading, setLoading] = React.useState(false);
  const [people, setPeople] = React.useState<SuggestionPerson[]>([]);
  const [companies, setCompanies] = React.useState<SuggestionCompany[]>([]);
  const [posts, setPosts] = React.useState<SuggestionPost[]>([]);

  const debouncedQ = useDebouncedValue(query, 200);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      if (!open || !debouncedQ || debouncedQ.trim().length < 2) {
        setPeople([]); setCompanies([]); setPosts([]); return;
      }
      setLoading(true);
      try {
        const q = debouncedQ.trim();
        const [peopleRes, companiesRes, postsRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, vorname, nachname, avatar_url")
            .or(`vorname.ilike.%${q}%,nachname.ilike.%${q}%`)
            .limit(MAX_PER_GROUP),
          supabase
            .rpc('get_companies_public', { search: q, limit_count: MAX_PER_GROUP, offset_count: 0 }),
          supabase
            .from("company_posts")
            .select("id, content")
            .ilike("content", `%${q}%`)
            .limit(MAX_PER_GROUP),
        ]);
        if (!active) return;
        setPeople(peopleRes.data || []);
        setCompanies((companiesRes.data as any) || []);
        setPosts((postsRes.data as any) || []);
      } catch (e) {
        // ignore errors for autosuggest
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [debouncedQ, open]);

  if (!open) return null;

  return (
    <Card className="absolute z-50 mt-2 w-full overflow-hidden p-0 shadow-lg">
      <Command shouldFilter={false} className="bg-background">
        <CommandList>
          <CommandEmpty>{loading ? "Suche…" : "Keine Vorschläge"}</CommandEmpty>

          {people.length > 0 && (
            <CommandGroup heading="Personen">
              {people.map((p) => {
                const label = `${p.vorname ?? ""} ${p.nachname ?? ""}`.trim() || "Unbekannt";
                return (
                  <CommandItem key={`p-${p.id}`} onSelect={() => onSelect("person", { id: p.id, label })}>
                    <User2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={p.avatar_url ?? undefined} alt={label} />
                      <AvatarFallback>{label.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {companies.length > 0 && (
            <CommandGroup heading="Unternehmen">
              {companies.map((c) => (
                <CommandItem key={`c-${c.id}`} onSelect={() => onSelect("company", { id: c.id, label: (c as any).name })}>
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={c.logo_url ?? undefined} alt={(c as any).name} />
                    <AvatarFallback>{((c as any).name || "U").slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{(c as any).name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {posts.length > 0 && (
            <CommandGroup heading="Beiträge">
              {posts.map((post) => (
                <CommandItem key={`post-${post.id}`} onSelect={() => onSelect("post", { id: post.id, label: post.content.slice(0, 50) })}>
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{post.content}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </Card>
  );
}
