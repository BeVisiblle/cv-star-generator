import React, { useState } from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { FormFieldError } from '@/components/ui/form-field-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const CVStep2 = () => {
  const { formData, updateFormData, validationErrors } = useCVForm();
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const abschlussOptions = [
    'Hauptschulabschluss',
    'Realschulabschluss / Mittlere Reife',
    'Fachhochschulreife',
    'Abitur',
    'Ohne Abschluss'
  ];

  const getStatusTitle = () => {
    switch (formData.status) {
      case 'schueler': return 'Schüler:in';
      case 'azubi': return 'Azubi';
      case 'ausgelernt': return 'Ausgelernte Fachkraft';
      default: return '';
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      updateFormData({ profilbild: file });
    } else {
      setPreviewUrl('');
      updateFormData({ profilbild: undefined });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Persönliche Daten</h2>
        <p className="text-muted-foreground mb-6">
          Erzähl uns ein bisschen über dich als {getStatusTitle()}.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Profilbild Upload - Pflicht */}
          <FormFieldError error={validationErrors.profilbild}>
            <div className="space-y-2">
              <Label htmlFor="profilbild">Profilbild *</Label>
              <FileUpload 
                onFileSelect={handleFileSelect}
                previewUrl={previewUrl}
                accept="image/*"
                maxSize={5}
              />
            </div>
          </FormFieldError>

          {/* Grunddaten für alle */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormFieldError error={validationErrors.vorname}>
              <div>
                <Label htmlFor="vorname">Vorname *</Label>
                <Input
                  id="vorname"
                  value={formData.vorname || ''}
                  onChange={(e) => updateFormData({ vorname: e.target.value })}
                  placeholder="Max"
                />
              </div>
            </FormFieldError>
            <FormFieldError error={validationErrors.nachname}>
              <div>
                <Label htmlFor="nachname">Nachname *</Label>
                <Input
                  id="nachname"
                  value={formData.nachname || ''}
                  onChange={(e) => updateFormData({ nachname: e.target.value })}
                  placeholder="Mustermann"
                />
              </div>
            </FormFieldError>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormFieldError error={validationErrors.geburtsdatum}>
              <div className="space-y-2">
                <Label htmlFor="geburtsdatum">Geburtsdatum *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.geburtsdatum && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.geburtsdatum ? (
                        format(
                          typeof formData.geburtsdatum === 'string' 
                            ? new Date(formData.geburtsdatum) 
                            : formData.geburtsdatum, 
                          "dd.MM.yyyy",
                          { locale: de }
                        )
                      ) : (
                        <span>Geburtsdatum wählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        formData.geburtsdatum 
                          ? (typeof formData.geburtsdatum === 'string' 
                              ? new Date(formData.geburtsdatum) 
                              : formData.geburtsdatum)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          updateFormData({ geburtsdatum: date.toISOString().split('T')[0] });
                        }
                      }}
                      disabled={(date) => {
                        // Nicht in der Zukunft
                        if (date > new Date()) return true;
                        
                        // Mindestens 16 Jahre alt
                        const today = new Date();
                        const sixteenYearsAgo = new Date(
                          today.getFullYear() - 16,
                          today.getMonth(),
                          today.getDate()
                        );
                        if (date > sixteenYearsAgo) return true;
                        
                        // Nicht vor 1900
                        if (date < new Date("1900-01-01")) return true;
                        
                        return false;
                      }}
                      initialFocus
                      defaultMonth={
                        formData.geburtsdatum 
                          ? (typeof formData.geburtsdatum === 'string' 
                              ? new Date(formData.geburtsdatum) 
                              : formData.geburtsdatum)
                          : new Date(2005, 0, 1) // Default zu 2005 für bessere UX
                      }
                      captionLayout="dropdown-buttons"
                      fromYear={1940}
                      toYear={new Date().getFullYear() - 16}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </FormFieldError>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <FormFieldError error={validationErrors.strasse} className="md:col-span-2">
                  <div>
                    <Label htmlFor="strasse">Straße *</Label>
                    <Input
                      id="strasse"
                      value={formData.strasse || ''}
                      onChange={(e) => updateFormData({ strasse: e.target.value })}
                      placeholder="Musterstraße"
                    />
                  </div>
                </FormFieldError>
                <FormFieldError error={validationErrors.hausnummer}>
                  <div>
                    <Label htmlFor="hausnummer">Nr. *</Label>
                    <Input
                      id="hausnummer"
                      value={formData.hausnummer || ''}
                      onChange={(e) => updateFormData({ hausnummer: e.target.value })}
                      placeholder="123a"
                    />
                  </div>
                </FormFieldError>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormFieldError error={validationErrors.plz}>
                  <div className="space-y-2">
                    <Label htmlFor="plz">PLZ *</Label>
                    <Input
                      id="plz"
                      value={formData.plz || ''}
                      onChange={(e) => updateFormData({ plz: e.target.value })}
                      placeholder="12345"
                      maxLength={5}
                    />
                  </div>
                </FormFieldError>
                <FormFieldError error={validationErrors.ort} className="col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="ort">Ort *</Label>
                    <Input
                      id="ort"
                      value={formData.ort || ''}
                      onChange={(e) => updateFormData({ ort: e.target.value })}
                      placeholder="Berlin"
                    />
                  </div>
                </FormFieldError>
              </div>
              
              <FormFieldError error={validationErrors.telefon}>
                <div>
                  <Label htmlFor="telefon">Telefonnummer *</Label>
                  <Input
                    id="telefon"
                    value={formData.telefon || ''}
                    onChange={(e) => updateFormData({ telefon: e.target.value })}
                    placeholder="+49 123 456789"
                  />
                </div>
              </FormFieldError>
              
              <FormFieldError error={validationErrors.email}>
                <div>
                  <Label htmlFor="email">E-Mail-Adresse *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    placeholder="max.mustermann@email.com"
                  />
                </div>
              </FormFieldError>
            </div>
          </div>

          {/* Führerschein-Abfrage für alle */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormFieldError error={validationErrors.has_drivers_license}>
              <div className="space-y-2">
                <Label htmlFor="has_drivers_license">Führerschein vorhanden? *</Label>
                <Select 
                  value={formData.has_drivers_license ? 'true' : formData.has_drivers_license === false ? 'false' : ''} 
                  onValueChange={(value) => {
                    const hasLicense = value === 'true';
                    updateFormData({ 
                      has_drivers_license: hasLicense,
                      driver_license_class: hasLicense ? formData.driver_license_class : undefined
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bitte auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ja</SelectItem>
                    <SelectItem value="false">Nein</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormFieldError>
            
            {formData.has_drivers_license && (
              <FormFieldError error={validationErrors.driver_license_class}>
                <div className="space-y-2">
                  <Label htmlFor="driver_license_class">Führerscheinklasse *</Label>
                  <Select 
                    value={formData.driver_license_class || ''} 
                    onValueChange={(value) => updateFormData({ driver_license_class: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Klasse auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM (Moped)</SelectItem>
                      <SelectItem value="A1">A1 (Leichtkraftrad bis 125ccm)</SelectItem>
                      <SelectItem value="A2">A2 (Kraftrad bis 35kW)</SelectItem>
                      <SelectItem value="A">A (Kraftrad)</SelectItem>
                      <SelectItem value="B">B (PKW)</SelectItem>
                      <SelectItem value="BE">BE (PKW mit Anhänger)</SelectItem>
                      <SelectItem value="C1">C1 (LKW bis 7,5t)</SelectItem>
                      <SelectItem value="C1E">C1E (LKW bis 7,5t mit Anhänger)</SelectItem>
                      <SelectItem value="C">C (LKW)</SelectItem>
                      <SelectItem value="CE">CE (LKW mit Anhänger)</SelectItem>
                      <SelectItem value="D1">D1 (Kleinbus)</SelectItem>
                      <SelectItem value="D1E">D1E (Kleinbus mit Anhänger)</SelectItem>
                      <SelectItem value="D">D (Bus)</SelectItem>
                      <SelectItem value="DE">DE (Bus mit Anhänger)</SelectItem>
                      <SelectItem value="L">L (Landwirtschaftliche Zugmaschinen)</SelectItem>
                      <SelectItem value="T">T (Landwirtschaftliche Zugmaschinen bis 60 km/h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormFieldError>
            )}
          </div>

          {/* Schüler-spezifische Felder */}
          {formData.status === 'schueler' && (
            <>
              <div>
                <Label htmlFor="schule">Schule *</Label>
                <Input
                  id="schule"
                  value={formData.schule || ''}
                  onChange={(e) => updateFormData({ schule: e.target.value })}
                  placeholder="Musterschule Musterstadt"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="geplanter_abschluss">Geplanter Schulabschluss *</Label>
                  <Select 
                    value={formData.geplanter_abschluss || ''} 
                    onValueChange={(value) => updateFormData({ geplanter_abschluss: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Abschluss wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {abschlussOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="abschlussjahr">Abschlussjahr *</Label>
                  <Input
                    id="abschlussjahr"
                    type="number"
                    value={formData.abschlussjahr || ''}
                    onChange={(e) => updateFormData({ abschlussjahr: e.target.value })}
                    placeholder="2024"
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>
            </>
          )}

          {/* Azubi-spezifische Felder */}
          {formData.status === 'azubi' && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ausbildungsberuf">Ausbildungsberuf *</Label>
                  <Input
                    id="ausbildungsberuf"
                    value={formData.ausbildungsberuf || ''}
                    onChange={(e) => updateFormData({ ausbildungsberuf: e.target.value })}
                    placeholder="z.B. Elektroniker/in"
                  />
                </div>
                <div>
                  <Label htmlFor="ausbildungsbetrieb">Ausbildungsbetrieb *</Label>
                  <Input
                    id="ausbildungsbetrieb"
                    value={formData.ausbildungsbetrieb || ''}
                    onChange={(e) => updateFormData({ ausbildungsbetrieb: e.target.value })}
                    placeholder="Musterfirma GmbH"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startjahr">Startjahr der Ausbildung *</Label>
                  <Input
                    id="startjahr"
                    type="number"
                    value={formData.startjahr || ''}
                    onChange={(e) => updateFormData({ startjahr: e.target.value })}
                    placeholder="2022"
                    min="2015"
                    max="2024"
                  />
                </div>
                <div>
                  <Label htmlFor="voraussichtliches_ende">Voraussichtliches Ende *</Label>
                  <Input
                    id="voraussichtliches_ende"
                    type="number"
                    value={formData.voraussichtliches_ende || ''}
                    onChange={(e) => updateFormData({ voraussichtliches_ende: e.target.value })}
                    placeholder="2025"
                    min="2024"
                    max="2030"
                  />
                </div>
              </div>
            </>
          )}

          {/* Ausgelernt-spezifische Felder */}
          {formData.status === 'ausgelernt' && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ausbildungsberuf">Ausbildungsberuf *</Label>
                  <Input
                    id="ausbildungsberuf"
                    value={formData.ausbildungsberuf || ''}
                    onChange={(e) => updateFormData({ ausbildungsberuf: e.target.value })}
                    placeholder="z.B. Elektroniker/in"
                  />
                </div>
                <div>
                  <Label htmlFor="abschlussjahr_ausgelernt">Abschlussjahr *</Label>
                  <Input
                    id="abschlussjahr_ausgelernt"
                    type="number"
                    value={formData.abschlussjahr_ausgelernt || ''}
                    onChange={(e) => updateFormData({ abschlussjahr_ausgelernt: e.target.value })}
                    placeholder="2020"
                    min="2000"
                    max="2024"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="aktueller_beruf">Aktueller Beruf (optional)</Label>
                <Input
                  id="aktueller_beruf"
                  value={formData.aktueller_beruf || ''}
                  onChange={(e) => updateFormData({ aktueller_beruf: e.target.value })}
                  placeholder="z.B. Elektroniker bei Musterfirma"
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CVStep2;