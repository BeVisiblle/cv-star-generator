import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Star, AlertTriangle, Tag, Plus, X } from 'lucide-react';
import { JobFormData } from '../../company/jobs/JobCreationWizard';

interface JobAdditionalStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  company: any;
}

const COMMON_TAGS = [
  'Vollzeit', 'Teilzeit', 'Remote', 'Hybrid', 'Einstieg', 'Erfahrung',
  'Ausbildung', 'Praktikum', 'Werkstudent', 'Minijob', 'Befristet',
  'Unbefristet', 'Sofort', 'Flexibel', 'Karriere', 'Entwicklung'
];

export default function JobAdditionalStep({ formData, updateFormData, company }: JobAdditionalStepProps) {
  const [newTag, setNewTag] = React.useState('');

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData({
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData({
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addCommonTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      updateFormData({
        tags: [...formData.tags, tag]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Application Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bewerbungsinformationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="application_deadline">Bewerbungsschluss</Label>
              <Input
                id="application_deadline"
                type="date"
                value={formData.application_deadline}
                onChange={(e) => updateFormData({ application_deadline: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="application_email">Bewerbungs-E-Mail</Label>
              <Input
                id="application_email"
                type="email"
                value={formData.application_email}
                onChange={(e) => updateFormData({ application_email: e.target.value })}
                placeholder="bewerbungen@unternehmen.de"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="application_url">Bewerbungs-URL</Label>
            <Input
              id="application_url"
              type="url"
              value={formData.application_url}
              onChange={(e) => updateFormData({ application_url: e.target.value })}
              placeholder="https://karriere.unternehmen.de/bewerbung"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="application_instructions">Bewerbungsanweisungen</Label>
            <Textarea
              id="application_instructions"
              value={formData.application_instructions}
              onChange={(e) => updateFormData({ application_instructions: e.target.value })}
              placeholder="Spezielle Anweisungen für Bewerber..."
              className="mt-1 min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Description */}
      <Card>
        <CardHeader>
          <CardTitle>Unternehmensdarstellung für Stellenanzeige</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="company_description">Kurzbeschreibung *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              250-500 Zeichen • Wird in der Stellenanzeige angezeigt
            </p>
            <Textarea
              id="company_description"
              value={formData.company_description}
              onChange={(e) => updateFormData({ company_description: e.target.value })}
              placeholder="Beschreiben Sie Ihr Unternehmen für potentielle Bewerber..."
              className="min-h-[100px]"
              maxLength={500}
              required
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {formData.company_description.length}/500 Zeichen
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags & Kategorien
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tags helfen Bewerbern, Ihre Stellenanzeige zu finden
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Tags */}
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>

          {/* Add New Tag */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Neuen Tag hinzufügen..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button onClick={addTag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Common Tags */}
          <div>
            <Label className="text-sm font-medium">Häufige Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COMMON_TAGS.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => addCommonTag(tag)}
                  disabled={formData.tags.includes(tag)}
                  className="text-xs"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Sichtbarkeit & Hervorhebung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_featured">Hervorgehobene Anzeige</Label>
              <p className="text-sm text-muted-foreground">
                Diese Anzeige wird prominent angezeigt (kostenpflichtig)
              </p>
            </div>
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => updateFormData({ is_featured: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_urgent">Dringend</Label>
              <p className="text-sm text-muted-foreground">
                Markiert diese Anzeige als dringend
              </p>
            </div>
            <Switch
              id="is_urgent"
              checked={formData.is_urgent}
              onCheckedChange={(checked) => updateFormData({ is_urgent: checked })}
            />
          </div>

          {formData.is_featured && (
            <div>
              <Label htmlFor="featured_until">Hervorhebung bis</Label>
              <Input
                id="featured_until"
                type="datetime-local"
                value={formData.featured_until}
                onChange={(e) => updateFormData({ featured_until: e.target.value })}
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
