import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileSearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const recentSearches = [
  "JavaScript Developer",
  "Marketing Manager",
  "Berlin Startup"
];

const trendingTopics = [
  "Remote Jobs",
  "KI & Machine Learning",
  "Product Management",
  "Startup Culture"
];

export function MobileSearchSheet({ open, onOpenChange }: MobileSearchSheetProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (searchTerm?: string) => {
    const finalQuery = searchTerm || query;
    if (finalQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(finalQuery)}`);
      onOpenChange(false);
      setQuery("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="top" 
        className="h-full w-full p-0 border-0"
      >
        <div className="flex flex-col h-full">
          {/* Header mit Suchleiste */}
          <SheetHeader className="p-4 pb-3 border-b space-y-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 -m-2 hover:bg-muted/40 rounded-xl transition-colors"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
              
              <form onSubmit={handleSubmit} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Personen, Jobs oder Unternehmen suchen..."
                    className="pl-10 pr-4 h-11 bg-muted/40 border-0 focus-visible:ring-1"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Recent Searches */}
              {!query && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Letzte Suchen</span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSearch(search)}
                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
                      >
                        <span className="text-sm">{search}</span>
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Topics */}
              {!query && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Trending</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleSearch(topic)}
                        className="px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted transition-colors text-sm"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
