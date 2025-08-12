import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SearchAutosuggestCompany from "./SearchAutosuggestCompany";
import { useNavigate } from "react-router-dom";

const CompanyFeedSearch: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const onSelect = React.useCallback(
    (group: string, payload: { id: string; label: string }) => {
      switch (group) {
        case "candidates":
        case "followers":
          navigate(`/company/profile-view/${payload.id}`);
          break;
        case "companies":
          navigate(`/companies/${payload.id}`);
          break;
        case "posts":
        case "jobs":
          navigate(`/company/posts?query=${encodeURIComponent(query)}`);
          break;
        default:
          break;
      }
    },
    [navigate, query]
  );

  return (
    <div aria-label="Unternehmenssuche" className="w-full">
      <Card className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Suchen"
            placeholder="Suche in freigeschalteten Kandidaten, Unternehmen, Beiträgen, Jobs und Followern…"
            className="pl-9"
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              setOpen(v.trim().length > 1);
            }}
            onFocus={() => setOpen(query.trim().length > 1)}
            onBlur={() => {
              // kleine Verzögerung, damit Klicks auf Vorschläge registriert werden
              setTimeout(() => setOpen(false), 150);
            }}
          />

          {/* Vorschläge */}
          <div className="absolute left-0 right-0 z-30 mt-2">
            <SearchAutosuggestCompany
              query={query}
              open={open}
              onSelect={onSelect}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompanyFeedSearch;
