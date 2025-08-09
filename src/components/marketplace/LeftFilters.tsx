
import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Hash, Layers } from "lucide-react";

export type ItemType = "all" | "occupation" | "post" | "group";
export type Visibility = "All" | "CommunityOnly" | "CommunityAndCompanies";

export interface LeftFiltersState {
  type: ItemType;
  location: string;
  tags: string[];
  companies: string[]; // company names for demo
  category: string | ""; // maps to tags for now
}

interface LeftFiltersProps {
  state: LeftFiltersState;
  onChange: (patch: Partial<LeftFiltersState>) => void;
  availableCompanies?: { id: string; name: string }[];
  availableTags?: string[];
  availableCategories?: { slug: string; label: string }[];
}

export function LeftFilters({ state, onChange, availableCompanies = [], availableTags = [], availableCategories = [] }: LeftFiltersProps) {
  const toggleFromArray = (key: keyof LeftFiltersState, value: string) => {
    const arr = new Set((state[key] as string[]) || []);
    arr.has(value) ? arr.delete(value) : arr.add(value);
    onChange({ [key]: Array.from(arr) } as Partial<LeftFiltersState>);
  };

  const setType = (t: ItemType) => onChange({ type: t });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="font-medium mb-2 flex items-center gap-2"><Layers className="h-4 w-4" /> Type</div>
        <div className="flex flex-wrap gap-2">
          {(["all", "occupation", "post", "group"] as ItemType[]).map((t) => (
            <Badge
              key={t}
              variant={state.type === t ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setType(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="font-medium mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</div>
        <Input
          value={state.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="City"
        />
      </Card>

      <Card className="p-4">
        <div className="font-medium mb-2 flex items-center gap-2"><Hash className="h-4 w-4" /> Tags</div>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((t) => (
            <Badge
              key={t}
              variant={state.tags.includes(t) ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => toggleFromArray("tags", t)}
            >
              #{t}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="font-medium mb-2 flex items-center gap-2"><Building2 className="h-4 w-4" /> Companies</div>
        <div className="flex flex-col gap-2">
          {availableCompanies.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.companies.includes(c.name)}
                onChange={() => toggleFromArray("companies", c.name)}
                className="accent-primary"
              />
              <span className="truncate">{c.name}</span>
            </label>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => onChange({ companies: [] })}>Clear</Button>
      </Card>

      <Card className="p-4">
        <div className="font-medium mb-2">Category</div>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((cat) => (
            <Badge
              key={cat.slug}
              variant={state.category === cat.slug ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => onChange({ category: state.category === cat.slug ? "" : cat.slug })}
            >
              {cat.label}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default LeftFilters;
