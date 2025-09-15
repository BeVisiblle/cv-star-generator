import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface JobShiftsEditorProps {
  value: {
    shifts: string[];
    flexibility: string;
  };
  onChange: (value: { shifts: string[]; flexibility: string }) => void;
}

const SHIFT_OPTIONS = [
  { id: 'day', label: 'Frühschicht (6:00 - 14:00)' },
  { id: 'late', label: 'Spätschicht (14:00 - 22:00)' },
  { id: 'night', label: 'Nachtschicht (22:00 - 6:00)' },
  { id: 'flexible', label: 'Flexibel' },
  { id: 'weekend', label: 'Wochenendarbeit' }
];

export function JobShiftsEditor({ value, onChange }: JobShiftsEditorProps) {
  const handleShiftChange = (shiftId: string, checked: boolean) => {
    const newShifts = checked
      ? [...value.shifts, shiftId]
      : value.shifts.filter(id => id !== shiftId);
    
    onChange({
      ...value,
      shifts: newShifts
    });
  };

  const handleFlexibilityChange = (flexibility: string) => {
    onChange({
      ...value,
      flexibility
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Arbeitszeiten</Label>
        <div className="mt-2 space-y-2">
          {SHIFT_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={value.shifts.includes(option.id)}
                onCheckedChange={(checked) => handleShiftChange(option.id, !!checked)}
              />
              <Label htmlFor={option.id} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="flexibility">Flexibilität</Label>
        <Select
          value={value.flexibility}
          onValueChange={handleFlexibilityChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Feste Arbeitszeiten</SelectItem>
            <SelectItem value="flexible">Flexible Arbeitszeiten</SelectItem>
            <SelectItem value="shift">Schichtarbeit</SelectItem>
            <SelectItem value="part-time">Teilzeit möglich</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.shifts.length > 0 && (
        <div className="text-sm text-gray-600">
          <strong>Ausgewählt:</strong> {value.shifts.length} Schicht(en)
        </div>
      )}
    </div>
  );
}
