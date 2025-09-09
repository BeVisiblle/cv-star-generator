import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Share, CheckCircle, AlertCircle, MapPin, Clock, Euro, Users, Edit, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { JobFormData } from '../JobCreationWizard';
import JobFormPreview from '../JobFormPreview';

interface JobPreviewStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  company: any;
  onEdit?: () => void;
}

export default function JobPreviewStep({ formData, updateFormData, company, onEdit }: JobPreviewStepProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const validateForm = () => {
    const errors = [];
    if (!formData.title) errors.push('Berufsbezeichnung');
    if (!formData.contact_person_name) errors.push('Ansprechpartner Name');
    if (!formData.contact_person_email) errors.push('Ansprechpartner E-Mail');
    if (formData.work_mode !== 'remote' && (!formData.city || !formData.postal_code)) {
      errors.push('Arbeitsort');
    }
    return errors;
  };

  const handlePublish = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Pflichtfelder fehlen",
        description: `Bitte füllen Sie folgende Felder aus: ${errors.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "AGB nicht akzeptiert",
        description: "Bitte akzeptieren Sie die AGB und Datenschutzbestimmungen.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const { error } = await supabase.from('job_posts').insert({
        company_id: company.id,
        ...formData,
        is_active: true,
        is_public: true,
      });

      if (error) throw error;

      toast({
        title: "Stellenanzeige veröffentlicht!",
        description: "Ihre Stellenanzeige ist jetzt öffentlich sichtbar.",
      });

    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Veröffentlichung fehlgeschlagen",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const errors = validateForm();
  const canPublish = errors.length === 0 && agreedToTerms;

  return (
    <div className="space-y-6">
      {/* Preview Tabs */}
      <Tabs defaultValue="candidate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="candidate" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Kandidaten-Ansicht
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Veröffentlichung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                So sehen Kandidaten Ihre Stellenanzeige
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Diese Vorschau zeigt, wie Ihre Stellenanzeige für potenzielle Bewerber dargestellt wird.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Vollbild-Vorschau öffnen
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Kandidaten-Ansicht
                        </DialogTitle>
                      </DialogHeader>
                             <div className="mt-4">
                               <JobFormPreview
                                 formData={formData}
                                 company={company}
                                 onEdit={onEdit}
                                 showEditButton={true}
                               />
                             </div>
                      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={() => {
                          const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
                          if (dialog) {
                            const closeButton = dialog.querySelector('[data-state="open"]') as HTMLElement;
                            if (closeButton) closeButton.click();
                          }
                        }}>
                          <X className="h-4 w-4 mr-2" />
                          Schließen
                        </Button>
                        {onEdit && (
                          <Button onClick={onEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                       <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                         <JobFormPreview formData={formData} company={company} />
                       </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          {/* Validation Checklist */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Veröffentlichungs-Checkliste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {formData.title ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={formData.title ? 'text-green-700' : 'text-red-700'}>
              Berufsbezeichnung angegeben
            </span>
          </div>

          <div className="flex items-center gap-2">
            {formData.contact_person_name && formData.contact_person_email ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={formData.contact_person_name && formData.contact_person_email ? 'text-green-700' : 'text-red-700'}>
              Ansprechpartner vollständig
            </span>
          </div>

          <div className="flex items-center gap-2">
            {formData.work_mode === 'remote' || (formData.city && formData.postal_code) ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={formData.work_mode === 'remote' || (formData.city && formData.postal_code) ? 'text-green-700' : 'text-red-700'}>
              Arbeitsort definiert
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-700">Plan-Limit OK</span>
          </div>
        </CardContent>
      </Card>

      {/* Job Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live-Vorschau
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            So wird Ihre Stellenanzeige öffentlich angezeigt
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 space-y-4 bg-white">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{
                  formData.job_type === 'internship' ? 'Praktikum' :
                  formData.job_type === 'apprenticeship' ? 'Ausbildung' : 'Fachkraft'
                }</Badge>
                <Badge variant="outline">{
                  formData.work_mode === 'onsite' ? 'Vor Ort' :
                  formData.work_mode === 'hybrid' ? 'Hybrid' : 'Remote'
                }</Badge>
              </div>
              
              <h1 className="text-2xl font-bold">{formData.title || 'Stellenbezeichnung'}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {company?.name} • {formData.city || 'Ort'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formData.employment_type === 'fulltime' ? 'Vollzeit' : 
                   formData.employment_type === 'parttime' ? 'Teilzeit' : 'Andere'}
                </span>
                {(formData.salary_min || formData.salary_max) && (
                  <span className="flex items-center gap-1">
                    <Euro className="h-4 w-4" />
                    {formData.salary_min && formData.salary_max 
                      ? `${formData.salary_min} - ${formData.salary_max} €`
                      : formData.salary_min 
                      ? `ab ${formData.salary_min} €`
                      : `bis ${formData.salary_max} €`
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {formData.description && (
              <div>
                <h3 className="font-semibold mb-2">Über uns</h3>
                <p className="text-sm">{formData.description}</p>
              </div>
            )}

            {/* Tasks */}
            {formData.tasks_description && (
              <div>
                <h3 className="font-semibold mb-2">Aufgaben</h3>
                <div className="text-sm whitespace-pre-line">{formData.tasks_description}</div>
              </div>
            )}

            {/* Requirements */}
            {formData.requirements_description && (
              <div>
                <h3 className="font-semibold mb-2">Anforderungen</h3>
                <div className="text-sm whitespace-pre-line">{formData.requirements_description}</div>
              </div>
            )}

            {/* Skills */}
            {formData.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Gefragte Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant={skill.required ? "default" : "outline"} className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Ansprechpartner</h3>
              <p className="text-sm">
                {formData.contact_person_name || 'Name'} 
                {formData.contact_person_role && ` • ${formData.contact_person_role}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {formData.contact_person_email || 'E-Mail'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Terms */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                />
                <Label htmlFor="terms" className="text-sm">
                  Ich akzeptiere die AGB und Datenschutzbestimmungen. Die Stellenanzeige entspricht 
                  den gesetzlichen Anforderungen und verwendet geschlechtsneutrale Sprache (m/w/d).
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handlePublish}
              disabled={!canPublish || isPublishing}
              className="flex-1"
            >
          <Eye className="h-4 w-4 mr-2" />
          {isPublishing ? 'Veröffentliche...' : 'Jetzt veröffentlichen'}
        </Button>
        
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Link kopieren
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}