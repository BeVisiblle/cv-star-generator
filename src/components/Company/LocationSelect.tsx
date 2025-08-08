import React, { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationRow {
  id: number; // locations.id is bigserial
  postal_code: string;
  city: string;
  state: string | null;
  country_code: string;
}

export interface LocationSelectValue {
  id: number;
  label: string;
}

interface LocationSelectProps {
  label?: string;
  placeholder?: string;
  value?: LocationSelectValue | null;
  onChange: (value: LocationSelectValue | null) => void;
  className?: string;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  label = "Standort",
  placeholder = "Stadt oder PLZ suchen...",
  value,
  onChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<LocationRow[]>([]);

  useEffect(() => {
    let active = true;
    const fetchLocations = async () => {
      setLoading(true);
      try {
        let query = supabase.from("locations").select("id, postal_code, city, state, country_code");
        if (search.trim().length >= 2) {
          // naive search by postal_code prefix or city ilike
          query = query.or(
            `postal_code.ilike.%${search}%,city.ilike.%${search}%`
          );
        }
        const { data, error } = await query.limit(50);
        if (!active) return;
        if (error) throw error;
        setRows((data as any) || []);
      } catch (e) {
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLocations();
    return () => {
      active = false;
    };
  }, [search]);

  const labelText = value?.label || "Standort wählen...";

  const handleSelect = (row: LocationRow) => {
    const label = `${row.postal_code} ${row.city}${row.state ? ", " + row.state : ""}`;
    onChange({ id: row.id, label });
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{labelText}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{loading ? "Suche..." : "Kein Standort gefunden."}</CommandEmpty>
              <CommandGroup>
                {rows.map((row) => {
                  const rowLabel = `${row.postal_code} ${row.city}${row.state ? ", " + row.state : ""}`;
                  return (
                    <CommandItem key={row.id} value={rowLabel} onSelect={() => handleSelect(row)}>
                      <Check className={cn("mr-2 h-4 w-4", value?.id === row.id ? "opacity-100" : "opacity-0")} />
                      {rowLabel}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Direct input for quick manual fallback */}
      <Input
        placeholder="Oder Standort eingeben"
        value={value?.label || ""}
        onChange={(e) => onChange(e.target.value ? { id: value?.id ?? 0, label: e.target.value } : null)}
      />
    </div>
  );
};

export default LocationSelect;
