import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePostalCodes } from '@/hooks/usePostalCodes';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PLZOrtSelectorProps {
  plz: string;
  ort: string;
  onPLZChange: (plz: string, ort: string) => void;
  onOrtChange: (ort: string) => void;
  required?: boolean;
  plzLabel?: string;
  ortLabel?: string;
  className?: string;
}

export const PLZOrtSelector = ({
  plz,
  ort,
  onPLZChange,
  onOrtChange,
  required = false,
  plzLabel = 'PLZ',
  ortLabel = 'Ort',
  className = ''
}: PLZOrtSelectorProps) => {
  const { postalCodes, loading, error, findLocationByPLZ } = usePostalCodes();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const filteredPostalCodes = useMemo(() => {
    if (!searchValue) return postalCodes.slice(0, 100); // Limit to first 100 for performance
    return postalCodes.filter(postal => 
      postal.plz.startsWith(searchValue) || 
      postal.ort.toLowerCase().includes(searchValue.toLowerCase())
    ).slice(0, 50); // Limit filtered results
  }, [postalCodes, searchValue]);

  const handlePLZSelect = (selectedPLZ: string) => {
    const location = findLocationByPLZ(selectedPLZ);
    if (location) {
      onPLZChange(selectedPLZ, location.ort);
      setOpen(false);
      setSearchValue('');
    }
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-3 gap-4 ${className}`}>
        <div>
          <Label>{plzLabel}{required && ' *'}</Label>
          <div className="flex items-center justify-center h-10 border rounded-md">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
        <div className="col-span-2">
          <Label>{ortLabel}{required && ' *'}</Label>
          <div className="flex items-center justify-center h-10 border rounded-md">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`grid grid-cols-3 gap-4 ${className}`}>
        <div>
          <Label>{plzLabel}{required && ' *'}</Label>
          <Input
            value={plz}
            onChange={(e) => onPLZChange(e.target.value, ort)}
            placeholder="12345"
          />
        </div>
        <div className="col-span-2">
          <Label>{ortLabel}{required && ' *'}</Label>
          <Input
            value={ort}
            onChange={(e) => onPLZChange(plz, e.target.value)}
            placeholder="Berlin"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <div>
        <Label htmlFor="plz">{plzLabel}{required && ' *'}</Label>
        <Input
          id="plz"
          value={plz}
          onChange={(e) => onPLZChange(e.target.value, '')}
          placeholder="PLZ eingeben"
          maxLength={5}
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor="ort">{ortLabel}{required && ' *'}</Label>
        <Input
          id="ort"
          value={ort}
          onChange={(e) => onOrtChange(e.target.value)}
          placeholder="Ort eingeben"
        />
      </div>
    </div>
  );
};