import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocations } from '@/hooks/useLocations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddressData {
  zip: string;
  city: string;
  street?: string;
  houseNo?: string;
  lat?: number;
  lng?: number;
}

interface AddressConfirmModalProps {
  open: boolean;
  initialData: AddressData;
  onConfirm: (data: AddressData) => Promise<void>;
}

export function AddressConfirmModal({ open, initialData, onConfirm }: AddressConfirmModalProps) {
  const [data, setData] = useState<AddressData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { searchLocations } = useLocations();
  const { toast } = useToast();
  const [cityOptions, setCityOptions] = useState<Array<{ city: string; lat: number; lng: number }>>([]);

  useEffect(() => {
    if (data.zip && data.zip.length === 5) {
      searchLocations(data.zip).then(locations => {
        setCityOptions(locations);
        if (locations.length === 1) {
          setData(prev => ({
            ...prev,
            city: locations[0].city,
            lat: locations[0].lat,
            lng: locations[0].lng
          }));
        }
      });
    }
  }, [data.zip, searchLocations]);

  const handleZipChange = (zip: string) => {
    setData(prev => ({ ...prev, zip, city: '', lat: undefined, lng: undefined }));
  };

  const handleCitySelect = (selectedCity: string) => {
    const location = cityOptions.find(opt => opt.city === selectedCity);
    if (location) {
      setData(prev => ({
        ...prev,
        city: location.city,
        lat: location.lat,
        lng: location.lng
      }));
    }
  };

  const isValid = () => {
    return data.zip.match(/^\d{5}$/) && 
           data.city.trim() !== '' && 
           data.lat !== undefined && 
           data.lng !== undefined;
  };

  const handleConfirm = async () => {
    if (!isValid()) {
      toast({
        title: "Ungültige Daten",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onConfirm(data);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Adresse konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent 
        className="w-[min(560px,92vw)] max-h-[90dvh] overflow-auto p-4 sm:p-6"
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Adresse bestätigen</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Wir gleichen deine PLZ mit unserer Datenbank ab, um Ort & Radius-Matching zu aktivieren.
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="zip">Postleitzahl *</Label>
            <Input
              id="zip"
              value={data.zip}
              onChange={(e) => handleZipChange(e.target.value)}
              placeholder="12345"
              maxLength={5}
              readOnly={!isEditing}
              className="mt-1"
            />
          </div>

          {cityOptions.length > 1 && (
            <div>
              <Label htmlFor="city">Stadt *</Label>
              <Select value={data.city} onValueChange={handleCitySelect}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Stadt wählen" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((option, index) => (
                    <SelectItem key={index} value={option.city}>
                      {option.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {cityOptions.length === 1 && (
            <div>
              <Label htmlFor="city">Stadt *</Label>
              <Input
                id="city"
                value={data.city}
                readOnly
                className="mt-1 bg-muted"
              />
            </div>
          )}

          <div>
            <Label htmlFor="street">Straße</Label>
            <Input
              id="street"
              value={data.street || ''}
              onChange={(e) => setData(prev => ({ ...prev, street: e.target.value }))}
              placeholder="Musterstraße"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="houseNo">Hausnummer</Label>
            <Input
              id="houseNo"
              value={data.houseNo || ''}
              onChange={(e) => setData(prev => ({ ...prev, houseNo: e.target.value }))}
              placeholder="123"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={handleConfirm}
            disabled={!isValid() || loading}
            className="flex-1 min-h-[44px]"
          >
            {loading ? "Wird gespeichert..." : "Bestätigen"}
          </Button>
          
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex-1 min-h-[44px]"
            >
              Daten korrigieren
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Wir speichern Koordinaten deiner PLZ für Matching im Radius (Ort/Branche). Keine Weitergabe an Dritte.
        </p>
      </DialogContent>
    </Dialog>
  );
}