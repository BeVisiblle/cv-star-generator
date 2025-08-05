import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguages } from '@/hooks/useLanguages';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { SprachEntry } from '@/contexts/CVFormContext';

interface LanguageSelectorProps {
  languages: SprachEntry[];
  onLanguagesChange: (languages: SprachEntry[]) => void;
  maxLanguages?: number;
  label?: string;
  className?: string;
}

export const LanguageSelector = ({
  languages,
  onLanguagesChange,
  maxLanguages = 10,
  label = 'Sprachen',
  className = ''
}: LanguageSelectorProps) => {
  const { languages: availableLanguages, loading, error } = useLanguages();

  const addLanguage = () => {
    if (languages.length >= maxLanguages) return;
    const newLanguage: SprachEntry = { sprache: '', niveau: 'A1' };
    onLanguagesChange([...languages, newLanguage]);
  };

  const updateLanguage = (index: number, field: keyof SprachEntry, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    onLanguagesChange(updated);
  };

  const removeLanguage = (index: number) => {
    onLanguagesChange(languages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className={className}>
        <Label>{label}</Label>
        <div className="flex items-center justify-center h-10 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Label>{label}</Label>
          <span className="text-sm text-muted-foreground">
            {languages.length}/{maxLanguages} Sprachen
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLanguage}
          disabled={languages.length >= maxLanguages}
        >
          <Plus className="h-4 w-4 mr-2" />
          Sprache hinzufügen
        </Button>
      </div>

      {!languages.length && (
        <p className="text-muted-foreground text-sm mb-4 p-4 bg-muted/20 rounded">
          Füge deine Sprachkenntnisse hinzu.
        </p>
      )}

      <div className="space-y-3">
        {languages.map((language, index) => (
          <div key={index} className="flex gap-4 items-center">
            {/* Language Selection */}
            {!error && availableLanguages.length > 0 ? (
              <Select
                value={language.sprache}
                onValueChange={(value) => updateLanguage(index, 'sprache', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sprache wählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.name}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="z.B. Deutsch"
                value={language.sprache}
                onChange={(e) => updateLanguage(index, 'sprache', e.target.value)}
                className="flex-1"
              />
            )}

            {/* Level Selection */}
            <Select
              value={language.niveau}
              onValueChange={(value) => updateLanguage(index, 'niveau', value as SprachEntry['niveau'])}
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

            {/* Remove Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeLanguage(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};