import React, { useState } from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { FormFieldError } from '@/components/ui/form-field-error';

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
              <div>
                <Label htmlFor="geburtsdatum">Geburtsdatum *</Label>
                <Input
                  id="geburtsdatum"
                  type="date"
                  value={
                    formData.geburtsdatum instanceof Date 
                      ? formData.geburtsdatum.toISOString().split('T')[0] 
                      : typeof formData.geburtsdatum === 'string' 
                      ? (formData.geburtsdatum.includes('T') ? formData.geburtsdatum.split('T')[0] : formData.geburtsdatum)
                      : ''
                  }
                  onChange={(e) => updateFormData({ geburtsdatum: e.target.value })}
                />
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