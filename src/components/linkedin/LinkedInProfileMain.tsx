import React, { useState } from 'react';
import { Edit3, Save, X, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
interface LinkedInProfileMainProps {
  profile: any;
  isEditing: boolean;
  onProfileUpdate: (updates: any) => void;
  readOnly?: boolean;
}
export const LinkedInProfileMain: React.FC<LinkedInProfileMainProps> = ({
  profile,
  isEditing,
  onProfileUpdate,
  readOnly = false
}) => {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(profile?.uebermich || '');
  const [isEditingLicense, setIsEditingLicense] = useState(false);
  const [hasDriversLicense, setHasDriversLicense] = useState(profile?.has_drivers_license);
  const [driverLicenseClass, setDriverLicenseClass] = useState(profile?.driver_license_class || '');
  const handleSaveAbout = () => {
    onProfileUpdate({
      uebermich: aboutText
    });
    setIsEditingAbout(false);
  };
  const handleCancelAbout = () => {
    setAboutText(profile?.uebermich || '');
    setIsEditingAbout(false);
  };
  const handleSaveLicense = () => {
    onProfileUpdate({
      has_drivers_license: hasDriversLicense,
      driver_license_class: hasDriversLicense ? driverLicenseClass : null
    });
    setIsEditingLicense(false);
  };
  const handleCancelLicense = () => {
    setHasDriversLicense(profile?.has_drivers_license);
    setDriverLicenseClass(profile?.driver_license_class || '');
    setIsEditingLicense(false);
  };
  return <div className="space-y-6">
      {/* About Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Über mich</CardTitle>
          {!readOnly && !isEditingAbout && <Button variant="ghost" size="sm" onClick={() => setIsEditingAbout(true)} className="opacity-60 hover:opacity-100">
              <Edit3 className="h-4 w-4" />
            </Button>}
        </CardHeader>
        <CardContent>
          {!readOnly && isEditingAbout ? <div className="space-y-4">
              <Textarea value={aboutText} onChange={e => setAboutText(e.target.value)} placeholder="Erzählen Sie etwas über sich, Ihre Erfahrungen und Ziele..." className="min-h-[120px] md:min-h-[150px] resize-none text-sm md:text-base" />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSaveAbout} size="sm" className="flex-1 sm:flex-none">
                  <Save className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Speichern</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                <Button variant="outline" onClick={handleCancelAbout} size="sm" className="flex-1 sm:flex-none">
                  <X className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Abbrechen</span>
                  <span className="sm:hidden">Cancel</span>
                </Button>
              </div>
            </div> : <div className="space-y-4">
              {aboutText ? <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {aboutText}
                </p> : <p className="text-muted-foreground italic">
                  {readOnly ? "Keine Beschreibung verfügbar." : "Fügen Sie eine Beschreibung hinzu, um Ihr Profil zu vervollständigen."}
                </p>}
            </div>}
        </CardContent>
      </Card>

      {/* Driver License Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2"><Car className="h-4 w-4" /> Führerschein</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Vorhanden</Label>
              <div className="flex items-center gap-3">
                <Switch checked={!!hasDriversLicense} onCheckedChange={(v) => { const val = !!v; setHasDriversLicense(val); onProfileUpdate({ has_drivers_license: val, driver_license_class: val ? (driverLicenseClass || null) : null }); }} />
                <span className="text-sm text-muted-foreground">{hasDriversLicense ? 'Ja' : 'Nein'}</span>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Klasse</Label>
              <Select value={driverLicenseClass || ''} onValueChange={(val) => { setDriverLicenseClass(val); if (val) onProfileUpdate({ has_drivers_license: true, driver_license_class: val }); }} disabled={!hasDriversLicense}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Klasse wählen" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  {['AM','A1','A2','A','B','BE','C','CE','D','DE','T','L'].map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Änderungen werden automatisch gespeichert */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
  };