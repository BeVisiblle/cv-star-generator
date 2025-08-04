import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { SprachEntry } from '@/contexts/CVFormContext';

const CVStep3 = () => {
  const { formData, updateFormData } = useCVForm();

  // Language management
  const addSprachEntry = () => {
    const sprachen = formData.sprachen || [];
    const newSprache: SprachEntry = { sprache: '', niveau: 'A1' };
    updateFormData({ sprachen: [...sprachen, newSprache] });
  };

  const updateSprachEntry = (index: number, field: keyof SprachEntry, value: string) => {
    const sprachen = formData.sprachen || [];
    const updated = [...sprachen];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ sprachen: updated });
  };

  const removeSprachEntry = (index: number) => {
    const sprachen = formData.sprachen || [];
    updateFormData({ sprachen: sprachen.filter((_, i) => i !== index) });
  };

  // Skills management (only for azubi/ausgelernt)
  const addFaehigkeit = (faehigkeit: string) => {
    if (!faehigkeit.trim()) return;
    const faehigkeiten = formData.faehigkeiten || [];
    if (!faehigkeiten.includes(faehigkeit.trim())) {
      updateFormData({ faehigkeiten: [...faehigkeiten, faehigkeit.trim()] });
    }
  };

  const removeFaehigkeit = (index: number) => {
    const faehigkeiten = formData.faehigkeiten || [];
    updateFormData({ faehigkeiten: faehigkeiten.filter((_, i) => i !== index) });
  };

  const getBrancheTitle = () => {
    switch (formData.branche) {
      case 'handwerk': return 'Handwerk';
      case 'it': return 'IT';
      case 'gesundheit': return 'Gesundheit';
      default: return '';
    }
  };

  const renderHandwerkQuestions = () => (
    <>
      <div>
        <Label htmlFor="praktische_faehigkeiten">Was kannst du praktisch besonders gut? *</Label>
        <Textarea
          id="praktische_faehigkeiten"
          value={formData.kenntnisse || ''}
          onChange={(e) => updateFormData({ kenntnisse: e.target.value })}
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
            value={formData.praktische_erfahrung?.split(':')[1] || ''}
            onChange={(e) => updateFormData({ praktische_erfahrung: `ja:${e.target.value}` })}
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
          value={formData.motivation || ''}
          onChange={(e) => updateFormData({ motivation: e.target.value })}
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
          value={formData.kenntnisse || ''}
          onChange={(e) => updateFormData({ kenntnisse: e.target.value })}
          placeholder="z.B. Ich finde es spannend, wie Software funktioniert, löse gerne technische Probleme..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="it_projekte">Hast du schon mal programmiert oder ein IT-Projekt gemacht? (optional)</Label>
        <Textarea
          id="it_projekte"
          value={formData.praktische_erfahrung || ''}
          onChange={(e) => updateFormData({ praktische_erfahrung: e.target.value })}
          placeholder="z.B. Ich habe mal eine einfache Website erstellt, mit Scratch programmiert..."
          className="mt-2"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="motivation_it">Warum möchtest du im IT-Bereich arbeiten? *</Label>
        <Textarea
          id="motivation_it"
          value={formData.motivation || ''}
          onChange={(e) => updateFormData({ motivation: e.target.value })}
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
          value={formData.kenntnisse || ''}
          onChange={(e) => updateFormData({ kenntnisse: e.target.value })}
          placeholder="z.B. Ich habe bei der Nachbarschaftshilfe mitgemacht, auf meine Geschwister aufgepasst..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="motivation_helfen">Warum möchtest du Menschen helfen? *</Label>
        <Textarea
          id="motivation_helfen"
          value={formData.motivation || ''}
          onChange={(e) => updateFormData({ motivation: e.target.value })}
          placeholder="z.B. Es macht mir Freude, wenn ich anderen helfen kann und sie sich besser fühlen..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="umgang_menschen">Was macht dir im Umgang mit Menschen Spaß? *</Label>
        <Textarea
          id="umgang_menschen"
          value={formData.praktische_erfahrung || ''}
          onChange={(e) => updateFormData({ praktische_erfahrung: e.target.value })}
          placeholder="z.B. Ich höre gerne zu, bin geduldig und kann gut erklären..."
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
      default: return null;
    }
  };

  const showFaehigkeiten = formData.status === 'azubi' || formData.status === 'ausgelernt';

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
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Sprachen</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSprachEntry}
          >
            <Plus className="h-4 w-4 mr-2" />
            Sprache hinzufügen
          </Button>
        </div>

        {!formData.sprachen?.length && (
          <p className="text-muted-foreground text-sm mb-4 p-4 bg-muted/20 rounded">
            Füge deine Sprachkenntnisse hinzu (z.B. Deutsch, Englisch, etc.)
          </p>
        )}

        <div className="space-y-3">
          {formData.sprachen?.map((sprache, index) => (
            <div key={index} className="flex gap-4 items-center">
              <Input
                placeholder="z.B. Deutsch"
                value={sprache.sprache}
                onChange={(e) => updateSprachEntry(index, 'sprache', e.target.value)}
                className="flex-1"
              />
              <Select
                value={sprache.niveau}
                onValueChange={(value) => updateSprachEntry(index, 'niveau', value as SprachEntry['niveau'])}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Muttersprache">Muttersprache</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="A1">A1</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSprachEntry(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Skills Section (only for azubi/ausgelernt) */}
      {showFaehigkeiten && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Fähigkeiten</h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="z.B. Teamwork, Problemlösung..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFaehigkeit(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.querySelector('input');
                  if (input) {
                    addFaehigkeit(input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.faehigkeiten?.length ? (
              <div className="flex flex-wrap gap-2">
                {formData.faehigkeiten.map((faehigkeit, index) => (
                  <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {faehigkeit}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeFaehigkeit(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm p-4 bg-muted/20 rounded">
                Füge deine beruflichen Fähigkeiten hinzu. Drücke Enter oder klicke auf + um hinzuzufügen.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Branch-specific questions */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Branchenspezifische Fragen</h3>
        <div className="space-y-6">
          {renderQuestionsByBranche()}
        </div>
      </Card>

      <div className="p-4 bg-accent/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tipp:</strong> Sei ehrlich und authentisch. Die Angaben zu Motivation und Kenntnissen 
          werden nur für die automatische Generierung deines "Über mich"-Textes verwendet.
        </p>
      </div>
    </div>
  );
};

export default CVStep3;