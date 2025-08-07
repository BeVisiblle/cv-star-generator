import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, CalendarIcon } from 'lucide-react';
import { SchulbildungEntry, BerufserfahrungEntry } from '@/contexts/CVFormContext';
import { PLZOrtSelector } from '@/components/shared/PLZOrtSelector';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CVStep4 = () => {
  const { formData, updateFormData } = useCVForm();

  const schulformOptions = [
    'Grundschule',
    'Hauptschule',
    'Realschule', 
    'Gymnasium',
    'Gesamtschule',
    'Förderschule',
    'Berufsschule',
    'Berufsfachschule',
    'Fachoberschule',
    'Berufsoberschule',
    'Hochschule/Universität',
    'Andere'
  ];

  // Auto-add entry for students, apprentices and graduates
  React.useEffect(() => {
    // Auto-add school entry for students
    if (formData.status === 'schueler' && formData.schule && formData.geplanter_abschluss) {
      const schulbildung = formData.schulbildung || [];
      
      // Check if automatic entry already exists
      const hasAutoEntry = schulbildung.some(entry => 
        entry.name === formData.schule && entry.schulform === formData.geplanter_abschluss
      );
      
      if (!hasAutoEntry) {
        // Calculate school period (assume 4 years for typical graduation)
        const abschlussJahr = parseInt(formData.abschlussjahr || new Date().getFullYear().toString());
        const startJahr = abschlussJahr - 4;
        
        const autoEntry: SchulbildungEntry = {
          schulform: formData.geplanter_abschluss,
          name: formData.schule,
          ort: formData.ort || '',
          zeitraum_von: startJahr.toString(),
          zeitraum_bis: formData.abschlussjahr || '',
          beschreibung: `Angestrebter Abschluss: ${formData.geplanter_abschluss}`
        };
        
        updateFormData({ schulbildung: [autoEntry, ...schulbildung] });
      }
    }
    
    // Auto-add work entry for apprentices
    if (formData.status === 'azubi' && formData.ausbildungsberuf && formData.ausbildungsbetrieb) {
      const berufserfahrung = formData.berufserfahrung || [];
      
      // Check if automatic entry already exists
      const hasAutoEntry = berufserfahrung.some(entry => 
        entry.titel === formData.ausbildungsberuf && entry.unternehmen === formData.ausbildungsbetrieb
      );
      
      if (!hasAutoEntry) {
        const autoEntry: BerufserfahrungEntry = {
          titel: formData.ausbildungsberuf,
          unternehmen: formData.ausbildungsbetrieb,
          ort: formData.ort || '',
          zeitraum_von: formData.startjahr || '',
          zeitraum_bis: formData.voraussichtliches_ende || '',
          beschreibung: `Ausbildung zum ${formData.ausbildungsberuf}`
        };
        
        updateFormData({ berufserfahrung: [autoEntry, ...berufserfahrung] });
      }
    }
    
    // Auto-add work entry for graduates
    if (formData.status === 'ausgelernt' && formData.aktueller_beruf) {
      const berufserfahrung = formData.berufserfahrung || [];
      
      // Check if automatic entry already exists
      const hasAutoEntry = berufserfahrung.some(entry => 
        entry.titel === formData.aktueller_beruf && entry.zeitraum_bis === 'heute'
      );
      
      if (!hasAutoEntry) {
        const autoEntry: BerufserfahrungEntry = {
          titel: formData.aktueller_beruf,
          unternehmen: '', // Will be filled by user
          ort: formData.ort || '',
          zeitraum_von: formData.abschlussjahr_ausgelernt || '',
          zeitraum_bis: 'heute',
          beschreibung: `Berufstätigkeit als ${formData.aktueller_beruf}`
        };
        
        updateFormData({ berufserfahrung: [autoEntry, ...berufserfahrung] });
      }
    }
  }, [formData.status, formData.schule, formData.geplanter_abschluss, formData.abschlussjahr, formData.ausbildungsberuf, formData.ausbildungsbetrieb, formData.aktueller_beruf]);

  const addSchulbildungEntry = () => {
    const newEntry: SchulbildungEntry = {
      schulform: '',
      name: '',
      ort: '',
      zeitraum_von: '',
      zeitraum_bis: '',
      beschreibung: ''
    };
    
    const schulbildung = formData.schulbildung || [];
    updateFormData({ schulbildung: [...schulbildung, newEntry] });
  };

  const updateSchulbildungEntry = (index: number, field: keyof SchulbildungEntry, value: string) => {
    const schulbildung = formData.schulbildung || [];
    const updated = [...schulbildung];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ schulbildung: updated });
  };

  const updateSchulbildungDate = (index: number, field: 'zeitraum_von' | 'zeitraum_bis', date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear().toString();
      updateSchulbildungEntry(index, field, year);
    }
  };

  const removeSchulbildungEntry = (index: number) => {
    const schulbildung = formData.schulbildung || [];
    updateFormData({ schulbildung: schulbildung.filter((_, i) => i !== index) });
  };

  const addBerufserfahrungEntry = () => {
    const newEntry: BerufserfahrungEntry = {
      titel: '',
      unternehmen: '',
      ort: '',
      zeitraum_von: '',
      zeitraum_bis: '',
      beschreibung: ''
    };
    
    const berufserfahrung = formData.berufserfahrung || [];
    updateFormData({ berufserfahrung: [...berufserfahrung, newEntry] });
  };

  const updateBerufserfahrungEntry = (index: number, field: keyof BerufserfahrungEntry, value: string) => {
    const berufserfahrung = formData.berufserfahrung || [];
    const updated = [...berufserfahrung];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ berufserfahrung: updated });
  };

  const updateBerufserfahrungDate = (index: number, field: 'zeitraum_von' | 'zeitraum_bis', date: Date | undefined) => {
    if (date) {
      const monthYear = format(date, 'yyyy-MM');
      updateBerufserfahrungEntry(index, field, monthYear);
    }
  };

  const removeBerufserfahrungEntry = (index: number) => {
    const berufserfahrung = formData.berufserfahrung || [];
    updateFormData({ berufserfahrung: berufserfahrung.filter((_, i) => i !== index) });
  };

  // Generate "About Me" text using template
  const generateAboutMeText = () => {
    const heute = new Date();
    const geburtsdatum = formData.geburtsdatum ? new Date(formData.geburtsdatum) : null;
    const alter = geburtsdatum ? heute.getFullYear() - geburtsdatum.getFullYear() : '';
    
    const schulbildung = formData.schulbildung?.[0]; // Latest school
    const schule = schulbildung?.name || 'meiner Schule';
    
    const branche = formData.branche === 'handwerk' ? 'Handwerk' : 
                   formData.branche === 'it' ? 'IT' : 
                   formData.branche === 'gesundheit' ? 'Gesundheit' : 'den gewählten Bereich';
    
    const berufsrichtung = formData.branche === 'handwerk' ? 'handwerklichen Tätigkeiten' : 
                          formData.branche === 'it' ? 'der IT-Branche' : 
                          formData.branche === 'gesundheit' ? 'dem Gesundheitswesen' : 'meinem Wunschbereich';

    const stichwortMotivation = formData.motivation?.split(' ').slice(0, 3).join(' ') || 'neue Herausforderungen';
    const stichwortFähigkeiten = formData.kenntnisse?.split(' ').slice(0, 3).join(' ') || 'teamorientiertes Arbeiten';

    const aboutMeText = `Ich bin ${alter} Jahre alt und interessiere mich besonders für den Bereich ${branche}. Während meiner schulischen Laufbahn an ${schule} konnte ich erste Einblicke in ${stichwortMotivation} gewinnen. Besonders gut kann ich ${stichwortFähigkeiten} – deshalb sehe ich meine berufliche Zukunft in ${berufsrichtung}. Mein Ziel ist es, eine Ausbildung zu finden, in der ich mich weiterentwickeln und mit vollem Einsatz mitarbeiten kann.`;

    updateFormData({ ueberMich: aboutMeText });
  };

  // Auto-generate when we have enough data
  React.useEffect(() => {
    if (formData.motivation && formData.kenntnisse && formData.schulbildung?.length && !formData.ueberMich) {
      generateAboutMeText();
    }
  }, [formData.motivation, formData.kenntnisse, formData.schulbildung]);

  const hasMinimumSchulbildung = (formData.schulbildung?.length || 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Schulische & Praktische Erfahrungen</h2>
        <p className="text-muted-foreground mb-6">
          Erzähle von deiner Schullaufbahn und praktischen Erfahrungen. Mindestens eine schulische Erfahrung ist erforderlich.
        </p>
      </div>

      {/* Schulbildung Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Schulbildung</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSchulbildungEntry}
          >
            <Plus className="h-4 w-4 mr-2" />
            Eintrag hinzufügen
          </Button>
        </div>

        {!formData.schulbildung?.length && (
          <p className="text-muted-foreground text-sm mb-4 p-4 bg-muted/20 rounded">
            Du hast noch keine Schulbildung hinzugefügt. Klicke auf "Eintrag hinzufügen" um zu beginnen.
          </p>
        )}

        <div className="space-y-4">
          {formData.schulbildung?.map((schule, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Schulbildung {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSchulbildungEntry(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`schulform-${index}`}>Schulform/Titel *</Label>
                  <Select 
                    value={schule.schulform || ''} 
                    onValueChange={(value) => updateSchulbildungEntry(index, 'schulform', value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Schulform wählen" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {schulformOptions.map((option) => (
                        <SelectItem key={option} value={option} className="hover:bg-muted">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`schulname-${index}`}>Name der Schule *</Label>
                  <Input
                    id={`schulname-${index}`}
                    placeholder="z.B. Friedrich-Schiller-Gymnasium"
                    value={schule.name}
                    onChange={(e) => updateSchulbildungEntry(index, 'name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`schule-plz-${index}`}>PLZ</Label>
                    <Input
                      id={`schule-plz-${index}`}
                      placeholder="12345"
                      value={schule.plz || ''}
                      onChange={(e) => updateSchulbildungEntry(index, 'plz', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`schule-ort-${index}`}>Ort *</Label>
                    <Input
                      id={`schule-ort-${index}`}
                      placeholder="z.B. Berlin"
                      value={schule.ort}
                      onChange={(e) => updateSchulbildungEntry(index, 'ort', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Von (Jahr) *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !schule.zeitraum_von && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {schule.zeitraum_von || "Jahr wählen"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={schule.zeitraum_von ? new Date(parseInt(schule.zeitraum_von), 0, 1) : undefined}
                          onSelect={(date) => updateSchulbildungDate(index, 'zeitraum_von', date)}
                          disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Bis (Jahr) *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !schule.zeitraum_bis && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {schule.zeitraum_bis || "Jahr wählen"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={schule.zeitraum_bis ? new Date(parseInt(schule.zeitraum_bis), 0, 1) : undefined}
                          onSelect={(date) => updateSchulbildungDate(index, 'zeitraum_bis', date)}
                          disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor={`schulbeschreibung-${index}`}>Beschreibung (optional)</Label>
                <Textarea
                  id={`schulbeschreibung-${index}`}
                  placeholder="z.B. Schwerpunkte, besondere Leistungen, Projekte..."
                  value={schule.beschreibung || ''}
                  onChange={(e) => updateSchulbildungEntry(index, 'beschreibung', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Berufserfahrung Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Praktische Erfahrung (optional)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBerufserfahrungEntry}
          >
            <Plus className="h-4 w-4 mr-2" />
            Eintrag hinzufügen
          </Button>
        </div>

        {!formData.berufserfahrung?.length && (
          <p className="text-muted-foreground text-sm mb-4 p-4 bg-muted/20 rounded">
            Hier kannst du Praktika, Ferienjobs oder andere praktische Erfahrungen eintragen.
          </p>
        )}

        <div className="space-y-4">
          {formData.berufserfahrung?.map((arbeit, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Erfahrung {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBerufserfahrungEntry(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`titel-${index}`}>Titel *</Label>
                  <Input
                    id={`titel-${index}`}
                    placeholder="z.B. Praktikum, Ferienjob"
                    value={arbeit.titel}
                    onChange={(e) => updateBerufserfahrungEntry(index, 'titel', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`unternehmen-${index}`}>Unternehmen/Einrichtung *</Label>
                  <Input
                    id={`unternehmen-${index}`}
                    placeholder="z.B. Müller GmbH"
                    value={arbeit.unternehmen}
                    onChange={(e) => updateBerufserfahrungEntry(index, 'unternehmen', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`arbeit-plz-${index}`}>PLZ</Label>
                    <Input
                      id={`arbeit-plz-${index}`}
                      placeholder="12345"
                      value={arbeit.plz || ''}
                      onChange={(e) => updateBerufserfahrungEntry(index, 'plz', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`arbeit-ort-${index}`}>Ort *</Label>
                    <Input
                      id={`arbeit-ort-${index}`}
                      placeholder="z.B. München"
                      value={arbeit.ort}
                      onChange={(e) => updateBerufserfahrungEntry(index, 'ort', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Von (Monat/Jahr) *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !arbeit.zeitraum_von && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {arbeit.zeitraum_von ? format(new Date(arbeit.zeitraum_von), 'MM/yyyy') : "Monat/Jahr wählen"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={arbeit.zeitraum_von ? new Date(arbeit.zeitraum_von) : undefined}
                          onSelect={(date) => updateBerufserfahrungDate(index, 'zeitraum_von', date)}
                          disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Bis (Monat/Jahr) *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !arbeit.zeitraum_bis && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {arbeit.zeitraum_bis ? format(new Date(arbeit.zeitraum_bis), 'MM/yyyy') : "Leer lassen für aktuell"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={arbeit.zeitraum_bis ? new Date(arbeit.zeitraum_bis) : undefined}
                          onSelect={(date) => updateBerufserfahrungDate(index, 'zeitraum_bis', date)}
                          disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor={`arbeitbeschreibung-${index}`}>Beschreibung (optional)</Label>
                <Textarea
                  id={`arbeitbeschreibung-${index}`}
                  placeholder="z.B. Tätigkeiten, erworbene Fähigkeiten..."
                  value={arbeit.beschreibung || ''}
                  onChange={(e) => updateBerufserfahrungEntry(index, 'beschreibung', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Auto-generated About Me */}
      {formData.ueberMich && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">✨ Automatisch generierter "Über mich"-Text</h3>
          <div className="p-4 bg-muted/20 rounded-lg">
            <p className="text-sm leading-relaxed">{formData.ueberMich}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Dieser Text wurde basierend auf deinen Angaben erstellt und wird in deinem Lebenslauf verwendet.
          </p>
        </Card>
      )}

      {/* Validation Message */}
      {!hasMinimumSchulbildung && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Hinweis:</strong> Du musst mindestens eine schulische Erfahrung hinzufügen, 
            um fortfahren zu können.
          </p>
        </div>
      )}
    </div>
  );
};

export default CVStep4;