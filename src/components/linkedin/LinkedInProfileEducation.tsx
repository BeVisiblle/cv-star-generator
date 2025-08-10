import React, { useState } from 'react';
import { GraduationCap, Plus, Edit3, Trash2, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalizeFirst, capitalizeWords, capitalizeSentences } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<Education>({
    schulform: '',
    name: '',
    ort: '',
    plz: '',
    zeitraum_von: '',
    zeitraum_bis: '',
    beschreibung: ''
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => String(currentYear + 6 - i));

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
      setIsAddOpen(false);
    }
    // Close any open dialog
    setIsAddOpen(false);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setFormData(education[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    const updated = education.filter((_, i) => i !== index);
    onEducationUpdate(updated);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
    setIsAddOpen(false);
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
          <Select
            value={formData.schulform}
            onValueChange={(v) => setFormData({ ...formData, schulform: v })}
          >
            <SelectTrigger className="text-sm w-full">
              <SelectValue placeholder="z.B. Abitur, Realschulabschluss" />
            </SelectTrigger>
            <SelectContent className="z-[60] bg-popover">
              <SelectItem value="Abitur">Abitur</SelectItem>
              <SelectItem value="Fachabitur">Fachabitur</SelectItem>
              <SelectItem value="Realschulabschluss">Realschulabschluss</SelectItem>
              <SelectItem value="Hauptschulabschluss">Hauptschulabschluss</SelectItem>
              <SelectItem value="Ausbildung">Ausbildung</SelectItem>
              <SelectItem value="Berufsschule">Berufsschule</SelectItem>
              <SelectItem value="Bachelor">Bachelor</SelectItem>
              <SelectItem value="Master">Master</SelectItem>
              <SelectItem value="Sonstiges">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="name">Institution</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={(e) => setFormData({ ...formData, name: capitalizeWords(e.target.value) })}
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
            onBlur={(e) => setFormData({ ...formData, ort: capitalizeWords(e.target.value) })}
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
            inputMode="numeric"
            pattern="[0-9]*"
            className="text-sm w-full"
          />
        </div>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zeitraum_von">Von (Jahr)</Label>
            <Select
              value={formData.zeitraum_von}
              onValueChange={(v) => setFormData({ ...formData, zeitraum_von: v })}
            >
              <SelectTrigger className="text-sm w-full">
                <SelectValue placeholder="z.B. 2020" />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-popover max-h-64">
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="zeitraum_bis">Bis (Jahr)</Label>
            <Select
              value={formData.zeitraum_bis}
              onValueChange={(v) => setFormData({ ...formData, zeitraum_bis: v })}
              disabled={!formData.zeitraum_bis && true}
            >
              <SelectTrigger className="text-sm w-full">
                <SelectValue placeholder="Leer lassen für aktuell" />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-popover max-h-64">
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="edu-current"
            checked={!formData.zeitraum_bis}
            onCheckedChange={(checked) => setFormData({ ...formData, zeitraum_bis: checked ? '' : String(currentYear) })}
          />
          <Label htmlFor="edu-current">Aktuell (bis heute)</Label>
        </div>

      <div>
        <Label htmlFor="beschreibung">Beschreibung</Label>
        <Textarea
          id="beschreibung"
          value={formData.beschreibung}
          onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
          onBlur={(e) => setFormData({ ...formData, beschreibung: capitalizeSentences(e.target.value) })}
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
      <CardHeader className="p-4 md:p-6 flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Ausbildung
        </CardTitle>
        {isEditing && (
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) {
              setIsAddingNew(false);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => { setIsAddOpen(true); setIsAddingNew(true); }}>
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
      <CardContent className="p-4 md:p-6 pt-0">
        {education.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Ausbildung hinzugefügt</p>
            {isEditing && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setIsAddOpen(true); setIsAddingNew(true); }}
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
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{edu.schulform}</h3>
                        <p className="text-primary font-medium">{edu.name}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
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
                          <Dialog open={editingIndex === index} onOpenChange={(open) => {
                            if (!open) {
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