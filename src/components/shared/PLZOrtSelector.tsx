import React, { useState, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLazyPostalCodes } from '@/hooks/useLazyPostalCodes';
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
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { postalCodes, loading, error, findLocationByPLZ } = useLazyPostalCodes(searchValue);

  const showMinimumCharsMessage = searchValue.length > 0 && searchValue.length < 3;

  // Auto-lookup PLZ when typed
  useEffect(() => {
    if (plz && plz.length === 5) {
      const location = findLocationByPLZ(plz);
      if (location && location.ort !== ort) {
        onPLZChange(plz, location.ort);
      }
    }
  }, [plz, findLocationByPLZ, ort, onPLZChange]);

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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {plz || "PLZ wählen..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Mindestens 3 Ziffern eingeben..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                {showMinimumCharsMessage ? (
                  <CommandEmpty>Bitte mindestens 3 Ziffern eingeben</CommandEmpty>
                ) : loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>Keine PLZ gefunden.</CommandEmpty>
                    <CommandGroup>
                      {postalCodes.map((postal) => (
                        <CommandItem
                          key={postal.id}
                          value={postal.plz}
                          onSelect={() => handlePLZSelect(postal.plz)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              plz === postal.plz ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {postal.plz} - {postal.ort}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          className="mt-2"
          value={plz}
          onChange={(e) => onPLZChange(e.target.value, ort)}
          placeholder="Oder PLZ direkt eingeben"
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
          readOnly={plz && plz.length === 5 && findLocationByPLZ(plz) !== undefined}
        />
      </div>
    </div>
  );
};