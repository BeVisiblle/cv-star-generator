import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X, HelpCircle } from 'lucide-react';
import { Job } from '@/lib/types';
import { useJobEditor } from '@/hooks/use-job-editor';
import { useToast } from '@/hooks/use-toast';

interface JobEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onSave: (updatedJob: Partial<Job>) => void;
  onRepublish: () => void;
}

export function JobEditDrawer({ open, onOpenChange, job, onSave, onRepublish }: JobEditDrawerProps) {
  const [formData, setFormData] = useState<Partial<Job>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { state, updateRemote, markAsDirty, resetDirty } = useJobEditor(job);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setFormData({
        title: job.title,
        location: job.location,
        employmentType: job.employmentType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        benefits: job.benefits
      });
      setTags(job.tags || []);
      setErrors({});
    }
  }, [open, job]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markAsDirty();
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRemoteChange = (checked: boolean) => {
    updateRemote(checked);
    handleInputChange('remote', checked);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
      markAsDirty();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
    markAsDirty();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.salaryMin && formData.salaryMax && formData.salaryMin > formData.salaryMax) {
      newErrors.salary = 'Mindestgehalt darf nicht höher als Höchstgehalt sein';
    }

    if (!formData.description || formData.description.length < 200) {
      newErrors.description = 'Beschreibung muss mindestens 200 Zeichen lang sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Validierungsfehler",
        description: "Bitte korrigieren Sie die markierten Felder.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      ...formData,
      tags,
      remote: state.currentRemote,
      lastEditedAt: new Date().toISOString()
    });
    
    resetDirty();
    toast({
      title: "Änderungen gespeichert",
      description: "Die Job-Details wurden erfolgreich aktualisiert.",
    });
  };

  const handleRepublish = () => {
    handleSave();
    onRepublish();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Job bearbeiten</DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-4 space-y-6 overflow-y-auto">
          {/* Title - Always disabled */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Input
                      id="title"
                      value={formData.title || ''}
                      disabled
                      className="pr-8"
                    />
                    <HelpCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Titel kann nach Veröffentlichung nicht geändert werden.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Remote Toggle */}
          <div className="space-y-2">
            <Label htmlFor="remote">Remote</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="remote"
                checked={state.currentRemote}
                onCheckedChange={handleRemoteChange}
              />
              <Label htmlFor="remote">
                {state.currentRemote ? 'Vollständig remote' : 'Vor Ort oder Hybrid'}
              </Label>
            </div>
          </div>

          {/* Location - Conditionally editable */}
          <div className="space-y-2">
            <Label htmlFor="location">Standort</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={state.locationDisabled}
                      className="pr-8"
                    />
                    <HelpCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {state.locationDisabled 
                      ? "Ort ist gesperrt. Ausnahme: Wenn dieser Job zuvor 'Remote' war und Sie dies jetzt ändern, können Sie den Ort anpassen."
                      : "Ort kann angepasst werden, da der Job zuvor remote war."
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <Label htmlFor="employmentType">Anstellungsart</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) => handleInputChange('employmentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Anstellungsart wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vollzeit">Vollzeit</SelectItem>
                <SelectItem value="Teilzeit">Teilzeit</SelectItem>
                <SelectItem value="Praktikum">Praktikum</SelectItem>
                <SelectItem value="Werkstudent">Werkstudent</SelectItem>
                <SelectItem value="Ausbildung">Ausbildung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Mindestgehalt (€)</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin || ''}
                onChange={(e) => handleInputChange('salaryMin', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="z.B. 3000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Höchstgehalt (€)</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax || ''}
                onChange={(e) => handleInputChange('salaryMax', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="z.B. 4000"
              />
            </div>
          </div>
          {errors.salary && (
            <p className="text-sm text-destructive">{errors.salary}</p>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Tag hinzufügen"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button type="button" onClick={addTag} size="sm">
                Hinzufügen
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              placeholder="Beschreiben Sie die Position und das Unternehmen..."
            />
            <p className="text-xs text-muted-foreground">
              {(formData.description || '').length}/200 Zeichen (mindestens 200 erforderlich)
            </p>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Responsibilities */}
          <div className="space-y-2">
            <Label htmlFor="responsibilities">Aufgaben (eine pro Zeile)</Label>
            <Textarea
              id="responsibilities"
              value={formData.responsibilities?.join('\n') || ''}
              onChange={(e) => handleInputChange('responsibilities', e.target.value.split('\n').filter(line => line.trim()))}
              rows={4}
              placeholder="Aufgabe 1&#10;Aufgabe 2&#10;..."
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Anforderungen (eine pro Zeile)</Label>
            <Textarea
              id="requirements"
              value={formData.requirements?.join('\n') || ''}
              onChange={(e) => handleInputChange('requirements', e.target.value.split('\n').filter(line => line.trim()))}
              rows={4}
              placeholder="Anforderung 1&#10;Anforderung 2&#10;..."
            />
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (eine pro Zeile)</Label>
            <Textarea
              id="benefits"
              value={formData.benefits?.join('\n') || ''}
              onChange={(e) => handleInputChange('benefits', e.target.value.split('\n').filter(line => line.trim()))}
              rows={4}
              placeholder="Benefit 1&#10;Benefit 2&#10;..."
            />
          </div>
        </div>

        <DrawerFooter className="border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={!state.isDirty}>
              Änderungen speichern
            </Button>
            {state.isDirty && (
              <Button onClick={handleRepublish}>
                Neu veröffentlichen
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
