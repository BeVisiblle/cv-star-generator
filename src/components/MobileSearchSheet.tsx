import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, User2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MobileSearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
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

const MAX_PER_GROUP = 5;

export function MobileSearchSheet({ open, onOpenChange }: MobileSearchSheetProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<SuggestionPerson[]>([]);
  const [companies, setCompanies] = useState<SuggestionCompany[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQ = useDebouncedValue(query, 200);

  // Fetch suggestions when query changes
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!debouncedQ || debouncedQ.trim().length < 3) {
        setPeople([]);
        setCompanies([]);
        return;
      }
      setLoading(true);
      try {
        const q = debouncedQ.trim();
        const [peopleRes, companiesRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, vorname, nachname, avatar_url")
            .or(`vorname.ilike.%${q}%,nachname.ilike.%${q}%`)
            .limit(MAX_PER_GROUP),
          supabase
            .rpc('get_companies_public', { search: q, limit_count: MAX_PER_GROUP, offset_count: 0 }),
        ]);
        if (!active) return;
        setPeople(peopleRes.data || []);
        setCompanies((companiesRes.data as any) || []);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [debouncedQ]);

  const handleSelect = (type: 'person' | 'company', id: string) => {
    onOpenChange(false);
    setQuery("");
    if (type === 'person') {
      navigate(`/u/${id}`);
    } else if (type === 'company') {
      navigate(`/companies/${id}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(query)}`);
      onOpenChange(false);
      setQuery("");
    }
  };

  // Reset when sheet closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setPeople([]);
      setCompanies([]);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="top" 
        className="h-full w-full p-0 border-0"
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header mit Suchleiste */}
          <SheetHeader className="p-4 pb-3 border-b space-y-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 -m-2 hover:bg-muted/40 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
              
              <form onSubmit={handleSubmit} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Personen, Unternehmen suchen..."
                    className="pl-10 pr-4 h-11 bg-background border border-input focus-visible:ring-1"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          </SheetHeader>

          {/* Content - Suggestions */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {query.trim().length >= 3 && (people.length > 0 || companies.length > 0) ? (
                <Command shouldFilter={false} className="bg-background border-0 rounded-none">
                  <CommandList>
                    <CommandEmpty>{loading ? "Suche…" : "Keine Vorschläge"}</CommandEmpty>

                    {people.length > 0 && (
                      <CommandGroup heading="Personen">
                        {people.map((p) => {
                          const label = `${p.vorname ?? ""} ${p.nachname ?? ""}`.trim() || "Unbekannt";
                          return (
                            <CommandItem 
                              key={`p-${p.id}`} 
                              onSelect={() => handleSelect("person", p.id)}
                              className="flex items-center gap-3 px-3 py-3 cursor-pointer"
                            >
                              <User2 className="h-4 w-4 text-muted-foreground shrink-0" />
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={p.avatar_url ?? undefined} alt={label} />
                                <AvatarFallback className="text-xs">{label.slice(0,2).toUpperCase()}</AvatarFallback>
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
                          <CommandItem 
                            key={`c-${c.id}`} 
                            onSelect={() => handleSelect("company", c.id)}
                            className="flex items-center gap-3 px-3 py-3 cursor-pointer"
                          >
                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={c.logo_url ?? undefined} alt={(c as any).name} />
                              <AvatarFallback className="text-xs">{((c as any).name || "U").slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{(c as any).name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              ) : query.trim().length >= 3 && !loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Keine Ergebnisse gefunden</p>
                </div>
              ) : query.trim().length > 0 && query.trim().length < 3 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Mindestens 3 Zeichen eingeben</p>
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
