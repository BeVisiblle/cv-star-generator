import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface MapPickerProps {
  value: any;
  onChange: (point: any) => void;
  className?: string;
}

export function MapPicker({ value, onChange, className = '' }: MapPickerProps) {
  const [address, setAddress] = useState('');

  const handleGeocode = async () => {
    // Simple geocoding implementation
    // In a real app, you'd use Google Maps API or similar
    if (!address.trim()) return;

    try {
      // Mock geocoding - in reality you'd call a geocoding service
      const mockResult = {
        lat: 52.5200 + (Math.random() - 0.5) * 0.1,
        lng: 13.4050 + (Math.random() - 0.5) * 0.1,
        address: address
      };
      
      onChange(mockResult);
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Input
          placeholder="Adresse eingeben..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGeocode()}
        />
        <Button onClick={handleGeocode} size="sm">
          <MapPin className="w-4 h-4" />
        </Button>
      </div>
      {value && (
        <div className="text-sm text-gray-600">
          <strong>Ausgewählt:</strong> {value.address || 'Unbekannte Adresse'}
          <br />
          <span className="text-xs">
            Lat: {value.lat?.toFixed(4)}, Lng: {value.lng?.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
