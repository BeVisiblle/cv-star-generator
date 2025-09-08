import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Plus, X, Languages, Globe, Plane } from 'lucide-react';
import { JobFormData } from '../JobCreationWizard';

interface JobLanguagesStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  company: any;
}

const LANGUAGE_LEVELS = [
  { value: 'A1', label: 'A1 - Anfänger' },
  { value: 'A2', label: 'A2 - Grundkenntnisse' },
  { value: 'B1', label: 'B1 - Fortgeschritten' },
  { value: 'B2', label: 'B2 - Selbstständig' },
  { value: 'C1', label: 'C1 - Fachkundig' },
  { value: 'C2', label: 'C2 - Annähernd muttersprachlich' },
  { value: 'native', label: 'Muttersprache' },
];

const COMMON_LANGUAGES = [
  'Deutsch', 'Englisch', 'Französisch', 'Spanisch', 'Italienisch',
  'Russisch', 'Polnisch', 'Türkisch', 'Arabisch', 'Niederländisch',
  'Chinesisch', 'Japanisch', 'Portugiesisch', 'Tschechisch', 'Kroatisch'
];

export default function JobLanguagesStep({ formData, updateFormData, company }: JobLanguagesStepProps) {
  const [newLanguage, setNewLanguage] = useState('');

  const addLanguage = (language: string, level: string = 'B2', required: boolean = false) => {
    if (!language.trim()) return;
    
    const newLang = { language: language.trim(), level, required };
    const existingIndex = formData.languages.findIndex(lang => lang.language.toLowerCase() === language.toLowerCase());
    
    if (existingIndex >= 0) {
      // Update existing language
      const updatedLanguages = [...formData.languages];
      updatedLanguages[existingIndex] = newLang;
      updateFormData({ languages: updatedLanguages });
    } else {
      // Add new language
      updateFormData({ languages: [...formData.languages, newLang] });
    }
    
    setNewLanguage('');
  };

  const removeLanguage = (index: number) => {
    const updatedLanguages = formData.languages.filter((_, i) => i !== index);
    updateFormData({ languages: updatedLanguages });
  };

  const updateLanguage = (index: number, updates: Partial<typeof formData.languages[0]>) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages[index] = { ...updatedLanguages[index], ...updates };
    updateFormData({ languages: updatedLanguages });
  };

  return (
    <div className="space-y-6">
      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Sprachen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new language */}
          <div className="flex gap-2">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Neue Sprache hinzufügen..."
              onKeyPress={(e) => e.key === 'Enter' && addLanguage(newLanguage)}
            />
            <Button onClick={() => addLanguage(newLanguage)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Common languages suggestions */}
          <div>
            <Label className="text-sm text-muted-foreground">Häufige Sprachen:</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {COMMON_LANGUAGES.slice(0, 10).map((language) => (
                <Badge
                  key={language}
                  variant="outline"
                  className="cursor-pointer text-xs hover:bg-muted"
                  onClick={() => addLanguage(language)}
                >
                  + {language}
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages list */}
          <div className="space-y-2">
            {formData.languages.map((language, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <div className="flex-1">
                  <Input
                    value={language.language}
                    onChange={(e) => updateLanguage(index, { language: e.target.value })}
                    className="font-medium"
                  />
                </div>
                
                <Select 
                  value={language.level} 
                  onValueChange={(value) => updateLanguage(index, { level: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={language.required}
                    onCheckedChange={(checked) => updateLanguage(index, { required: !!checked })}
                  />
                  <Label className="text-xs">Pflicht</Label>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeLanguage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Default German suggestion */}
          {!formData.languages.some(lang => lang.language.toLowerCase().includes('deutsch')) && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tipp:</strong> Fügen Sie "Deutsch" als Sprache hinzu, wenn Deutschkenntnisse erforderlich sind.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => addLanguage('Deutsch', 'B2', true)}
              >
                Deutsch B2 (Pflicht) hinzufügen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visa & International */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Internationale Aspekte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="visa_sponsorship"
              checked={formData.visa_sponsorship}
              onCheckedChange={(checked) => updateFormData({ visa_sponsorship: !!checked })}
            />
            <Label htmlFor="visa_sponsorship">Visa-Sponsoring möglich</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="relocation_support"
              checked={formData.relocation_support}
              onCheckedChange={(checked) => updateFormData({ relocation_support: !!checked })}
            />
            <Label htmlFor="relocation_support">Umzugsunterstützung</Label>
          </div>
        </CardContent>
      </Card>

      {/* Travel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Reisetätigkeit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Reisetätigkeit: {formData.travel_percentage}%</Label>
            <Slider
              value={[formData.travel_percentage]}
              onValueChange={(value) => updateFormData({ travel_percentage: value[0] })}
              max={100}
              step={5}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Keine Reisen</span>
              <span>Häufige Reisen</span>
            </div>
          </div>

          {formData.travel_percentage > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                {formData.travel_percentage < 25 && "Gelegentliche Reisen zu Kunden oder Partnern"}
                {formData.travel_percentage >= 25 && formData.travel_percentage < 50 && "Regelmäßige Reisetätigkeit erforderlich"}
                {formData.travel_percentage >= 50 && formData.travel_percentage < 75 && "Häufige Reisetätigkeit - ideal für reisefreudige Kandidaten"}
                {formData.travel_percentage >= 75 && "Sehr hohe Reisetätigkeit - vorwiegend unterwegs"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Level Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Sprachlevel-Orientierung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Grundstufe</h4>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>A1:</strong> Erste Wörter und Sätze</p>
                <p><strong>A2:</strong> Einfache Alltagsgespräche</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Mittelstufe</h4>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>B1:</strong> Praktische Sprachverwendung</p>
                <p><strong>B2:</strong> Flüssige Verständigung im Beruf</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Oberstufe</h4>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>C1:</strong> Problemlose Verständigung</p>
                <p><strong>C2:</strong> Annähernd muttersprachlich</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Empfohlene Level</h4>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>Kundenbetreuung:</strong> B2+</p>
                <p><strong>Interne Kommunikation:</strong> B1+</p>
                <p><strong>Technische Dokumentation:</strong> B2+</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Sprachen-Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formData.languages.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Noch keine Sprachen hinzugefügt
              </p>
            )}
            
            {formData.languages.map((language, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="font-medium">{language.language}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{language.level}</Badge>
                  {language.required && <Badge variant="default" className="text-xs">Pflicht</Badge>}
                </div>
              </div>
            ))}
            
            {(formData.visa_sponsorship || formData.relocation_support || formData.travel_percentage > 0) && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Zusätzliche Informationen:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.visa_sponsorship && <Badge variant="outline">Visa-Sponsoring</Badge>}
                  {formData.relocation_support && <Badge variant="outline">Umzugshilfe</Badge>}
                  {formData.travel_percentage > 0 && (
                    <Badge variant="outline">Reisetätigkeit {formData.travel_percentage}%</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}