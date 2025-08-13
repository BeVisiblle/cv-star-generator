import React, { useState, useEffect } from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { useDebounce } from '@/hooks/useDebounce';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { SkillSelector } from '@/components/shared/SkillSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormFieldError } from '@/components/ui/form-field-error';

const CVStep3 = () => {
  const { formData, updateFormData, validationErrors } = useCVForm();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [writeMode, setWriteMode] = useState<'ai' | 'manual'>('ai');
  
  // Local states for textareas to prevent focus loss
  const [localTextareas, setLocalTextareas] = useState({
    kenntnisse: formData.kenntnisse || '',
    motivation: formData.motivation || '',
    praktische_erfahrung: formData.praktische_erfahrung || '',
    ueberMich: formData.ueberMich || ''
  });

  // Debounced update function
  const debouncedUpdate = useDebounce((updates: any) => {
    updateFormData(updates);
  }, 300);

  // Update local state when formData changes externally
  useEffect(() => {
    setLocalTextareas({
      kenntnisse: formData.kenntnisse || '',
      motivation: formData.motivation || '',
      praktische_erfahrung: formData.praktische_erfahrung || '',
      ueberMich: formData.ueberMich || ''
    });
  }, [formData]);

  // Handle textarea changes with local state
  const handleTextareaChange = (field: string, value: string) => {
    setLocalTextareas(prev => ({ ...prev, [field]: value }));
    debouncedUpdate({ [field]: value });
  };

  // Handle textarea blur for immediate save
  const handleTextareaBlur = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  const getBrancheTitle = () => {
    switch (formData.branche) {
      case 'handwerk': return 'Handwerk';
      case 'it': return 'IT';
      case 'gesundheit': return 'Gesundheit & Pflege';
      case 'buero': return 'Büro & Verwaltung';
      case 'verkauf': return 'Verkauf & Handel';
      case 'gastronomie': return 'Gastronomie & Service';
      case 'bau': return 'Bau & Architektur';
      default: return '';
    }
  };

  const renderHandwerkQuestions = () => (
    <>
      <div>
        <Label htmlFor="praktische_faehigkeiten">Was kannst du praktisch besonders gut? *</Label>
        <Textarea
          id="praktische_faehigkeiten"
          value={localTextareas.kenntnisse}
          onChange={(e) => handleTextareaChange('kenntnisse', e.target.value)}
          onBlur={(e) => handleTextareaBlur('kenntnisse', e.target.value)}
          placeholder="z.B. Ich kann gut mit Werkzeugen umgehen, habe schon mal ein Regal gebaut..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label className="text-base font-medium">Hast du schon mal etwas repariert oder gebaut?</Label>
        <RadioGroup 
          value={formData.praktische_erfahrung?.split(':')[0] || ''}
          onValueChange={(value) => {
            const currentDesc = formData.praktische_erfahrung?.split(':')[1] || '';
            updateFormData({ praktische_erfahrung: `${value}:${currentDesc}` });
          }}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ja" id="erfahrung-ja" />
            <Label htmlFor="erfahrung-ja">Ja</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nein" id="erfahrung-nein" />
            <Label htmlFor="erfahrung-nein">Nein</Label>
          </div>
        </RadioGroup>
        
        {formData.praktische_erfahrung?.startsWith('ja') && (
          <Textarea
            value={localTextareas.praktische_erfahrung?.split(':')[1] || ''}
            onChange={(e) => {
              const newValue = `ja:${e.target.value}`;
              setLocalTextareas(prev => ({ ...prev, praktische_erfahrung: newValue }));
              debouncedUpdate({ praktische_erfahrung: newValue });
            }}
            onBlur={(e) => updateFormData({ praktische_erfahrung: `ja:${e.target.value}` })}
            placeholder="Beschreibe kurz, was du gemacht hast..."
            className="mt-2"
            rows={3}
          />
        )}
      </div>

      <div>
        <Label htmlFor="motivation_handwerk">Warum willst du im Handwerk arbeiten? *</Label>
        <Textarea
          id="motivation_handwerk"
          value={localTextareas.motivation}
          onChange={(e) => handleTextareaChange('motivation', e.target.value)}
          onBlur={(e) => handleTextareaBlur('motivation', e.target.value)}
          placeholder="z.B. Ich arbeite gerne mit den Händen und sehe gerne konkrete Ergebnisse..."
          className="mt-2"
          rows={4}
        />
      </div>
    </>
  );

  const renderITQuestions = () => (
    <>
      <div>
        <Label htmlFor="tech_interesse">Was interessiert dich an Technik oder Computern? *</Label>
        <Textarea
          id="tech_interesse"
          value={localTextareas.kenntnisse}
          onChange={(e) => handleTextareaChange('kenntnisse', e.target.value)}
          onBlur={(e) => handleTextareaBlur('kenntnisse', e.target.value)}
          placeholder="z.B. Ich finde es spannend, wie Software funktioniert, löse gerne technische Probleme..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="it_projekte">Hast du schon mal programmiert oder ein IT-Projekt gemacht? (optional)</Label>
        <Textarea
          id="it_projekte"
          value={localTextareas.praktische_erfahrung}
          onChange={(e) => handleTextareaChange('praktische_erfahrung', e.target.value)}
          onBlur={(e) => handleTextareaBlur('praktische_erfahrung', e.target.value)}
          placeholder="z.B. Ich habe mal eine einfache Website erstellt, mit Scratch programmiert..."
          className="mt-2"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="motivation_it">Warum möchtest du im IT-Bereich arbeiten? *</Label>
        <Textarea
          id="motivation_it"
          value={localTextareas.motivation}
          onChange={(e) => handleTextareaChange('motivation', e.target.value)}
          onBlur={(e) => handleTextareaBlur('motivation', e.target.value)}
          placeholder="z.B. Technologie ist die Zukunft und ich möchte Teil davon sein..."
          className="mt-2"
          rows={4}
        />
      </div>
    </>
  );

  const renderGesundheitQuestions = () => (
    <>
      <div>
        <Label htmlFor="soziale_erfahrung">Warst du schon mal in sozialen oder pflegerischen Rollen aktiv? *</Label>
        <Textarea
          id="soziale_erfahrung"
          value={localTextareas.kenntnisse}
          onChange={(e) => handleTextareaChange('kenntnisse', e.target.value)}
          onBlur={(e) => handleTextareaBlur('kenntnisse', e.target.value)}
          placeholder="z.B. Ich habe bei der Nachbarschaftshilfe mitgemacht, auf meine Geschwister aufgepasst..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="motivation_helfen">Warum möchtest du Menschen helfen? *</Label>
        <Textarea
          id="motivation_helfen"
          value={localTextareas.motivation}
          onChange={(e) => handleTextareaChange('motivation', e.target.value)}
          onBlur={(e) => handleTextareaBlur('motivation', e.target.value)}
          placeholder="z.B. Es macht mir Freude, wenn ich anderen helfen kann und sie sich besser fühlen..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="umgang_menschen">Was macht dir im Umgang mit Menschen Spaß? *</Label>
        <Textarea
          id="umgang_menschen"
          value={localTextareas.praktische_erfahrung}
          onChange={(e) => handleTextareaChange('praktische_erfahrung', e.target.value)}
          onBlur={(e) => handleTextareaBlur('praktische_erfahrung', e.target.value)}
          placeholder="z.B. Ich höre gerne zu, bin geduldig und kann gut erklären..."
          className="mt-2"
          rows={4}
        />
      </div>
    </>
  );

  const renderBueroQuestions = () => (
    <>
      <div>
        <Label htmlFor="organisationstaelent">Was fällt dir bei Organisation und Ordnung besonders leicht? *</Label>
        <Textarea
          id="organisationstaelent"
          value={localTextareas.kenntnisse}
          onChange={(e) => handleTextareaChange('kenntnisse', e.target.value)}
          onBlur={(e) => handleTextareaBlur('kenntnisse', e.target.value)}
          placeholder="z.B. Ich kann gut planen, halte Termine ein, arbeite strukturiert..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="motivation_buero">Warum möchtest du im Büro arbeiten? *</Label>
        <Textarea
          id="motivation_buero"
          value={localTextareas.motivation}
          onChange={(e) => handleTextareaChange('motivation', e.target.value)}
          onBlur={(e) => handleTextareaBlur('motivation', e.target.value)}
          placeholder="z.B. Ich arbeite gerne am Computer und mag strukturierte Aufgaben..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="computer_erfahrung">Welche Erfahrungen hast du mit Computern? *</Label>
        <Textarea
          id="computer_erfahrung"
          value={localTextareas.praktische_erfahrung}
          onChange={(e) => handleTextareaChange('praktische_erfahrung', e.target.value)}
          onBlur={(e) => handleTextareaBlur('praktische_erfahrung', e.target.value)}
          placeholder="z.B. Ich kann gut mit Word und Excel umgehen, nutze das Internet sicher..."
          className="mt-2"
          rows={4}
        />
      </div>
    </>
  );

  const renderVerkaufQuestions = () => (
    <>
      <div>
        <Label htmlFor="kundenorientierung">Wie gehst du auf Menschen zu? *</Label>
        <Textarea
          id="kundenorientierung"
          value={localTextareas.kenntnisse}
          onChange={(e) => handleTextareaChange('kenntnisse', e.target.value)}
          onBlur={(e) => handleTextareaBlur('kenntnisse', e.target.value)}
          placeholder="z.B. Ich bin freundlich, höre zu und kann gut erklären..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="motivation_verkauf">Warum möchtest du im Verkauf arbeiten? *</Label>
        <Textarea
          id="motivation_verkauf"
          value={localTextareas.motivation}
          onChange={(e) => handleTextareaChange('motivation', e.target.value)}
          onBlur={(e) => handleTextareaBlur('motivation', e.target.value)}
          placeholder="z.B. Ich helfe gerne Menschen bei Entscheidungen und arbeite gerne im Team..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="verkaufserfahrung">Hast du schon mal etwas verkauft oder beraten? *</Label>
        <Textarea
          id="verkaufserfahrung"
          value={localTextareas.praktische_erfahrung}
          onChange={(e) => handleTextareaChange('praktische_erfahrung', e.target.value)}
          onBlur={(e) => handleTextareaBlur('praktische_erfahrung', e.target.value)}
          placeholder="z.B. Ich habe schon mal auf einem Flohmarkt verkauft, Freunden bei Kaufentscheidungen geholfen..."
          className="mt-2"
          rows={4}
        />
      </div>
    </>
  );

  const renderGastronomieQuestions = () => (
    <>
      <div>
        <Label htmlFor="serviceerfahrung">Was macht dir beim Service und der Gästebetreuung Spaß? *</Label>
        <Textarea
          id="serviceerfahrung"
          value={localTextareas.kenntnisse}
          onChange={(e) => handleTextareaChange('kenntnisse', e.target.value)}
          onBlur={(e) => handleTextareaBlur('kenntnisse', e.target.value)}
          placeholder="z.B. Ich sorge gerne dafür, dass sich Menschen wohlfühlen, arbeite gerne schnell..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="motivation_gastronomie">Warum möchtest du in der Gastronomie arbeiten? *</Label>
        <Textarea
          id="motivation_gastronomie"
          value={localTextareas.motivation}
          onChange={(e) => handleTextareaChange('motivation', e.target.value)}
          onBlur={(e) => handleTextareaBlur('motivation', e.target.value)}
          placeholder="z.B. Ich arbeite gerne mit Menschen und mag das lebendige Umfeld..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="teamarbeit_stress">Wie gehst du mit Stress und Teamarbeit um? *</Label>
        <Textarea
          id="teamarbeit_stress"
          value={localTextareas.praktische_erfahrung}
          onChange={(e) => handleTextareaChange('praktische_erfahrung', e.target.value)}
          onBlur={(e) => handleTextareaBlur('praktische_erfahrung', e.target.value)}
          placeholder="z.B. Ich behalte auch unter Zeitdruck den Überblick, helfe gerne im Team..."
          className="mt-2"
          rows={4}
        />
      </div>
    </>
  );

  const renderBauQuestions = () => (
    <>
      <div>
        <Label htmlFor="koerperliche_arbeit">Wie stehst du zu körperlicher Arbeit? *</Label>
        <Textarea
          id="koerperliche_arbeit"
          value={localTextareas.kenntnisse}
          onChange={(e) => handleTextareaChange('kenntnisse', e.target.value)}
          onBlur={(e) => handleTextareaBlur('kenntnisse', e.target.value)}
          placeholder="z.B. Ich bin körperlich fit, arbeite gerne draußen, packe gerne mit an..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="motivation_bau">Warum möchtest du im Baubereich arbeiten? *</Label>
        <Textarea
          id="motivation_bau"
          value={localTextareas.motivation}
          onChange={(e) => handleTextareaChange('motivation', e.target.value)}
          onBlur={(e) => handleTextareaBlur('motivation', e.target.value)}
          placeholder="z.B. Ich baue gerne etwas auf, sehe gerne konkrete Ergebnisse meiner Arbeit..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="handwerkliche_erfahrung_bau">Hast du schon mal gebaut oder auf einer Baustelle gearbeitet? *</Label>
        <Textarea
          id="handwerkliche_erfahrung_bau"
          value={localTextareas.praktische_erfahrung}
          onChange={(e) => handleTextareaChange('praktische_erfahrung', e.target.value)}
          onBlur={(e) => handleTextareaBlur('praktische_erfahrung', e.target.value)}
          placeholder="z.B. Ich habe beim Familienhausbau geholfen, schon mal renoviert..."
          className="mt-2"
          rows={4}
        />
      </div>
    </>
  );

  const renderQuestionsByBranche = () => {
    switch (formData.branche) {
      case 'handwerk': return renderHandwerkQuestions();
      case 'it': return renderITQuestions();
      case 'gesundheit': return renderGesundheitQuestions();
      case 'buero': return renderBueroQuestions();
      case 'verkauf': return renderVerkaufQuestions();
      case 'gastronomie': return renderGastronomieQuestions();
      case 'bau': return renderBauQuestions();
      default: return null;
    }
  };

  const showFaehigkeiten = formData.status === 'azubi' || formData.status === 'ausgelernt';

  const handleGenerateAboutMe = async () => {
    if (!formData.motivation && !formData.kenntnisse) {
      toast({
        title: "Fehler",
        description: "Bitte beantworte zuerst mindestens eine der branchenspezifischen Fragen.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cv-summary', {
        body: { cvData: formData }
      });

      if (error) throw error;

      if (data.success) {
        updateFormData({ ueberMich: data.summary });
        toast({
          title: "Erfolg",
          description: "Dein 'Über mich'-Text wurde erfolgreich generiert!"
        });
      } else {
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Error generating CV summary:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Generieren des Textes. Bitte versuche es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Kenntnisse & Motivation: {getBrancheTitle()}
        </h2>
        <p className="text-muted-foreground mb-6">
          Erzähl uns von deinen Erfahrungen und was dich motiviert.
        </p>
      </div>

      {/* Languages Section */}
      <FormFieldError error={validationErrors.sprachen}>
        <Card className="p-6">
          <LanguageSelector
            languages={formData.sprachen || []}
            onLanguagesChange={(languages) => updateFormData({ sprachen: languages })}
            maxLanguages={formData.status === 'schueler' ? 3 : 10}
            label="Sprachen *"
          />
        </Card>
      </FormFieldError>

      {/* Skills Section (only for azubi/ausgelernt) */}
      {showFaehigkeiten && (
        <FormFieldError error={validationErrors.faehigkeiten}>
          <Card className="p-6">
            <SkillSelector
              selectedSkills={formData.faehigkeiten || []}
              onSkillsChange={(skills) => updateFormData({ faehigkeiten: skills })}
              branch={formData.branche}
              statusLevel={formData.status}
              maxSkills={5}
              label="Fähigkeiten * (max. 5)"
            />
          </Card>
        </FormFieldError>
      )}

      {/* Branch-specific questions */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Branchenspezifische Fragen</h3>
        <div className="space-y-6">
          {renderQuestionsByBranche()}
        </div>
      </Card>

      {/* About Me Section */}
      <FormFieldError error={validationErrors.ueberMich}>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Über mich-Text *</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setWriteMode('ai')}
                  variant={writeMode === 'ai' ? 'default' : 'outline'}
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  KI
                </Button>
                <Button
                  onClick={() => setWriteMode('manual')}
                  variant={writeMode === 'manual' ? 'default' : 'outline'}
                  size="sm"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Selbst schreiben
                </Button>
              </div>
            </div>

            {writeMode === 'ai' ? (
              <div className="space-y-4">
                {!formData.ueberMich ? (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h4 className="font-semibold mb-2">Über mich-Text automatisch erstellen</h4>
                    <p className="text-muted-foreground mb-4">
                      Lass KI einen personalisierten "Über mich"-Text für deinen Lebenslauf erstellen, 
                      basierend auf deinen Angaben oben.
                    </p>
                    <Button
                      onClick={handleGenerateAboutMe}
                      disabled={isGenerating || !formData.motivation}
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Erstelle Text...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Über mich-Text generieren
                        </>
                      )}
                    </Button>
                    {!formData.motivation && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Beantworte zuerst die Fragen oben, um einen personalisierten Text zu erhalten.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Generierter Text:</Label>
                      <Button
                        onClick={handleGenerateAboutMe}
                        disabled={isGenerating}
                        variant="outline"
                        size="sm"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Neu generieren
                      </Button>
                    </div>
                    <Textarea
                      value={localTextareas.ueberMich}
                      onChange={(e) => handleTextareaChange('ueberMich', e.target.value)}
                      onBlur={(e) => handleTextareaBlur('ueberMich', e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Du kannst den generierten Text hier noch anpassen.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Label>Schreibe deinen eigenen Text:</Label>
                <Textarea
                  value={localTextareas.ueberMich}
                  onChange={(e) => handleTextareaChange('ueberMich', e.target.value)}
                  onBlur={(e) => handleTextareaBlur('ueberMich', e.target.value)}
                  rows={4}
                  placeholder="Erzähl uns über dich, deine Motivation und was dich auszeichnet..."
                />
                <p className="text-xs text-muted-foreground">
                  Schreibe 2-4 Sätze über dich, deine Motivation und deine Stärken.
                </p>
              </div>
            )}
          </div>
        </Card>
      </FormFieldError>

      <div className="p-4 bg-accent/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tipp:</strong> Sei ehrlich und authentisch. Die Angaben zu Motivation und Kenntnissen 
          werden für die automatische Generierung deines "Über mich"-Textes verwendet.
        </p>
      </div>
    </div>
  );
};

export default CVStep3;