import React from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";

const HeaderSearchMobile: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = () => {
    const term = q.trim();
    const sp = new URLSearchParams(location.search);
    if (term) sp.set("q", term); else sp.delete("q");
    navigate(`/marketplace?${sp.toString()}`);
    setOpen(false);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative sm:hidden">
      {!open && (
        <button
          className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Suche öffnen"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      )}

      {open && (
        <div className="absolute inset-x-0 -top-2 translate-y-[-100%]" />
      )}

      {open && (
        <div className="absolute left-0 right-0 top-[-10px] h-[56px] z-50 animate-fade-in">
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 h-14 px-2 -mx-2">
            <button
              className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Suche schließen"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Suche Personen, Beiträge und Gruppen…"
                aria-label="Globale Suche"
                className="pl-10 h-10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSearchMobile;
