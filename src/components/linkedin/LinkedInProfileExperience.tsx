import React, { useState } from 'react';
import { Building, Plus, Edit3, Trash2, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalizeFirst, capitalizeWords, capitalizeSentences } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Experience {
  titel: string;
  unternehmen: string;
  ort: string;
  zeitraum_von: string;
  zeitraum_bis: string;
  beschreibung?: string;
}

interface LinkedInProfileExperienceProps {
  experiences: Experience[];
  isEditing: boolean;
  onExperiencesUpdate: (experiences: Experience[]) => void;
}

export const LinkedInProfileExperience: React.FC<LinkedInProfileExperienceProps> = ({
  experiences = [],
  isEditing,
  onExperiencesUpdate
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Experience>({
    titel: '',
    unternehmen: '',
    ort: '',
    zeitraum_von: '',
    zeitraum_bis: '',
    beschreibung: ''
  });

  const resetForm = () => {
    setFormData({
      titel: '',
      unternehmen: '',
      ort: '',
      zeitraum_von: '',
      zeitraum_bis: '',
      beschreibung: ''
    });
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      // Edit existing
      const updated = [...experiences];
      updated[editingIndex] = formData;
      onExperiencesUpdate(updated);
      setEditingIndex(null);
    } else {
      // Add new
      onExperiencesUpdate([...experiences, formData]);
      setIsAddingNew(false);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setFormData(experiences[index]);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    onExperiencesUpdate(updated);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
    setIsDialogOpen(false);
    resetForm();
  };

  const formatDateRange = (from: string, to: string) => {
    if (!from) return '';
    const fromDate = new Date(from);
    const toDate = to === 'present' || !to ? null : new Date(to);
    
    const fromMonth = fromDate.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
    const toMonth = toDate ? toDate.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }) : 'Heute';
    
    return `${fromMonth} - ${toMonth}`;
  };

  const handleSaveWithValidation = () => {
    // Validate date range
    if (formData.zeitraum_von && formData.zeitraum_bis) {
      const fromDate = new Date(formData.zeitraum_von);
      const toDate = new Date(formData.zeitraum_bis);
      if (fromDate > toDate) {
        alert('Das Startdatum muss vor dem Enddatum liegen.');
        return;
      }
    }
    handleSave();
  };

  const ExperienceForm = () => (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="titel">Position</Label>
          <Input
            id="titel"
            value={formData.titel}
            onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
            onBlur={(e) => setFormData({ ...formData, titel: capitalizeWords(e.target.value) })}
            placeholder="z.B. Softwareentwickler"
            className="text-sm w-full"
          />
        </div>
        <div>
          <Label htmlFor="unternehmen">Unternehmen</Label>
          <Input
            id="unternehmen"
            value={formData.unternehmen}
            onChange={(e) => setFormData({ ...formData, unternehmen: e.target.value })}
            onBlur={(e) => setFormData({ ...formData, unternehmen: capitalizeWords(e.target.value) })}
            placeholder="z.B. Tech AG"
            className="text-sm w-full"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="ort">Ort</Label>
        <Input
          id="ort"
          value={formData.ort}
          onChange={(e) => setFormData({ ...formData, ort: e.target.value })}
          onBlur={(e) => setFormData({ ...formData, ort: capitalizeWords(e.target.value) })}
          placeholder="z.B. Berlin, Deutschland"
          className="text-sm w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zeitraum_von">Von</Label>
          <Input
            id="zeitraum_von"
            type="month"
            value={formData.zeitraum_von}
            onChange={(e) => setFormData({ ...formData, zeitraum_von: e.target.value })}
            className="text-sm w-full"
          />
        </div>
        <div>
          <Label htmlFor="zeitraum_bis">Bis</Label>
          <Input
            id="zeitraum_bis"
            type="month"
            value={formData.zeitraum_bis}
            onChange={(e) => setFormData({ ...formData, zeitraum_bis: e.target.value })}
            placeholder="Leer lassen für aktuell"
            className="text-sm w-full"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="beschreibung">Beschreibung</Label>
        <Textarea
          id="beschreibung"
          value={formData.beschreibung}
          onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
          onBlur={(e) => setFormData({ ...formData, beschreibung: capitalizeSentences(e.target.value) })}
          placeholder="Beschreiben Sie Ihre Tätigkeiten und Erfolge..."
          rows={3}
          className="text-sm w-full resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none" size="sm">
          <span className="hidden sm:inline">Abbrechen</span>
          <span className="sm:hidden">Cancel</span>
        </Button>
        <Button onClick={handleSaveWithValidation} className="flex-1 sm:flex-none" size="sm">
          <span className="hidden sm:inline">Speichern</span>
          <span className="sm:hidden">Save</span>
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3 md:pb-4">
        <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
          <Building className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Berufserfahrung</span>
          <span className="sm:hidden">Erfahrung</span>
        </CardTitle>
        {isEditing && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setIsAddingNew(false);
              setEditingIndex(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => { setIsDialogOpen(true); setIsAddingNew(true); }}>
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Hinzufügen</span>
                <span className="sm:hidden">+</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4">
              <DialogHeader className="text-left pb-2">
                <DialogTitle className="text-lg">Neue Erfahrung hinzufügen</DialogTitle>
              </DialogHeader>
              <div className="w-full">
                <ExperienceForm />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {experiences.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-muted-foreground">
            <Building className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm md:text-base">Noch keine Berufserfahrung hinzugefügt</p>
            {isEditing && (
              <Button 
                variant="outline" 
                className="mt-4"
                size="sm"
                onClick={() => setIsAddingNew(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Erste Erfahrung hinzufügen</span>
                <span className="sm:hidden">Hinzufügen</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {experiences
              .sort((a, b) => {
                // Sort by end date/start date (newest first)
                const aEnd = a.zeitraum_bis ? new Date(a.zeitraum_bis) : new Date(a.zeitraum_von);
                const bEnd = b.zeitraum_bis ? new Date(b.zeitraum_bis) : new Date(b.zeitraum_von);
                return bEnd.getTime() - aEnd.getTime();
              })
              .map((exp, index) => (
              <div key={index} className="relative group">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base md:text-lg truncate">{exp.titel}</h3>
                        <p className="text-primary font-medium text-sm md:text-base truncate">{exp.unternehmen}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{exp.ort}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="truncate">{formatDateRange(exp.zeitraum_von, exp.zeitraum_bis || 'present')}</span>
                          </span>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <Dialog open={isDialogOpen && editingIndex === index} onOpenChange={(open) => {
                            if (!open) {
                              setIsDialogOpen(false);
                              setEditingIndex(null);
                              resetForm();
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4">
                              <DialogHeader className="text-left pb-2">
                                <DialogTitle className="text-lg">Erfahrung bearbeiten</DialogTitle>
                              </DialogHeader>
                              <div className="w-full">
                                <ExperienceForm />
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(index)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {exp.beschreibung && (
                      <p className="text-muted-foreground mt-2 md:mt-3 leading-relaxed text-sm md:text-base">
                        {exp.beschreibung}
                      </p>
                    )}
                  </div>
                </div>
                
                {index < experiences.length - 1 && (
                  <div className="mt-4 md:mt-6 border-b border-border/50" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};