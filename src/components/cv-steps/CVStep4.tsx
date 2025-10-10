import React, { useEffect, useState } from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, CalendarIcon, Sparkles, Loader2 } from 'lucide-react';
import { SchulbildungEntry, BerufserfahrungEntry } from '@/contexts/CVFormContext';
import { PLZOrtSelector } from '@/components/shared/PLZOrtSelector';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CVStep4 = () => {
  const { formData, updateFormData } = useCVForm();
  const { toast } = useToast();
  
  // Local states for dynamic entry inputs to prevent focus loss
  const [localEntryInputs, setLocalEntryInputs] = useState<Record<string, string>>({});
  const [generatingBulletsFor, setGeneratingBulletsFor] = useState<number | null>(null);
  const [generatingAboutMe, setGeneratingAboutMe] = useState(false);

  // Debounced update function with stable reference
  const debouncedUpdate = useDebounce((updates: any) => {
    updateFormData(updates);
  }, 500);

  // Helper functions to handle local state for dynamic entries
  const getLocalInputKey = (type: 'schul' | 'berufs', index: number, field: string) => {
    return `${type}_${index}_${field}`;
  };

  const handleDynamicInputChange = (type: 'schul' | 'berufs', index: number, field: string, value: string) => {
    const key = getLocalInputKey(type, index, field);
    setLocalEntryInputs(prev => ({ ...prev, [key]: value }));
    
    // Update formData with debouncing
    if (type === 'schul') {
      const schulbildung = formData.schulbildung || [];
      const updated = [...schulbildung];
      updated[index] = { ...updated[index], [field]: value };
      debouncedUpdate({ schulbildung: updated });
    } else {
      const berufserfahrung = formData.berufserfahrung || [];
      const updated = [...berufserfahrung];
      updated[index] = { ...updated[index], [field]: value };
      debouncedUpdate({ berufserfahrung: updated });
    }
  };

  const handleDynamicInputBlur = (type: 'schul' | 'berufs', index: number, field: string, value: string) => {
    if (type === 'schul') {
      const schulbildung = formData.schulbildung || [];
      const updated = [...schulbildung];
      updated[index] = { ...updated[index], [field]: value };
      updateFormData({ schulbildung: updated });
    } else {
      const berufserfahrung = formData.berufserfahrung || [];
      const updated = [...berufserfahrung];
      updated[index] = { ...updated[index], [field]: value };
      updateFormData({ berufserfahrung: updated });
    }
  };

  const getLocalInputValue = (type: 'schul' | 'berufs', index: number, field: string, defaultValue: string) => {
    const key = getLocalInputKey(type, index, field);
    return localEntryInputs[key] !== undefined ? localEntryInputs[key] : defaultValue;
  };

  // Generate year options (current year + 5 future, back to 1950)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1950 + 6 }, (_, i) => currentYear + 5 - i);
  
  // Month options
  const monthOptions = [
    { value: '01', label: 'Januar' },
    { value: '02', label: 'Februar' },
    { value: '03', label: 'März' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Dezember' }
  ];

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
    if (formData.status === 'fachkraft' && formData.aktueller_beruf) {
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
          zeitraum_von: formData.abschlussjahr_fachkraft || '',
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
    
    // Update local state for consistency
    const key = getLocalInputKey('schul', index, field);
    setLocalEntryInputs(prev => ({ ...prev, [key]: value }));
  };

  const updateSchulbildungDate = (index: number, field: 'zeitraum_von' | 'zeitraum_bis', year: string) => {
    updateSchulbildungEntry(index, field, year);
  };

  const updateBerufserfahrungDate = (index: number, field: 'zeitraum_von' | 'zeitraum_bis', month: string, year: string) => {
    const currentValue = formData.berufserfahrung?.[index]?.[field] || '';
    const parts = currentValue.split('-');
    const currentYear = parts[0] || '';
    const currentMonth = parts[1] || '';
    
    const finalYear = year || currentYear;
    const finalMonth = month || currentMonth;
    
    if (finalYear && finalMonth) {
      const monthYear = `${finalYear}-${finalMonth}`;
      updateBerufserfahrungEntry(index, field, monthYear);
    } else if (finalYear) {
      // Store partial date temporarily
      updateBerufserfahrungEntry(index, field, `${finalYear}-01`);
    }
  };

  const toggleCurrentJob = (index: number, isCurrent: boolean) => {
    const berufserfahrung = formData.berufserfahrung || [];
    const updated = [...berufserfahrung];
    
    if (isCurrent) {
      // Mark as current job - set a special marker value
      updated[index] = { ...updated[index], zeitraum_bis: 'heute' };
    } else {
      // Not a current job - clear the end date so user can set it
      updated[index] = { ...updated[index], zeitraum_bis: '' };
    }
    
    updateFormData({ berufserfahrung: updated });
  };

  const isCurrentJob = (arbeit: BerufserfahrungEntry) => {
    return arbeit.zeitraum_bis === 'heute';
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
    
    // Update local state for consistency
    const key = getLocalInputKey('berufs', index, field);
    setLocalEntryInputs(prev => ({ ...prev, [key]: value }));
  };

  const removeBerufserfahrungEntry = (index: number) => {
    const berufserfahrung = formData.berufserfahrung || [];
    updateFormData({ berufserfahrung: berufserfahrung.filter((_, i) => i !== index) });
  };

  const handleGenerateJobBullets = async (index: number) => {
    const arbeit = formData.berufserfahrung?.[index];
    if (!arbeit?.titel || !arbeit?.unternehmen) {
      toast({
        title: "Fehler",
        description: "Bitte fülle zuerst Titel und Unternehmen aus.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingBulletsFor(index);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-job-bullets', {
        body: { 
          jobTitle: arbeit.titel,
          company: arbeit.unternehmen,
          industry: formData.branche
        }
      });

      if (error) throw error;

      if (data.success && data.bullets) {
        // Clean bullets: Remove any remaining JSON artifacts
        const cleanBullets = data.bullets.map((bullet: string) => 
          bullet
            .replace(/^["'\[\]]+|["'\[\]]+$/g, '') // Remove quotes & brackets
            .replace(/^[•\-\*\d\.]\s*/, '') // Remove existing bullet symbols
            .trim()
        ).filter((b: string) => b.length > 0);

        // Join with bullet points
        const bulletText = cleanBullets
          .map((bullet: string) => `• ${bullet}`)
          .join('\n');
        
        updateBerufserfahrungEntry(index, 'beschreibung', bulletText);
        
        toast({
          title: "Erfolgreich",
          description: `${cleanBullets.length} Aufgaben wurden generiert!`
        });
      }
    } catch (error) {
      console.error('Error generating job bullets:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Generieren der Aufgaben.",
        variant: "destructive"
      });
    } finally {
      setGeneratingBulletsFor(null);
    }
  };

  // Generate "About Me" text using AI
  const generateAboutMeWithAI = async () => {
    setGeneratingAboutMe(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-about-me', {
        body: { 
          branche: formData.branche,
          status: formData.status,
          faehigkeiten: formData.faehigkeiten || [],
          schulbildung: formData.schulbildung || [],
          berufserfahrung: formData.berufserfahrung || [],
          motivation: formData.motivation,
          kenntnisse: formData.kenntnisse,
          geburtsdatum: formData.geburtsdatum
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.success && data.aboutMe) {
        updateFormData({ ueberMich: data.aboutMe });
        
        toast({
          title: "Erfolgreich generiert!",
          description: "Dein persönlicher Text wurde erstellt. Du kannst ihn jederzeit bearbeiten."
        });
      } else {
        throw new Error(data.error || 'Keine Antwort von der KI erhalten');
      }
    } catch (error: any) {
      console.error('Error generating about me:', error);
      toast({
        title: "Fehler",
        description: error.message || "Der Text konnte nicht generiert werden. Bitte versuche es erneut.",
        variant: "destructive"
      });
    } finally {
      setGeneratingAboutMe(false);
    }
  };

  // Generate "About Me" text using template (fallback)
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

  // Auto-generate when we have enough data (optional fallback)
  React.useEffect(() => {
    if (formData.motivation && formData.kenntnisse && formData.schulbildung?.length && !formData.ueberMich) {
      // Optional: auto-generate with template
      // generateAboutMeText();
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
                    value={getLocalInputValue('schul', index, 'name', schule.name)}
                    onChange={(e) => handleDynamicInputChange('schul', index, 'name', e.target.value)}
                    onBlur={(e) => handleDynamicInputBlur('schul', index, 'name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`schule-plz-${index}`}>PLZ</Label>
                    <Input
                      id={`schule-plz-${index}`}
                      placeholder="12345"
                      value={getLocalInputValue('schul', index, 'plz', schule.plz || '')}
                      onChange={(e) => handleDynamicInputChange('schul', index, 'plz', e.target.value)}
                      onBlur={(e) => handleDynamicInputBlur('schul', index, 'plz', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`schule-ort-${index}`}>Ort *</Label>
                    <Input
                      id={`schule-ort-${index}`}
                      placeholder="z.B. Berlin"
                      value={getLocalInputValue('schul', index, 'ort', schule.ort)}
                      onChange={(e) => handleDynamicInputChange('schul', index, 'ort', e.target.value)}
                      onBlur={(e) => handleDynamicInputBlur('schul', index, 'ort', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Von (Jahr) *</Label>
                    <Select 
                      value={schule.zeitraum_von} 
                      onValueChange={(value) => updateSchulbildungDate(index, 'zeitraum_von', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Jahr wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bis (Jahr) *</Label>
                    <Select 
                      value={schule.zeitraum_bis} 
                      onValueChange={(value) => updateSchulbildungDate(index, 'zeitraum_bis', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Voraussichtlicher Abschluss" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor={`schulbeschreibung-${index}`}>Beschreibung (optional)</Label>
                <Textarea
                  id={`schulbeschreibung-${index}`}
                  placeholder="z.B. Schwerpunkte, besondere Leistungen, Projekte..."
                  value={getLocalInputValue('schul', index, 'beschreibung', schule.beschreibung || '')}
                  onChange={(e) => handleDynamicInputChange('schul', index, 'beschreibung', e.target.value)}
                  onBlur={(e) => handleDynamicInputBlur('schul', index, 'beschreibung', e.target.value)}
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
                    value={getLocalInputValue('berufs', index, 'titel', arbeit.titel)}
                    onChange={(e) => handleDynamicInputChange('berufs', index, 'titel', e.target.value)}
                    onBlur={(e) => handleDynamicInputBlur('berufs', index, 'titel', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`unternehmen-${index}`}>Unternehmen/Einrichtung *</Label>
                  <Input
                    id={`unternehmen-${index}`}
                    placeholder="z.B. Müller GmbH"
                    value={getLocalInputValue('berufs', index, 'unternehmen', arbeit.unternehmen)}
                    onChange={(e) => handleDynamicInputChange('berufs', index, 'unternehmen', e.target.value)}
                    onBlur={(e) => handleDynamicInputBlur('berufs', index, 'unternehmen', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`arbeit-plz-${index}`}>PLZ</Label>
                    <Input
                      id={`arbeit-plz-${index}`}
                      placeholder="12345"
                      value={getLocalInputValue('berufs', index, 'plz', arbeit.plz || '')}
                      onChange={(e) => handleDynamicInputChange('berufs', index, 'plz', e.target.value)}
                      onBlur={(e) => handleDynamicInputBlur('berufs', index, 'plz', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`arbeit-ort-${index}`}>Ort *</Label>
                    <Input
                      id={`arbeit-ort-${index}`}
                      placeholder="z.B. München"
                      value={getLocalInputValue('berufs', index, 'ort', arbeit.ort)}
                      onChange={(e) => handleDynamicInputChange('berufs', index, 'ort', e.target.value)}
                      onBlur={(e) => handleDynamicInputBlur('berufs', index, 'ort', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Von Monat *</Label>
                      <Select 
                        value={arbeit.zeitraum_von ? arbeit.zeitraum_von.split('-')[1] || '' : ''} 
                        onValueChange={(month) => {
                          const year = arbeit.zeitraum_von ? arbeit.zeitraum_von.split('-')[0] || '' : '';
                          updateBerufserfahrungDate(index, 'zeitraum_von', month, year);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Monat" />
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Von Jahr *</Label>
                      <Select 
                        value={arbeit.zeitraum_von ? arbeit.zeitraum_von.split('-')[0] || '' : ''} 
                        onValueChange={(year) => {
                          const month = arbeit.zeitraum_von ? arbeit.zeitraum_von.split('-')[1] || '' : '';
                          updateBerufserfahrungDate(index, 'zeitraum_von', month, year);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Jahr" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`current-job-${index}`}
                      checked={isCurrentJob(arbeit)}
                      onCheckedChange={(checked) => toggleCurrentJob(index, checked as boolean)}
                    />
                    <Label htmlFor={`current-job-${index}`}>
                      Aktueller Job (bis heute)
                    </Label>
                  </div>

                  {!isCurrentJob(arbeit) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Bis Monat</Label>
                        <Select 
                          value={arbeit.zeitraum_bis ? arbeit.zeitraum_bis.split('-')[1] || '' : ''} 
                          onValueChange={(month) => {
                            const year = arbeit.zeitraum_bis ? arbeit.zeitraum_bis.split('-')[0] || '' : '';
                            updateBerufserfahrungDate(index, 'zeitraum_bis', month, year);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Monat" />
                          </SelectTrigger>
                          <SelectContent>
                            {monthOptions.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Bis Jahr</Label>
                        <Select 
                          value={arbeit.zeitraum_bis ? arbeit.zeitraum_bis.split('-')[0] || '' : ''} 
                          onValueChange={(year) => {
                            const month = arbeit.zeitraum_bis ? arbeit.zeitraum_bis.split('-')[1] || '' : '';
                            updateBerufserfahrungDate(index, 'zeitraum_bis', month, year);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Jahr" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor={`arbeitbeschreibung-${index}`}>Beschreibung (optional)</Label>
                  <Button
                    onClick={() => handleGenerateJobBullets(index)}
                    disabled={generatingBulletsFor === index || !arbeit.titel || !arbeit.unternehmen}
                    variant="outline"
                    size="sm"
                  >
                    {generatingBulletsFor === index ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    KI-Aufgaben
                  </Button>
                </div>
                <Textarea
                  id={`arbeitbeschreibung-${index}`}
                  placeholder="z.B. Tätigkeiten, erworbene Fähigkeiten..."
                  value={getLocalInputValue('berufs', index, 'beschreibung', arbeit.beschreibung || '')}
                  onChange={(e) => handleDynamicInputChange('berufs', index, 'beschreibung', e.target.value)}
                  onBlur={(e) => handleDynamicInputBlur('berufs', index, 'beschreibung', e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Motivation & Persönlichkeit */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">💬 Motivation & Persönlichkeit</h3>
            <Button
              onClick={generateAboutMeWithAI}
              disabled={generatingAboutMe}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {generatingAboutMe ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generiere...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Mit KI generieren
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Beschreibe dich selbst, deine Motivation und deine Persönlichkeit. Du kannst den Text selbst schreiben oder mit KI generieren lassen.
          </p>
          <Textarea
            value={formData.ueberMich || ''}
            onChange={(e) => updateFormData({ ueberMich: e.target.value })}
            placeholder="Ich bin... Besonders interessiere ich mich für... Meine Stärken sind..."
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            💡 Tipp: Dieser Text erscheint in deinem Lebenslauf und gibt Arbeitgebern einen persönlichen Einblick.
          </p>
        </div>
      </Card>

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