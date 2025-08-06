import React, { useState } from 'react';
import { Building, Plus, Edit3, Trash2, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Experience {
  titel: string;
  unternehmen: string;
  ort: string;
  plz?: string;
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
  const [formData, setFormData] = useState<Experience>({
    titel: '',
    unternehmen: '',
    ort: '',
    plz: '',
    zeitraum_von: '',
    zeitraum_bis: '',
    beschreibung: ''
  });

  const resetForm = () => {
    setFormData({
      titel: '',
      unternehmen: '',
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
      const updated = [...experiences];
      updated[editingIndex] = formData;
      onExperiencesUpdate(updated);
      setEditingIndex(null);
    } else {
      // Add new
      onExperiencesUpdate([...experiences, formData]);
      setIsAddingNew(false);
    }
    resetForm();
  };

  const handleEdit = (index: number) => {
    setFormData(experiences[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    onExperiencesUpdate(updated);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
    resetForm();
  };

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = to === 'present' ? null : new Date(to);
    
    const fromMonth = fromDate.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
    const toMonth = toDate ? toDate.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }) : 'Heute';
    
    return `${fromMonth} - ${toMonth}`;
  };

  const ExperienceForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="titel">Position</Label>
          <Input
            id="titel"
            value={formData.titel}
            onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
            placeholder="z.B. Softwareentwickler"
          />
        </div>
        <div>
          <Label htmlFor="unternehmen">Unternehmen</Label>
          <Input
            id="unternehmen"
            value={formData.unternehmen}
            onChange={(e) => setFormData({ ...formData, unternehmen: e.target.value })}
            placeholder="z.B. Tech AG"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ort">Ort</Label>
          <Input
            id="ort"
            value={formData.ort}
            onChange={(e) => setFormData({ ...formData, ort: e.target.value })}
            placeholder="z.B. München"
          />
        </div>
        <div>
          <Label htmlFor="plz">PLZ</Label>
          <Input
            id="plz"
            value={formData.plz}
            onChange={(e) => setFormData({ ...formData, plz: e.target.value })}
            placeholder="80331"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zeitraum_von">Von</Label>
          <Input
            id="zeitraum_von"
            type="month"
            value={formData.zeitraum_von}
            onChange={(e) => setFormData({ ...formData, zeitraum_von: e.target.value })}
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
          />
        </div>
      </div>

      <div>
        <Label htmlFor="beschreibung">Beschreibung</Label>
        <Textarea
          id="beschreibung"
          value={formData.beschreibung}
          onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
          placeholder="Beschreiben Sie Ihre Tätigkeiten und Erfolge..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={handleCancel}>
          Abbrechen
        </Button>
        <Button onClick={handleSave}>
          Speichern
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Building className="h-5 w-5" />
          Berufserfahrung
        </CardTitle>
        {isEditing && (
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neue Berufserfahrung hinzufügen</DialogTitle>
              </DialogHeader>
              <ExperienceForm />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {experiences.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Berufserfahrung hinzugefügt</p>
            {isEditing && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddingNew(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Erste Erfahrung hinzufügen
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={index} className="relative group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{exp.titel}</h3>
                        <p className="text-primary font-medium">{exp.unternehmen}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {exp.ort}{exp.plz && `, ${exp.plz}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateRange(exp.zeitraum_von, exp.zeitraum_bis || 'present')}
                          </span>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(index)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Berufserfahrung bearbeiten</DialogTitle>
                              </DialogHeader>
                              <ExperienceForm />
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
                    
                    {exp.beschreibung && (
                      <p className="text-muted-foreground mt-3 leading-relaxed">
                        {exp.beschreibung}
                      </p>
                    )}
                  </div>
                </div>
                
                {index < experiences.length - 1 && (
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