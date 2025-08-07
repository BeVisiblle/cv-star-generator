import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X, MapPin, Building2, Users, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchFilters {
  keywords: string;
  targetGroup: string;
  location: string;
  radius: number;
  industry: string;
  availability: string;
}

interface SearchHeaderProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  resultsCount: number;
}

export function SearchHeader({ filters, onFiltersChange, resultsCount }: SearchHeaderProps) {
  const [searchValue, setSearchValue] = useState(filters.keywords);
  
  const debouncedSearch = useDebounce((value: string) => {
    onFiltersChange({ ...filters, keywords: value });
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleTabChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      targetGroup: value === "alle" ? "" : value 
    });
  };

  const clearFilter = (filterKey: keyof SearchFilters) => {
    onFiltersChange({ ...filters, [filterKey]: "" });
  };

  const hasActiveFilters = filters.location || filters.industry || filters.targetGroup;

  return (
    <div className="space-y-4">
      {/* Main Search Bar - LinkedIn Style */}
      <div className="bg-card border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Kandidaten, Fähigkeiten, Ort..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-12 text-base border-0 shadow-none focus-visible:ring-1"
            />
          </div>
          <Button size="lg" className="h-12 px-6">
            <Search className="h-4 w-4 mr-2" />
            Suchen
          </Button>
        </div>

        {/* Filter Pills */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Aktive Filter:</span>
            {filters.location && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {filters.location}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => clearFilter('location')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.industry && (
              <Badge variant="secondary" className="gap-1">
                <Building2 className="h-3 w-3" />
                {filters.industry}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => clearFilter('industry')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({
                keywords: filters.keywords,
                targetGroup: "",
                location: "",
                radius: 50,
                industry: "",
                availability: "",
              })}
              className="text-xs"
            >
              Alle Filter löschen
            </Button>
          </div>
        )}
      </div>

      {/* Category Tabs - LinkedIn Style */}
      <div className="flex items-center justify-between">
        <Tabs 
          value={filters.targetGroup || "alle"} 
          onValueChange={handleTabChange}
          className="w-auto"
        >
          <TabsList className="h-10 bg-muted/50">
            <TabsTrigger value="alle" className="gap-2">
              <Users className="h-4 w-4" />
              Alle Kandidaten
            </TabsTrigger>
            <TabsTrigger value="azubi" className="gap-2">
              Azubis
            </TabsTrigger>
            <TabsTrigger value="schueler" className="gap-2">
              Schüler:innen
            </TabsTrigger>
            <TabsTrigger value="ausgelernt" className="gap-2">
              Gesellen
            </TabsTrigger>
            <TabsTrigger value="filter" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Alle Filter
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="text-sm text-muted-foreground">
          {resultsCount} {resultsCount === 1 ? 'Kandidat' : 'Kandidaten'} gefunden
        </div>
      </div>
    </div>
  );
}