import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X, MapPin, Building2, Briefcase, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface JobSearchFilters {
  keywords: string;
  category: string;
  location: string;
  workMode: string;
  employment: string;
}

interface JobSearchHeaderProps {
  filters: JobSearchFilters;
  onFiltersChange: (filters: JobSearchFilters) => void;
  resultsCount: number;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
}

export function JobSearchHeader({ 
  filters, 
  onFiltersChange, 
  resultsCount, 
  showAdvancedFilters, 
  onToggleAdvancedFilters 
}: JobSearchHeaderProps) {
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
      category: value === "alle" ? "" : value 
    });
  };

  const clearFilter = (filterKey: keyof JobSearchFilters) => {
    onFiltersChange({ ...filters, [filterKey]: "" });
  };

  const hasActiveFilters = filters.location || filters.category || filters.workMode || filters.employment;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'azubi':
        return 'Ausbildung';
      case 'fachkraft':
        return 'Fachkraft';
      case 'praktikum':
        return 'Praktikum';
      default:
        return category;
    }
  };

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Main Search Bar */}
      <div className="bg-card border rounded-lg p-3 md:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Jobs..."
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
              {filters.workMode && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{filters.workMode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => clearFilter('workMode')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.employment && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Briefcase className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{filters.employment}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => clearFilter('employment')}
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
                  category: "",
                  location: "",
                  workMode: "",
                  employment: "",
                })}
                className="text-xs whitespace-nowrap"
              >
                Alle löschen
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <Tabs 
          value={filters.category || "alle"} 
          onValueChange={handleTabChange}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-2 sm:flex h-auto sm:h-10 bg-muted/50 w-full sm:w-auto p-1">
            <TabsTrigger value="alle" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Alle Jobs</span>
              <span className="xs:hidden">Alle</span>
            </TabsTrigger>
            <TabsTrigger value="azubi" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <span>Ausbildung</span>
            </TabsTrigger>
            <TabsTrigger value="praktikum" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <span>Praktikum</span>
            </TabsTrigger>
            <TabsTrigger value="fachkraft" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <span>Fachkraft</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
          <span className="whitespace-nowrap">
            {resultsCount} {resultsCount === 1 ? 'Job' : 'Jobs'} gefunden
          </span>
        </div>
      </div>
    </div>
  );
}