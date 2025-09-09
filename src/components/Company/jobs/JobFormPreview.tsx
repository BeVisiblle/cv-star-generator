import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Clock, Euro, Edit } from 'lucide-react';
import { JobFormData } from './JobCreationWizard';

interface JobFormPreviewProps {
  formData: JobFormData;
  company: any;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export default function JobFormPreview({ formData, company, onEdit, showEditButton = false }: JobFormPreviewProps) {
  const formatSalary = () => {
    if (!formData.salary_min && !formData.salary_max) return 'Gehalt auf Anfrage';
    
    const currency = formData.salary_currency || 'EUR';
    const interval = formData.salary_interval === 'year' ? 'Jahr' : 'Monat';
    
    if (formData.salary_min && formData.salary_max) {
      return `${formData.salary_min.toLocaleString()} - ${formData.salary_max.toLocaleString()} ${currency}/${interval}`;
    } else if (formData.salary_min) {
      return `ab ${formData.salary_min.toLocaleString()} ${currency}/${interval}`;
    } else if (formData.salary_max) {
      return `bis ${formData.salary_max.toLocaleString()} ${currency}/${interval}`;
    }
    
    return 'Gehalt auf Anfrage';
  };

  const getWorkModeLabel = (mode: string) => {
    const modes: { [key: string]: string } = {
      'onsite': 'Vor Ort',
      'remote': 'Remote',
      'hybrid': 'Hybrid'
    };
    return modes[mode] || mode;
  };

  const getEmploymentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'fulltime': 'Vollzeit',
      'parttime': 'Teilzeit',
      'contract': 'Vertrag',
      'internship': 'Praktikum',
      'apprenticeship': 'Ausbildung'
    };
    return types[type] || type;
  };

  const getJobTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'professional': 'Fachkraft',
      'apprenticeship': 'Ausbildung',
      'internship': 'Praktikum'
    };
    return types[type] || type;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{formData.title || 'Stellenanzeige'}</h1>
          <p className="text-lg text-muted-foreground mt-2">{company?.name || 'Unternehmen'}</p>
        </div>
        {showEditButton && onEdit && (
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Bearbeiten
          </Button>
        )}
      </div>

      {/* Job Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Unternehmen</p>
                <p className="font-semibold">{company?.name || 'Unternehmen'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Standort</p>
                <p className="font-semibold">{formData.city || 'N/A'}, {formData.country || 'Deutschland'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Arbeitsmodus</p>
                <p className="font-semibold">{getWorkModeLabel(formData.work_mode || 'onsite')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Gehalt</p>
                <p className="font-semibold">{formatSalary()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Stellenbeschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {formData.description_md ? (
                  <div dangerouslySetInnerHTML={{ __html: formData.description_md }} />
                ) : (
                  <p className="text-muted-foreground">Keine Beschreibung verfügbar.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          {formData.tasks_description && (
            <Card>
              <CardHeader>
                <CardTitle>Aufgaben</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formData.tasks_description }} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {formData.requirements_description && (
            <Card>
              <CardHeader>
                <CardTitle>Anforderungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formData.requirements_description }} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {formData.benefits_description && (
            <Card>
              <CardHeader>
                <CardTitle>Leistungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formData.benefits_description }} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Type & Employment */}
          <Card>
            <CardHeader>
              <CardTitle>Job-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Kategorie</p>
                <p className="font-semibold">{getJobTypeLabel(formData.job_type || 'professional')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Anstellungsart</p>
                <p className="font-semibold">{getEmploymentTypeLabel(formData.employment_type || 'fulltime')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {formData.skills && formData.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fähigkeiten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {formData.languages && formData.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sprachen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((language, index) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.contact_person_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Ansprechpartner</p>
                  <p className="font-semibold">{formData.contact_person_name}</p>
                </div>
              )}
              {formData.contact_person_email && (
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <p className="font-semibold">{formData.contact_person_email}</p>
                </div>
              )}
              {formData.contact_person_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-semibold">{formData.contact_person_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle>Bewerbung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.application_deadline && (
                <div>
                  <p className="text-sm text-muted-foreground">Bewerbungsfrist</p>
                  <p className="font-semibold">
                    {new Date(formData.application_deadline).toLocaleDateString('de-DE')}
                  </p>
                </div>
              )}
              {formData.application_url && (
                <div>
                  <p className="text-sm text-muted-foreground">Bewerbungs-URL</p>
                  <a 
                    href={formData.application_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {formData.application_url}
                  </a>
                </div>
              )}
              {formData.application_email && (
                <div>
                  <p className="text-sm text-muted-foreground">Bewerbungs-E-Mail</p>
                  <p className="font-semibold">{formData.application_email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
