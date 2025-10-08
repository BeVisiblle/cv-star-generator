import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface Language {
  language: string;
  level: string;
}

interface LanguageSelectorProps {
  value: Language[];
  onChange: (languages: Language[]) => void;
}

const COMMON_LANGUAGES = [
  'Deutsch', 'Englisch', 'Französisch', 'Spanisch', 'Italienisch', 
  'Türkisch', 'Polnisch', 'Russisch', 'Arabisch'
];

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Muttersprache'];

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [newLanguage, setNewLanguage] = useState('');
  const [newLevel, setNewLevel] = useState('B2');

  const addLanguage = () => {
    if (!newLanguage) return;
    onChange([...value, { language: newLanguage, level: newLevel }]);
    setNewLanguage('');
    setNewLevel('B2');
  };

  const removeLanguage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Sprachanforderungen</label>
        <p className="text-sm text-muted-foreground">Welche Sprachen werden benötigt?</p>
      </div>

      <div className="flex gap-2">
        <Select value={newLanguage} onValueChange={setNewLanguage}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Sprache wählen..." />
          </SelectTrigger>
          <SelectContent>
            {COMMON_LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={newLevel} onValueChange={setNewLevel}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((level) => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={addLanguage} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
          {value.map((lang, index) => (
            <Badge key={index} variant="outline" className="gap-1">
              {lang.language} <span className="opacity-70">({lang.level})</span>
              <button
                type="button"
                onClick={() => removeLanguage(index)}
                className="ml-1 hover:bg-background/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}