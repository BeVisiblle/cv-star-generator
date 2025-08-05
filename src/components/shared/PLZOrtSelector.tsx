import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { usePostalCodes } from '@/hooks/usePostalCodes';
import { Loader2 } from 'lucide-react';

interface PLZOrtSelectorProps {
  plz: string;
  ort: string;
  onPLZChange: (plz: string, ort: string) => void;
  required?: boolean;
  plzLabel?: string;
  ortLabel?: string;
  className?: string;
}

export const PLZOrtSelector = ({
  plz,
  ort,
  onPLZChange,
  required = false,
  plzLabel = 'PLZ',
  ortLabel = 'Ort',
  className = ''
}: PLZOrtSelectorProps) => {
  const { postalCodes, loading, error, findLocationByPLZ } = usePostalCodes();

  const handlePLZChange = (selectedPLZ: string) => {
    const location = findLocationByPLZ(selectedPLZ);
    if (location) {
      onPLZChange(selectedPLZ, location.ort);
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
        <Select value={plz} onValueChange={handlePLZChange}>
          <SelectTrigger>
            <SelectValue placeholder="PLZ wählen" />
          </SelectTrigger>
          <SelectContent>
            {postalCodes.map((postal) => (
              <SelectItem key={postal.id} value={postal.plz}>
                {postal.plz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label htmlFor="ort">{ortLabel}{required && ' *'}</Label>
        <Input
          id="ort"
          value={ort}
          readOnly
          placeholder="Ort wird automatisch gesetzt"
          className="bg-muted"
        />
      </div>
    </div>
  );
};