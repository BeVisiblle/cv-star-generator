import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Car, Train, Accessibility } from 'lucide-react';
import { JobFormData } from '../JobCreationWizard';

interface JobLocationStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  company: any;
}

const GERMAN_STATES = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
];

export default function JobLocationStep({ formData, updateFormData, company }: JobLocationStepProps) {
  const handleWorkModeChange = (workMode: 'onsite' | 'hybrid' | 'remote') => {
    updateFormData({ work_mode: workMode });
  };

  const handleLocationCheckboxChange = (field: string, checked: boolean) => {
    updateFormData({ [field]: checked });
  };

  const isAddressRequired = formData.work_mode !== 'remote';

  return (
    <div className="space-y-6">
      {/* Work Mode */}
      <div>
        <Label className="text-base font-semibold">Arbeitsmodus</Label>
        <Tabs value={formData.work_mode} onValueChange={handleWorkModeChange} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="onsite">Vor Ort</TabsTrigger>
            <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
            <TabsTrigger value="remote">Remote</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Address Section */}
      {isAddressRequired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Arbeitsort
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Country */}
            <div>
              <Label htmlFor="country">Land *</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => updateFormData({ country: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deutschland">Deutschland</SelectItem>
                  <SelectItem value="Österreich">Österreich</SelectItem>
                  <SelectItem value="Schweiz">Schweiz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* State */}
              <div>
                <Label htmlFor="state">Bundesland *</Label>
                <Select 
                  value={formData.state} 
                  onValueChange={(value) => updateFormData({ state: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Wählen Sie ein Bundesland" />
                  </SelectTrigger>
                  <SelectContent>
                    {GERMAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city">Stadt *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData({ city: e.target.value })}
                  placeholder="z.B. Berlin"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Postal Code */}
              <div>
                <Label htmlFor="postal_code">PLZ *</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => updateFormData({ postal_code: e.target.value })}
                  placeholder="10119"
                  className="mt-1"
                />
              </div>

              {/* Street */}
              <div>
                <Label htmlFor="address_street">Straße *</Label>
                <Input
                  id="address_street"
                  value={formData.address_street}
                  onChange={(e) => updateFormData({ address_street: e.target.value })}
                  placeholder="Torstraße"
                  className="mt-1"
                />
              </div>

              {/* Number */}
              <div>
                <Label htmlFor="address_number">Nr. *</Label>
                <Input
                  id="address_number"
                  value={formData.address_number}
                  onChange={(e) => updateFormData({ address_number: e.target.value })}
                  placeholder="123"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Features */}
      {isAddressRequired && (
        <Card>
          <CardHeader>
            <CardTitle>Standort-Hinweise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="public_transport"
                checked={formData.public_transport}
                onCheckedChange={(checked) => handleLocationCheckboxChange('public_transport', !!checked)}
              />
              <Label htmlFor="public_transport" className="flex items-center gap-2">
                <Train className="h-4 w-4" />
                ÖPNV-Anbindung
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="parking_available"
                checked={formData.parking_available}
                onCheckedChange={(checked) => handleLocationCheckboxChange('parking_available', !!checked)}
              />
              <Label htmlFor="parking_available" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Parkplätze vorhanden
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="barrier_free_access"
                checked={formData.barrier_free_access}
                onCheckedChange={(checked) => handleLocationCheckboxChange('barrier_free_access', !!checked)}
              />
              <Label htmlFor="barrier_free_access" className="flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                Barrierefreier Zugang
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commute Distance */}
      {isAddressRequired && (
        <Card>
          <CardHeader>
            <CardTitle>Pendeldistanz</CardTitle>
            <p className="text-sm text-muted-foreground">
              Maximale Entfernung für das Matching mit Kandidaten
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Umkreis: {formData.commute_distance_km} km</Label>
                <Slider
                  value={[formData.commute_distance_km]}
                  onValueChange={(value) => updateFormData({ commute_distance_km: value[0] })}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remote Work Info */}
      {formData.work_mode === 'remote' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Bei Remote-Arbeit ist keine spezifische Adresse erforderlich.</p>
              <p className="text-sm mt-1">Sie können optional ein Herkunftsland angeben.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">Beispiel-Adresse:</h4>
        <div className="text-sm text-muted-foreground">
          <p>Torstraße 123, 10119 Berlin, Deutschland</p>
          <p className="mt-1">✓ ÖPNV-Anbindung • ✓ Parkplätze • Pendeldistanz: 25 km</p>
        </div>
      </div>
    </div>
  );
}