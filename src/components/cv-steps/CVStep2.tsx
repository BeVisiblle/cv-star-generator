import React, { useState, useEffect } from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { PLZOrtSelector } from '@/components/shared/PLZOrtSelector';
import { useDebounce } from '@/hooks/useDebounce';

const CVStep2 = () => {
  const { formData, updateFormData, validationErrors } = useCVForm();
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Local states for inputs to prevent focus loss
  const [localInputs, setLocalInputs] = useState({
    vorname: formData.vorname || '',
    nachname: formData.nachname || '',
    strasse: formData.strasse || '',
    hausnummer: formData.hausnummer || '',
    plz: formData.plz || '',
    ort: formData.ort || '',
    telefon: formData.telefon || '',
    email: formData.email || '',
    schule: formData.schule || '',
    abschlussjahr: formData.abschlussjahr || '',
    ausbildungsberuf: formData.ausbildungsberuf || '',
    ausbildungsbetrieb: formData.ausbildungsbetrieb || '',
    startjahr: formData.startjahr || '',
    voraussichtliches_ende: formData.voraussichtliches_ende || '',
    abschlussjahr_ausgelernt: formData.abschlussjahr_ausgelernt || '',
    aktueller_beruf: formData.aktueller_beruf || ''
  });

  // Debounced update function
  const debouncedUpdate = useDebounce((updates: any) => {
    updateFormData(updates);
  }, 300);

  // Update local state when formData changes externally
  useEffect(() => {
    setLocalInputs({
      vorname: formData.vorname || '',
      nachname: formData.nachname || '',
      strasse: formData.strasse || '',
      hausnummer: formData.hausnummer || '',
      plz: formData.plz || '',
      ort: formData.ort || '',
      telefon: formData.telefon || '',
      email: formData.email || '',
      schule: formData.schule || '',
      abschlussjahr: formData.abschlussjahr || '',
      ausbildungsberuf: formData.ausbildungsberuf || '',
      ausbildungsbetrieb: formData.ausbildungsbetrieb || '',
      startjahr: formData.startjahr || '',
      voraussichtliches_ende: formData.voraussichtliches_ende || '',
      abschlussjahr_ausgelernt: formData.abschlussjahr_ausgelernt || '',
      aktueller_beruf: formData.aktueller_beruf || ''
    });
  }, [formData]);

  // Handle input changes with local state
  const handleInputChange = (field: string, value: string) => {
    setLocalInputs(prev => ({ ...prev, [field]: value }));
    debouncedUpdate({ [field]: value });
  };

  // Handle input blur for immediate save
  const handleInputBlur = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  // Import the FormFieldError component
  const FormFieldError = ({ error, children, className = "" }: { error?: string; children: React.ReactElement; className?: string }) => (
    <div className={`space-y-1 ${className}`}>
      {React.cloneElement(children, {
        className: `${children.props.className} ${error ? "border-destructive focus:border-destructive ring-destructive" : ""}`
      })}
      {error && (
        <p className="text-sm text-destructive font-medium">
          {error}
        </p>
      )}
    </div>
  );
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
                  value={localInputs.vorname}
                  onChange={(e) => handleInputChange('vorname', e.target.value)}
                  onBlur={(e) => handleInputBlur('vorname', e.target.value)}
                  placeholder="Max"
                />
              </div>
            </FormFieldError>
            <FormFieldError error={validationErrors.nachname}>
              <div>
                <Label htmlFor="nachname">Nachname *</Label>
                <Input
                  id="nachname"
                  value={localInputs.nachname}
                  onChange={(e) => handleInputChange('nachname', e.target.value)}
                  onBlur={(e) => handleInputBlur('nachname', e.target.value)}
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
                      value={localInputs.strasse}
                      onChange={(e) => handleInputChange('strasse', e.target.value)}
                      onBlur={(e) => handleInputBlur('strasse', e.target.value)}
                      placeholder="Musterstraße"
                    />
                  </div>
                </FormFieldError>
                <FormFieldError error={validationErrors.hausnummer}>
                  <div>
                    <Label htmlFor="hausnummer">Nr. *</Label>
                    <Input
                      id="hausnummer"
                      value={localInputs.hausnummer}
                      onChange={(e) => handleInputChange('hausnummer', e.target.value)}
                      onBlur={(e) => handleInputBlur('hausnummer', e.target.value)}
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
                      value={localInputs.plz}
                      onChange={(e) => handleInputChange('plz', e.target.value)}
                      onBlur={(e) => handleInputBlur('plz', e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </FormFieldError>
                <FormFieldError error={validationErrors.ort} className="col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="ort">Ort *</Label>
                    <Input
                      id="ort"
                      value={localInputs.ort}
                      onChange={(e) => handleInputChange('ort', e.target.value)}
                      onBlur={(e) => handleInputBlur('ort', e.target.value)}
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
                    value={localInputs.telefon}
                    onChange={(e) => handleInputChange('telefon', e.target.value)}
                    onBlur={(e) => handleInputBlur('telefon', e.target.value)}
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
                    value={localInputs.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => handleInputBlur('email', e.target.value)}
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
                  value={localInputs.schule}
                  onChange={(e) => handleInputChange('schule', e.target.value)}
                  onBlur={(e) => handleInputBlur('schule', e.target.value)}
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
                    value={localInputs.abschlussjahr}
                    onChange={(e) => handleInputChange('abschlussjahr', e.target.value)}
                    onBlur={(e) => handleInputBlur('abschlussjahr', e.target.value)}
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
                    value={localInputs.ausbildungsberuf}
                    onChange={(e) => handleInputChange('ausbildungsberuf', e.target.value)}
                    onBlur={(e) => handleInputBlur('ausbildungsberuf', e.target.value)}
                    placeholder="z.B. Elektroniker/in"
                  />
                </div>
                <div>
                  <Label htmlFor="ausbildungsbetrieb">Ausbildungsbetrieb *</Label>
                  <Input
                    id="ausbildungsbetrieb"
                    value={localInputs.ausbildungsbetrieb}
                    onChange={(e) => handleInputChange('ausbildungsbetrieb', e.target.value)}
                    onBlur={(e) => handleInputBlur('ausbildungsbetrieb', e.target.value)}
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
                    value={localInputs.startjahr}
                    onChange={(e) => handleInputChange('startjahr', e.target.value)}
                    onBlur={(e) => handleInputBlur('startjahr', e.target.value)}
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
                    value={localInputs.voraussichtliches_ende}
                    onChange={(e) => handleInputChange('voraussichtliches_ende', e.target.value)}
                    onBlur={(e) => handleInputBlur('voraussichtliches_ende', e.target.value)}
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
                    value={localInputs.ausbildungsberuf}
                    onChange={(e) => handleInputChange('ausbildungsberuf', e.target.value)}
                    onBlur={(e) => handleInputBlur('ausbildungsberuf', e.target.value)}
                    placeholder="z.B. Elektroniker/in"
                  />
                </div>
                <div>
                  <Label htmlFor="abschlussjahr_ausgelernt">Abschlussjahr *</Label>
                  <Input
                    id="abschlussjahr_ausgelernt"
                    type="number"
                    value={localInputs.abschlussjahr_ausgelernt}
                    onChange={(e) => handleInputChange('abschlussjahr_ausgelernt', e.target.value)}
                    onBlur={(e) => handleInputBlur('abschlussjahr_ausgelernt', e.target.value)}
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
                  value={localInputs.aktueller_beruf}
                  onChange={(e) => handleInputChange('aktueller_beruf', e.target.value)}
                  onBlur={(e) => handleInputBlur('aktueller_beruf', e.target.value)}
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