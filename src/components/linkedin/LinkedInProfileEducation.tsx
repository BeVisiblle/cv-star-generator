import React, { useState } from 'react';
import { GraduationCap, Plus, Edit3, Trash2, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Education {
  schulform: string;
  name: string;
  ort: string;
  plz?: string;
  zeitraum_von: string;
  zeitraum_bis: string;
  beschreibung?: string;
}

interface LinkedInProfileEducationProps {
  education: Education[];
  isEditing: boolean;
  onEducationUpdate: (education: Education[]) => void;
}

export const LinkedInProfileEducation: React.FC<LinkedInProfileEducationProps> = ({
  education = [],
  isEditing,
  onEducationUpdate
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Education>({
    schulform: '',
    name: '',
    ort: '',
    plz: '',
    zeitraum_von: '',
    zeitraum_bis: '',
    beschreibung: ''
  });

  const resetForm = () => {
    setFormData({
      schulform: '',
      name: '',
      ort: '',
      plz: '',
      zeitraum_von: '',
      zeitraum_bis: '',
      beschreibung: ''
    });
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      // Edit existing
      const updated = [...education];
      updated[editingIndex] = formData;
      onEducationUpdate(updated);
      setEditingIndex(null);
    } else {
      // Add new
      onEducationUpdate([...education, formData]);
      setIsAddingNew(false);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setFormData(education[index]);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const updated = education.filter((_, i) => i !== index);
    onEducationUpdate(updated);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
    setIsDialogOpen(false);
    resetForm();
  };

  const formatDateRange = (from: string, to: string) => {
    if (!from) return '';
    const toDisplay = to || 'Heute';
    return `${from} - ${toDisplay}`;
  };

  const handleSaveWithValidation = () => {
    // Validate date range
    if (formData.zeitraum_von && formData.zeitraum_bis) {
      const fromYear = parseInt(formData.zeitraum_von);
      const toYear = parseInt(formData.zeitraum_bis);
      if (fromYear > toYear) {
        alert('Das Startjahr muss vor dem Endjahr liegen.');
        return;
      }
    }
    handleSave();
  };

  const EducationForm = () => (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="schulform">Schulform/Abschluss</Label>
          <Input
            id="schulform"
            value={formData.schulform}
            onChange={(e) => setFormData({ ...formData, schulform: e.target.value })}
            placeholder="z.B. Abitur, Realschulabschluss"
            className="text-sm w-full"
          />
        </div>
        <div>
          <Label htmlFor="name">Institution</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="z.B. Max-Mustermann-Gymnasium"
            className="text-sm w-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="ort">Ort</Label>
          <Input
            id="ort"
            value={formData.ort}
            onChange={(e) => setFormData({ ...formData, ort: e.target.value })}
            placeholder="z.B. München"
            className="text-sm w-full"
          />
        </div>
        <div>
          <Label htmlFor="plz">PLZ</Label>
          <Input
            id="plz"
            value={formData.plz}
            onChange={(e) => setFormData({ ...formData, plz: e.target.value })}
            placeholder="80331"
            className="text-sm w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zeitraum_von">Von (Jahr)</Label>
          <Input
            id="zeitraum_von"
            type="number"
            min="1950"
            max="2040"
            value={formData.zeitraum_von}
            onChange={(e) => setFormData({ ...formData, zeitraum_von: e.target.value })}
            placeholder="z.B. 2020"
            className="text-sm w-full"
          />
        </div>
        <div>
          <Label htmlFor="zeitraum_bis">Bis (Jahr)</Label>
          <Input
            id="zeitraum_bis"
            type="number"
            min="1950"
            max="2040"
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
          placeholder="Besondere Leistungen, Schwerpunkte, etc..."
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Ausbildung
        </CardTitle>
        {isEditing && (
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neue Ausbildung hinzufügen</DialogTitle>
              </DialogHeader>
              <EducationForm />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {education.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Ausbildung hinzugefügt</p>
            {isEditing && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddingNew(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Erste Ausbildung hinzufügen
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {education
              .sort((a, b) => {
                // Sort by end year/start year (newest first)
                const aEnd = parseInt(a.zeitraum_bis) || parseInt(a.zeitraum_von) || 0;
                const bEnd = parseInt(b.zeitraum_bis) || parseInt(b.zeitraum_von) || 0;
                return bEnd - aEnd;
              })
              .map((edu, index) => (
              <div key={index} className="relative group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-6 w-6 text-accent-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{edu.schulform}</h3>
                        <p className="text-primary font-medium">{edu.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {edu.ort}{edu.plz && `, ${edu.plz}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateRange(edu.zeitraum_von, edu.zeitraum_bis || 'present')}
                          </span>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4">
                              <DialogHeader className="text-left pb-2">
                                <DialogTitle className="text-lg">Ausbildung bearbeiten</DialogTitle>
                              </DialogHeader>
                              <div className="w-full">
                                <EducationForm />
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {edu.beschreibung && (
                      <p className="text-muted-foreground mt-3 leading-relaxed">
                        {edu.beschreibung}
                      </p>
                    )}
                  </div>
                </div>
                
                {index < education.length - 1 && (
                  <div className="mt-6 border-b border-border/50" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};