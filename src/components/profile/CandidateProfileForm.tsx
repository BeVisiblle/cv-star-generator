import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Temporary placeholder components
const ProgressRing = ({ progress, size }: { progress: number; size?: number }) => (
  <div className="text-sm text-muted-foreground">{progress}%</div>
);

const MapPicker = ({ value, onChange }: { value: any; onChange: (point: any) => void }) => (
  <div className="p-4 border rounded text-sm text-muted-foreground">
    Map picker placeholder
  </div>
);

const TagInput = ({ value, onChange, placeholder }: { value: string[]; onChange: (tags: string[]) => void; placeholder?: string }) => (
  <div className="p-4 border rounded text-sm text-muted-foreground">
    Skills: {value.join(', ') || 'None'}
  </div>
);

interface CandidateProfileFormProps {
  initialData?: any;
  candidateId?: string;
  onSave?: (data: any) => Promise<void>;
  onComplete?: (completeness: number) => void;
}

export function CandidateProfileForm({ candidateId, onSave, onComplete }: CandidateProfileFormProps) {
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    geburtsdatum: '',
    home_point: null,
    commute_mode: 'car',
    max_commute_minutes: 30,
    willing_to_relocate: false,
    relocation_cities: [],
    language_at_work: 'de',
    availability_date: '',
    stage: 'available',
    bio_short: '',
    bio_long: '',
    skills: [],
    certs: [],
    education: [],
    experience: []
  });

  const [completeness, setCompleteness] = useState(0);
  const [saving, setSaving] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.vorname || formData.nachname) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleSave = async () => {
    if (!onSave) return;
    
    setSaving(true);
    try {
      await onSave(formData);
      // Calculate completeness
      const newCompleteness = calculateCompleteness(formData);
      setCompleteness(newCompleteness);
      onComplete?.(newCompleteness);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateCompleteness = (data: any) => {
    const fields = [
      'vorname', 'nachname', 'email', 'telefon', 'geburtsdatum',
      'home_point', 'commute_mode', 'language_at_work', 'stage',
      'skills', 'education', 'experience'
    ];
    
    const filledFields = fields.filter(field => {
      const value = data[field];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    });
    
    return Math.round((filledFields.length / fields.length) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profil bearbeiten</h1>
        <div className="flex items-center gap-4">
          {saving && <span className="text-sm text-gray-500">Speichert...</span>}
          <ProgressRing progress={completeness} size={40} />
        </div>
      </div>

      {/* Personal Information */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Persönliche Informationen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vorname">Vorname</Label>
            <Input
              id="vorname"
              value={formData.vorname}
              onChange={(e) => setFormData({...formData, vorname: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="nachname">Nachname</Label>
            <Input
              id="nachname"
              value={formData.nachname}
              onChange={(e) => setFormData({...formData, nachname: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              value={formData.telefon}
              onChange={(e) => setFormData({...formData, telefon: e.target.value})}
            />
          </div>
        </div>
      </section>

      {/* Location & Mobility */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Standort & Mobilität</h2>
        <div className="space-y-4">
          <div>
            <Label>Wohnort</Label>
            <MapPicker
              value={formData.home_point}
              onChange={(point) => setFormData({...formData, home_point: point})}
            />
          </div>
          <div>
            <Label htmlFor="commute_mode">Verkehrsmittel</Label>
            <Select
              value={formData.commute_mode}
              onValueChange={(value) => setFormData({...formData, commute_mode: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Auto</SelectItem>
                <SelectItem value="public">ÖPNV</SelectItem>
                <SelectItem value="bike">Fahrrad</SelectItem>
                <SelectItem value="walk">Zu Fuß</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="max_commute">Max. Pendelzeit (Minuten)</Label>
            <Input
              id="max_commute"
              type="number"
              value={formData.max_commute_minutes}
              onChange={(e) => setFormData({...formData, max_commute_minutes: parseInt(e.target.value)})}
            />
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Fähigkeiten</h2>
        <TagInput
          value={formData.skills}
          onChange={(skills) => setFormData({...formData, skills})}
          placeholder="Füge Fähigkeiten hinzu..."
        />
      </section>

      {/* Bio */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Über mich</h2>
        <div>
          <Label htmlFor="bio_short">Kurze Beschreibung</Label>
          <Textarea
            id="bio_short"
            placeholder="Erzähle kurz über dich..."
            value={formData.bio_short}
            onChange={(e) => setFormData({...formData, bio_short: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="bio_long">Ausführliche Beschreibung</Label>
          <Textarea
            id="bio_long"
            placeholder="Erzähle ausführlich über deine Erfahrungen..."
            value={formData.bio_long}
            onChange={(e) => setFormData({...formData, bio_long: e.target.value})}
          />
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Speichert...' : 'Speichern'}
        </Button>
      </div>
    </div>
  );
}
