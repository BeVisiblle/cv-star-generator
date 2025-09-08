import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Star, Target, Wrench, Shield } from 'lucide-react';
import { JobFormData } from '../JobCreationWizard';

interface JobSkillsStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  company: any;
}

const SKILL_LEVELS = [
  { value: 1, label: 'Grundkenntnisse' },
  { value: 2, label: 'Fortgeschritten' },
  { value: 3, label: 'Erfahren' },
  { value: 4, label: 'Experte' },
  { value: 5, label: 'Meister' },
];

const COMMON_SKILLS = [
  'Microsoft Office', 'Excel', 'PowerPoint', 'Word', 'Outlook',
  'SAP', 'AutoCAD', 'SolidWorks', 'Photoshop', 'Illustrator',
  'JavaScript', 'Python', 'Java', 'React', 'Node.js',
  'Projektmanagement', 'Teamführung', 'Kundenbetreuung',
  'Qualitätssicherung', 'Lean Management', 'Six Sigma',
  'Schweißen', 'CNC-Programmierung', 'PLC-Programmierung',
  'Elektrotechnik', 'Maschinenbau', 'Automatisierung',
];

const DRIVING_LICENSE_CLASSES = [
  'AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE'
];

const COMMON_CERTIFICATIONS = [
  'Erste Hilfe', 'Staplerschein', 'Kranschein', 'Schweißerschein',
  'DGUV V3', 'SCC', 'Arbeitsschutz', 'Qualitätsmanagement',
  'Microsoft Certified', 'Google Analytics', 'AWS Certified',
  'PMP', 'Scrum Master', 'ITIL Foundation',
];

