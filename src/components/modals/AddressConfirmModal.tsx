import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PLZOrtSelector } from '@/components/shared/PLZOrtSelector';

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
  onOpenChange: (open: boolean) => void;
  initialData: AddressData;
  onConfirm: (data: AddressData) => Promise<void>;
}

export function AddressConfirmModal({ open, onOpenChange, initialData, onConfirm }: AddressConfirmModalProps) {
  const [data, setData] = useState<AddressData>(initialData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleZipChange = (zip: string) => {
    const cleanZip = zip.replace(/\D/g, '').slice(0, 5);
    setData(prev => ({ ...prev, zip: cleanZip }));
  };

  const isValid = () => {
    return /^\d{5}$/.test(data.zip) && data.city.trim() !== '';
  };

  const handleConfirm = async () => {
    if (!isValid()) {
      let errorMessage = "Bitte gib eine gültige PLZ und Stadt an.";
      
      if (data.zip.length !== 5) {
        errorMessage = `PLZ muss 5-stellig sein (aktuell: ${data.zip.length} Ziffern). Beispiel: 01067 für Dresden`;
      } else if (data.city.trim() === '') {
        errorMessage = "Bitte gib eine Stadt an.";
      }
      
      toast({
        title: "Ungültige Daten",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onConfirm(data);
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[min(560px,92vw)] max-h-[90dvh] overflow-auto p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Adresse bestätigen</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Wir gleichen deine PLZ mit unserer Datenbank ab, um Ort & Radius-Matching zu aktivieren.
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1">
            <PLZOrtSelector
              plz={data.zip}
              ort={data.city}
              required
              plzLabel="Postleitzahl"
              ortLabel="Stadt"
              onPLZChange={(plz, ort) => setData(prev => ({ ...prev, zip: plz, city: ort }))}
              onOrtChange={(ort) => setData(prev => ({ ...prev, city: ort }))}
            />
            <p className="text-xs text-muted-foreground">
              PLZ muss 5-stellig sein, z.B. 01067 für Dresden
            </p>
          </div>

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

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 min-h-[44px]"
          >
            Abbrechen
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Wir speichern die PLZ und den Ort für das Matching im Radius. Keine Weitergabe an Dritte.
        </p>
      </DialogContent>
    </Dialog>
  );
}