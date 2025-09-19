import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { JobsSearchFilters } from '@/lib/api/jobsSearch';

interface JobFiltersProps {
  filters: JobsSearchFilters;
  onFiltersChange: (filters: JobsSearchFilters) => void;
  hasLocation?: boolean;
}

const TRACK_OPTIONS = [
  'Kaufmännisch',
  'Handwerk',
  'IT & Technik',
  'Gesundheit & Soziales',
  'Gastronomie & Tourismus',
  'Verkauf & Service'
];

const BENEFIT_OPTIONS = [
  'Betriebliche Altersvorsorge',
  'Flexible Arbeitszeiten',
  'Homeoffice möglich',
  'Firmenwagen',
  'Weiterbildungsmöglichkeiten',
  'Gesundheitsförderung'
];

const CONTRACT_TYPE_OPTIONS = [
  'Vollzeit',
  'Teilzeit',
  'Minijob',
  'Ausbildung',
  'Praktikum'
];

const SHIFT_OPTIONS = [
  'Frühschicht', 'Spätschicht', 'Nachtschicht', 'Wochenendarbeit'
];

export function JobFilters({ filters, onFiltersChange, hasLocation = false }: JobFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof JobsSearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: 'benefits_any' | 'shifts_any' | 'contract_types', value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      track: '',
      remote_only: false,
      benefits_any: [],
      shifts_any: [],
      contract_types: [],
      radius_km: 25,
      order_by: 'newest'
    });
  };

  const activeFilterCount = [
    filters.track,
    filters.remote_only,
    ...(filters.benefits_any || []),
    ...(filters.shifts_any || []),
    ...(filters.contract_types || [])
  ].filter(Boolean).length;

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Bereich</label>
          <Select value={filters.track || ''} onValueChange={(value) => updateFilter('track', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Alle Bereiche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Bereiche</SelectItem>
              {TRACK_OPTIONS.map(track => (
                <SelectItem key={track} value={track}>{track}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sortierung</label>
          <Select value={filters.order_by || 'newest'} onValueChange={(value) => updateFilter('order_by', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
              <SelectItem value="nearest">Nächste zuerst</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasLocation && (
          <div>
            <label className="block text-sm font-medium mb-2">Umkreis (km)</label>
            <Input
              type="number"
              value={filters.radius_km || 25}
              onChange={(e) => updateFilter('radius_km', parseInt(e.target.value) || 25)}
              min="5"
              max="100"
              step="5"
            />
          </div>
        )}
      </div>

      {/* Remote Work */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remote"
          checked={filters.remote_only || false}
          onCheckedChange={(checked) => updateFilter('remote_only', checked)}
        />
        <label htmlFor="remote" className="text-sm font-medium">
          Nur Remote-Jobs anzeigen
        </label>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Erweiterte Filter
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-1" />
              Filter zurücksetzen
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4 mt-4">
          {/* Contract Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Anstellungsart</label>
            <div className="flex flex-wrap gap-2">
              {CONTRACT_TYPE_OPTIONS.map(type => (
                <Button
                  key={type}
                  variant={filters.contract_types?.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayFilter('contract_types', type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium mb-2">Benefits</label>
            <div className="flex flex-wrap gap-2">
              {BENEFIT_OPTIONS.map(benefit => (
                <Button
                  key={benefit}
                  variant={filters.benefits_any?.includes(benefit) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayFilter('benefits_any', benefit)}
                >
                  {benefit}
                </Button>
              ))}
            </div>
          </div>

          {/* Shifts */}
          <div>
            <label className="block text-sm font-medium mb-2">Arbeitszeiten</label>
            <div className="flex flex-wrap gap-2">
              {SHIFT_OPTIONS.map(shift => (
                <Button
                  key={shift}
                  variant={filters.shifts_any?.includes(shift) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayFilter('shifts_any', shift)}
                >
                  {shift}
                </Button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {filters.track && (
            <Badge variant="secondary">
              Bereich: {filters.track}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('track', '')}
              />
            </Badge>
          )}
          
          {filters.remote_only && (
            <Badge variant="secondary">
              Remote
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('remote_only', false)}
              />
            </Badge>
          )}

          {filters.benefits_any?.map(benefit => (
            <Badge key={benefit} variant="secondary">
              {benefit}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => toggleArrayFilter('benefits_any', benefit)}
              />
            </Badge>
          ))}

          {filters.contract_types?.map(type => (
            <Badge key={type} variant="secondary">
              {type}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => toggleArrayFilter('contract_types', type)}
              />
            </Badge>
          ))}

          {filters.shifts_any?.map(shift => (
            <Badge key={shift} variant="secondary">
              {shift}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => toggleArrayFilter('shifts_any', shift)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}