export default function JobSkillsStep({ formData, updateFormData, company }: JobSkillsStepProps) {
  const [newSkillName, setNewSkillName] = useState('');
  const [newCertName, setNewCertName] = useState('');
  const [newCertAuthority, setNewCertAuthority] = useState('');

  const addSkill = (skillName: string, level: number = 3, required: boolean = false) => {
    if (!skillName.trim()) return;
    
    const newSkill = { name: skillName.trim(), level, required };
    const existingIndex = formData.skills.findIndex(skill => skill.name.toLowerCase() === skillName.toLowerCase());
    
    if (existingIndex >= 0) {
      // Update existing skill
      const updatedSkills = [...formData.skills];
      updatedSkills[existingIndex] = newSkill;
      updateFormData({ skills: updatedSkills });
    } else {
      // Add new skill
      updateFormData({ skills: [...formData.skills, newSkill] });
    }
    
    setNewSkillName('');
  };

  const removeSkill = (index: number) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    updateFormData({ skills: updatedSkills });
  };

  const updateSkill = (index: number, updates: Partial<typeof formData.skills[0]>) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = { ...updatedSkills[index], ...updates };
    updateFormData({ skills: updatedSkills });
  };

  const addCertification = () => {
    if (!newCertName.trim()) return;
    
    const newCert = { 
      name: newCertName.trim(), 
      authority: newCertAuthority.trim() || '', 
      required: false 
    };
    updateFormData({ certifications: [...formData.certifications, newCert] });
    setNewCertName('');
    setNewCertAuthority('');
  };

  const removeCertification = (index: number) => {
    const updated = formData.certifications.filter((_, i) => i !== index);
    updateFormData({ certifications: updated });
  };

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...formData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ certifications: updated });
  };

  const addDrivingLicense = (licenseClass: string) => {
    if (formData.driving_licenses.some(dl => dl.class === licenseClass)) return;
    
    const newLicense = { class: licenseClass, required: false };
    updateFormData({ driving_licenses: [...formData.driving_licenses, newLicense] });
  };

  const removeDrivingLicense = (index: number) => {
    const updated = formData.driving_licenses.filter((_, i) => i !== index);
    updateFormData({ driving_licenses: updated });
  };

  const updateDrivingLicense = (index: number, required: boolean) => {
    const updated = [...formData.driving_licenses];
    updated[index] = { ...updated[index], required };
    updateFormData({ driving_licenses: updated });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Fähigkeiten</TabsTrigger>
          <TabsTrigger value="requirements">Anforderungen</TabsTrigger>
          <TabsTrigger value="certifications">Zertifikate</TabsTrigger>
          <TabsTrigger value="licenses">Führerscheine</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Fähigkeiten & Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new skill */}
              <div className="flex gap-2">
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Neue Fähigkeit hinzufügen..."
                  onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkillName)}
                />
                <Button onClick={() => addSkill(newSkillName)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Common skills suggestions */}
              <div>
                <Label className="text-sm text-muted-foreground">Häufige Skills:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {COMMON_SKILLS.slice(0, 12).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer text-xs hover:bg-muted"
                      onClick={() => addSkill(skill)}
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skills list */}
              <div className="space-y-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(index, { name: e.target.value })}
                        className="font-medium"
                      />
                    </div>
                    
                    <Select 
                      value={skill.level.toString()} 
                      onValueChange={(value) => updateSkill(index, { level: parseInt(value) })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value.toString()}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={skill.required}
                        onCheckedChange={(checked) => updateSkill(index, { required: !!checked })}
                      />
                      <Label className="text-xs">Pflicht</Label>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeSkill(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Anforderungen & Erwartungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tasks_description">Aufgaben & Tätigkeiten</Label>
                <Textarea
                  id="tasks_description"
                  value={formData.tasks_description}
                  onChange={(e) => updateFormData({ tasks_description: e.target.value })}
                  placeholder="• Inbetriebnahme & Wartung elektrischer Anlagen&#10;• Störungsanalyse und -beseitigung&#10;• Dokumentation von Arbeitsabläufen&#10;• Zusammenarbeit mit verschiedenen Abteilungen"
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="requirements_description">Anforderungen</Label>
                <Textarea
                  id="requirements_description"
                  value={formData.requirements_description}
                  onChange={(e) => updateFormData({ requirements_description: e.target.value })}
                  placeholder="• Abgeschlossene Berufsausbildung als Elektroniker&#10;• Erfahrung in der Instandhaltung elektrischer Anlagen&#10;• Führerschein Klasse B&#10;• Teamfähigkeit und selbstständige Arbeitsweise"
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="benefits_description">Benefits & Angebote</Label>
                <Textarea
                  id="benefits_description"
                  value={formData.benefits_description}
                  onChange={(e) => updateFormData({ benefits_description: e.target.value })}
                  placeholder="• Deutschlandticket&#10;• 30 Tage Urlaub&#10;• Betriebliche Altersvorsorge&#10;• Weiterbildungsmöglichkeiten&#10;• Flexible Arbeitszeiten&#10;• Team-Events"
                  className="mt-1 min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Zertifikate & Qualifikationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add certification */}
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  placeholder="Zertifikat/Qualifikation"
                />
                <Input
                  value={newCertAuthority}
                  onChange={(e) => setNewCertAuthority(e.target.value)}
                  placeholder="Aussteller (optional)"
                />
                <Button onClick={addCertification}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Common certifications */}
              <div>
                <Label className="text-sm text-muted-foreground">Häufige Zertifikate:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {COMMON_CERTIFICATIONS.slice(0, 8).map((cert) => (
                    <Badge
                      key={cert}
                      variant="outline"
                      className="cursor-pointer text-xs hover:bg-muted"
                      onClick={() => {
                        setNewCertName(cert);
                        addCertification();
                      }}
                    >
                      + {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications list */}
              <div className="space-y-2">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={cert.name}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        placeholder="Zertifikat"
                      />
                      <Input
                        value={cert.authority}
                        onChange={(e) => updateCertification(index, 'authority', e.target.value)}
                        placeholder="Aussteller"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={cert.required}
                        onCheckedChange={(checked) => updateCertification(index, 'required', !!checked)}
                      />
                      <Label className="text-xs">Pflicht</Label>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeCertification(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Führerscheine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add driving license */}
              <div>
                <Label>Führerscheinklasse hinzufügen:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {DRIVING_LICENSE_CLASSES.map((licenseClass) => (
                    <Badge
                      key={licenseClass}
                      variant="outline"
                      className={`cursor-pointer text-xs hover:bg-muted ${
                        formData.driving_licenses.some(dl => dl.class === licenseClass) 
                          ? 'bg-muted line-through' 
                          : ''
                      }`}
                      onClick={() => addDrivingLicense(licenseClass)}
                    >
                      + Klasse {licenseClass}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Driving licenses list */}
              <div className="space-y-2">
                {formData.driving_licenses.map((license, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Label className="font-medium">Führerschein Klasse {license.class}</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={license.required}
                        onCheckedChange={(checked) => updateDrivingLicense(index, !!checked)}
                      />
                      <Label className="text-xs">Pflicht</Label>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeDrivingLicense(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{formData.skills.length}</div>
              <div className="text-sm text-muted-foreground">Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{formData.certifications.length}</div>
              <div className="text-sm text-muted-foreground">Zertifikate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{formData.driving_licenses.length}</div>
              <div className="text-sm text-muted-foreground">Führerscheine</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {formData.skills.filter(s => s.required).length + 
                 formData.certifications.filter(c => c.required).length + 
                 formData.driving_licenses.filter(dl => dl.required).length}
              </div>
              <div className="text-sm text-muted-foreground">Pflicht</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}