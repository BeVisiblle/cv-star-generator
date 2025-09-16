import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { JobsSearchFilters } from '@/lib/api/jobsSearch';

interface JobFiltersProps {
  filters: JobsSearchFilters;
  onFiltersChange: (filters: JobsSearchFilters) => void;
  hasLocation?: boolean;
}

const TRACK_OPTIONS = [
  { value: '', label: 'Alle Bereiche' },
  { value: 'ausbildung', label: 'Ausbildung' },
  { value: 'praktikum', label: 'Praktikum' },
  { value: 'werkstudent', label: 'Werkstudent' },
  { value: 'vollzeit', label: 'Vollzeit' }
];

const CONTRACT_OPTIONS = [
  { value: '', label: 'Alle Verträge' },
  { value: 'vollzeit', label: 'Vollzeit' },
  { value: 'teilzeit', label: 'Teilzeit' },
  { value: 'minijob', label: 'Minijob' }
];

const BENEFIT_OPTIONS = [
  'Homeoffice', 'Weiterbildung', 'Firmenwagen', 'Flexible Arbeitszeiten',
  'Betriebliche Altersvorsorge', 'Gesundheitsförderung', 'Urlaubsgeld',
  'Weihnachtsgeld', 'Jobrad', 'Fitnessstudio'
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
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray);
  };

  const clearFilters = () => {
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

  const activeFiltersCount = [
    filters.track,
    filters.remote_only,
    ...(filters.benefits_any || []),
    ...(filters.shifts_any || []),
    ...(filters.contract_types || [])
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-medium">Filter</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Zurücksetzen
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Weniger' : 'Mehr'} Filter
          </Button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="track">Bereich</Label>
          <Select value={filters.track || ''} onValueChange={(value) => updateFilter('track', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Bereich wählen" />
            </SelectTrigger>
            <SelectContent>
              {TRACK_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="order_by">Sortierung</Label>
          <Select value={filters.order_by || 'newest'} onValueChange={(value: 'newest' | 'nearest') => updateFilter('order_by', value)}>
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
            <Label htmlFor="radius">Umkreis (km)</Label>
            <Input
              id="radius"
              type="number"
              min="1"
              max="100"
              value={filters.radius_km || 25}
              onChange={(e) => updateFilter('radius_km', parseInt(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* Remote Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remote"
          checked={filters.remote_only || false}
          onCheckedChange={(checked) => updateFilter('remote_only', !!checked)}
        />
        <Label htmlFor="remote">Nur Remote-Jobs</Label>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t">
          {/* Benefits */}
          <div>
            <Label>Benefits</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {BENEFIT_OPTIONS.map(benefit => (
                <Badge
                  key={benefit}
                  variant={filters.benefits_any?.includes(benefit) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('benefits_any', benefit)}
                >
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>

          {/* Shifts */}
          <div>
            <Label>Arbeitszeiten</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SHIFT_OPTIONS.map(shift => (
                <Badge
                  key={shift}
                  variant={filters.shifts_any?.includes(shift) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('shifts_any', shift)}
                >
                  {shift}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contract Types */}
          <div>
            <Label>Vertragsarten</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CONTRACT_OPTIONS.slice(1).map(contract => (
                <Badge
                  key={contract.value}
                  variant={filters.contract_types?.includes(contract.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('contract_types', contract.value)}
                >
                  {contract.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
