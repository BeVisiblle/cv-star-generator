import React, { useState } from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SkillSelector } from '@/components/shared/SkillSelector';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SprachEntry } from '@/contexts/CVFormContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { COMMON_LANGUAGES } from '@/data/commonLanguages';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const CVStep3New = () => {
  const { formData, updateFormData } = useCVForm();
  const { toast } = useToast();
  const [generatingSkills, setGeneratingSkills] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [languagePopoverOpen, setLanguagePopoverOpen] = useState<number | null>(null);

  const sprachNiveaus = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Muttersprache'];

  // Get available languages (filter out already selected ones)
  const getAvailableLanguages = () => {
    const selectedLanguages = (formData.sprachen || []).map(s => s.sprache);
    return COMMON_LANGUAGES.filter(lang => !selectedLanguages.includes(lang));
  };

  // Sprachen
  const addSprache = () => {
    const sprachen = formData.sprachen || [];
    const availableLanguages = getAvailableLanguages();
    
    // Add with first available language or empty
    updateFormData({ 
      sprachen: [...sprachen, { 
        sprache: availableLanguages[0] || '', 
        niveau: 'B1' 
      }] 
    });
  };

  const updateSprache = (index: number, field: keyof SprachEntry, value: string) => {
    const sprachen = formData.sprachen || [];
    const updated = [...sprachen];
    
    // Check for duplicates when updating language name
    if (field === 'sprache') {
      const isDuplicate = sprachen.some((s, i) => i !== index && s.sprache === value);
      if (isDuplicate) {
        toast({
          title: "Duplikat",
          description: "Diese Sprache wurde bereits hinzugefügt",
          variant: "destructive"
        });
        return;
      }
    }
    
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ sprachen: updated });
  };

  const removeSprache = (index: number) => {
    const sprachen = formData.sprachen || [];
    updateFormData({ sprachen: sprachen.filter((_, i) => i !== index) });
  };

  // Qualifikationen
  const addQualifikation = () => {
    const qualifikationen = formData.qualifikationen || [];
    updateFormData({ qualifikationen: [...qualifikationen, ''] });
  };

  const updateQualifikation = (index: number, value: string) => {
    const qualifikationen = formData.qualifikationen || [];
    const updated = [...qualifikationen];
    updated[index] = value;
    updateFormData({ qualifikationen: updated });
  };

  const removeQualifikation = (index: number) => {
    const qualifikationen = formData.qualifikationen || [];
    updateFormData({ qualifikationen: qualifikationen.filter((_, i) => i !== index) });
  };

  // Zertifikate
  const addZertifikat = () => {
    const zertifikate = formData.zertifikate || [];
    updateFormData({ zertifikate: [...zertifikate, ''] });
  };

  const updateZertifikat = (index: number, value: string) => {
    const zertifikate = formData.zertifikate || [];
    const updated = [...zertifikate];
    updated[index] = value;
    updateFormData({ zertifikate: updated });
  };

  const removeZertifikat = (index: number) => {
    const zertifikate = formData.zertifikate || [];
    updateFormData({ zertifikate: zertifikate.filter((_, i) => i !== index) });
  };

  // Weiterbildung
  const addWeiterbildung = () => {
    const weiterbildung = formData.weiterbildung || [];
    updateFormData({ 
      weiterbildung: [...weiterbildung, { 
        titel: '', 
        anbieter: '', 
        ort: '', 
        zeitraum_von: '', 
        zeitraum_bis: '', 
        beschreibung: '' 
      }] 
    });
  };

  const updateWeiterbildungEntry = (index: number, field: string, value: string) => {
    const weiterbildung = formData.weiterbildung || [];
    const updated = [...weiterbildung];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ weiterbildung: updated });
  };

  const removeWeiterbildung = (index: number) => {
    const weiterbildung = formData.weiterbildung || [];
    updateFormData({ weiterbildung: weiterbildung.filter((_, i) => i !== index) });
  };

  // Interessen
  const addInteresse = () => {
    const interessen = formData.interessen || [];
    updateFormData({ interessen: [...interessen, ''] });
  };

  const updateInteresse = (index: number, value: string) => {
    const interessen = formData.interessen || [];
    const updated = [...interessen];
    updated[index] = value;
    updateFormData({ interessen: updated });
  };

  const removeInteresse = (index: number) => {
    const interessen = formData.interessen || [];
    updateFormData({ interessen: interessen.filter((_, i) => i !== index) });
  };

  // AI Skill Suggestions
  const handleGenerateSkills = async () => {
    setGeneratingSkills(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggest-skills', {
        body: { 
          branche: formData.branche,
          status: formData.status,
          existingSkills: formData.faehigkeiten || [],
          schulbildung: formData.schulbildung,
          berufserfahrung: formData.berufserfahrung
        }
      });

      if (error) throw error;

      if (data.success && data.skills) {
        const currentSkills = formData.faehigkeiten || [];
        const newSkills = data.skills.filter((skill: string) => !currentSkills.includes(skill));
        const combinedSkills = [...currentSkills, ...newSkills].slice(0, 10);
        
        updateFormData({ faehigkeiten: combinedSkills });
        
        toast({
          title: "Erfolgreich",
          description: `${newSkills.length} neue Skills vorgeschlagen!`
        });
      }
    } catch (error) {
      console.error('Error generating skills:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Generieren der Skills.",
        variant: "destructive"
      });
    } finally {
      setGeneratingSkills(false);
    }
  };

  // AI Summary Generator
  const canGenerateSummary = () => {
    return (formData.faehigkeiten?.length || 0) > 0 && (formData.sprachen?.length || 0) > 0;
  };

  const handleGenerateSummary = async () => {
    if (!canGenerateSummary()) {
      toast({
        title: "Fehler",
        description: "Bitte wähle mindestens eine Fähigkeit und eine Sprache aus.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cv-summary', {
        body: { 
          cvData: {
            status: formData.status,
            branche: formData.branche,
            faehigkeiten: formData.faehigkeiten || [],
            sprachen: formData.sprachen || [],
            schulbildung: formData.schulbildung || [],
            berufserfahrung: formData.berufserfahrung || []
          }
        }
      });

      if (error) throw error;

      if (data.summary) {
        updateFormData({ ueberMich: data.summary });
        
        toast({
          title: "Erfolgreich",
          description: "KI Summary wurde generiert!"
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Generieren der Summary.",
        variant: "destructive"
      });
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Kenntnisse, Skills & Motivation</h2>
        <p className="text-muted-foreground mb-6">
          Zeige deine Stärken, Fähigkeiten und was dich motiviert.
        </p>
      </div>

      {/* Skills Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Fähigkeiten & Skills</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateSkills}
            disabled={generatingSkills || !formData.branche}
          >
            {generatingSkills ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI Vorschläge
          </Button>
        </div>
        
        <SkillSelector
          selectedSkills={formData.faehigkeiten || []}
          onSkillsChange={(skills) => updateFormData({ faehigkeiten: skills })}
          branch={formData.branche}
          statusLevel={formData.status}
          maxSkills={10}
          label="Deine wichtigsten Fähigkeiten"
          placeholder="Fähigkeit auswählen..."
        />
      </Card>

      {/* Sprachen */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Sprachen</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSprache}
          >
            <Plus className="h-4 w-4 mr-2" />
            Sprache hinzufügen
          </Button>
        </div>

        <div className="space-y-3">
          {formData.sprachen?.map((sprache, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Popover open={languagePopoverOpen === index} onOpenChange={(open) => setLanguagePopoverOpen(open ? index : null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="flex-1 justify-between"
                  >
                    {sprache.sprache || 'Sprache auswählen...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Sprache suchen..." />
                    <CommandEmpty>Keine Sprache gefunden.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {getAvailableLanguages().map((language) => (
                        <CommandItem
                          key={language}
                          value={language}
                          onSelect={() => {
                            updateSprache(index, 'sprache', language);
                            setLanguagePopoverOpen(null);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              sprache.sprache === language ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {language}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Select
                value={sprache.niveau}
                onValueChange={(value) => updateSprache(index, 'niveau', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sprachNiveaus.map(niveau => (
                    <SelectItem key={niveau} value={niveau}>{niveau}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSprache(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* KI Summary - Über mich */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Über mich - KI Summary</h3>
          <Button
            type="button"
            onClick={handleGenerateSummary}
            disabled={generatingSummary || !canGenerateSummary()}
            variant="outline"
            size="sm"
          >
            {generatingSummary ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generieren
          </Button>
        </div>
        
        {!canGenerateSummary() && (
          <p className="text-sm text-destructive">
            Bitte wähle mindestens eine Fähigkeit und eine Sprache aus, um die Summary zu generieren.
          </p>
        )}
        
        <div>
          <Label htmlFor="ueberMich">Persönliche Zusammenfassung</Label>
          <Textarea
            id="ueberMich"
            value={formData.ueberMich || ''}
            onChange={(e) => updateFormData({ ueberMich: e.target.value })}
            rows={4}
            placeholder="Klicke auf 'Generieren' um einen KI-Text zu erstellen oder schreibe selbst..."
          />
        </div>
      </Card>

      {/* Qualifikationen (Optional) */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Qualifikationen (Optional)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQualifikation}
          >
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
          </Button>
        </div>

        <div className="space-y-2">
          {formData.qualifikationen?.map((qual, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="z.B. Erste-Hilfe-Kurs"
                value={qual}
                onChange={(e) => updateQualifikation(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQualifikation(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Zertifikate (Optional) */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Zertifikate (Optional)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addZertifikat}
          >
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
          </Button>
        </div>

        <div className="space-y-2">
          {formData.zertifikate?.map((zert, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="z.B. Microsoft Office Specialist"
                value={zert}
                onChange={(e) => updateZertifikat(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeZertifikat(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Interessen (Optional) */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Interessen & Hobbys (Optional)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addInteresse}
          >
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
          </Button>
        </div>

        <div className="space-y-2">
          {formData.interessen?.map((interesse, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="z.B. Fußball, Fotografie, Programmieren"
                value={interesse}
                onChange={(e) => updateInteresse(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInteresse(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CVStep3New;
