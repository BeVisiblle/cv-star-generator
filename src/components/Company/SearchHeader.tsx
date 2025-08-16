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
  jobTitle: string;
  jobSearchType: string[];
}

interface SearchHeaderProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  resultsCount: number;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
}

export function SearchHeader({ filters, onFiltersChange, resultsCount, showAdvancedFilters, onToggleAdvancedFilters }: SearchHeaderProps) {
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

  const hasActiveFilters = filters.location || filters.industry || filters.targetGroup || filters.jobTitle || filters.jobSearchType.length > 0;

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Main Search Bar - LinkedIn Style */}
      <div className="bg-card border rounded-lg p-3 md:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Kandidaten..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-10 sm:h-12 text-sm sm:text-base border-0 shadow-none focus-visible:ring-1"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={showAdvancedFilters ? "default" : "outline"}
                size="sm" 
                className="h-10 sm:h-12 px-4 sm:px-6"
                onClick={onToggleAdvancedFilters}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" className="h-10 sm:h-12 px-4 sm:px-6">
                <Search className="h-4 w-4 mr-2" />
                <span className="sm:inline">Suchen</span>
              </Button>
            </div>
          </div>

        {/* Filter Pills */}
        {hasActiveFilters && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
            <span className="text-xs sm:text-sm text-muted-foreground">Aktive Filter:</span>
            <div className="flex flex-wrap items-center gap-2">
              {filters.location && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{filters.location}</span>
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
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{filters.industry}</span>
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
              {filters.jobTitle && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{filters.jobTitle}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => clearFilter('jobTitle')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.jobSearchType.length > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Search className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">
                    {filters.jobSearchType.length === 1 
                      ? filters.jobSearchType[0] 
                      : `${filters.jobSearchType.length} Sucharten`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => onFiltersChange({ ...filters, jobSearchType: [] })}
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
                  jobTitle: "",
                  jobSearchType: [],
                })}
                className="text-xs whitespace-nowrap"
              >
                Alle löschen
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs - LinkedIn Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <Tabs 
          value={filters.targetGroup || "alle"} 
          onValueChange={handleTabChange}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-2 sm:flex h-auto sm:h-10 bg-muted/50 w-full sm:w-auto p-1">
            <TabsTrigger value="alle" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Alle</span>
              <span className="xs:hidden">All</span>
            </TabsTrigger>
            <TabsTrigger value="azubi" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <span>Azubis</span>
            </TabsTrigger>
            <TabsTrigger value="schueler" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden xs:inline">Schüler:innen</span>
              <span className="xs:hidden">Schüler</span>
            </TabsTrigger>
            <TabsTrigger value="ausgelernt" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <span>Gesellen</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
          <span className="whitespace-nowrap">
            {resultsCount} {resultsCount === 1 ? 'Kandidat' : 'Kandidaten'} gefunden
          </span>
        </div>
      </div>
    </div>
  );
}