import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Euro, 
  Briefcase, 
  Users, 
  Calendar,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  Star,
  AlertTriangle,
  Edit
} from 'lucide-react';
import { JobFormData } from '../../company/jobs/JobCreationWizard';

interface JobCandidatePreviewProps {
  formData: JobFormData;
  company: any;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export default function JobCandidatePreview({ formData, company, onEdit, showEditButton = false }: JobCandidatePreviewProps) {
  const formatSalary = (min?: number, max?: number, currency = 'EUR', interval = 'month') => {
    if (!min && !max) return 'Vergütung nach Vereinbarung';
    
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const intervalText = interval === 'month' ? 'pro Monat' : interval === 'year' ? 'pro Jahr' : 'pro Stunde';
    
    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)} ${intervalText}`;
    } else if (min) {
      return `ab ${formatAmount(min)} ${intervalText}`;
    } else if (max) {
      return `bis ${formatAmount(max)} ${intervalText}`;
    }
    
    return 'Vergütung nach Vereinbarung';
  };

  const getJobTypeLabel = (jobType: string) => {
    switch (jobType) {
      case 'internship': return 'Praktikum';
      case 'apprenticeship': return 'Ausbildung';
      case 'professional': return 'Fachkraft';
      default: return jobType;
    }
  };

  const getEmploymentTypeLabel = (employmentType: string) => {
    switch (employmentType) {
      case 'fulltime': return 'Vollzeit';
      case 'parttime': return 'Teilzeit';
      case 'minijob': return 'Minijob';
      case 'werkstudent': return 'Werkstudent';
      case 'temporary': return 'Befristet';
      case 'permanent': return 'Unbefristet';
      default: return employmentType;
    }
  };

  const getWorkModeLabel = (workMode: string) => {
    switch (workMode) {
      case 'onsite': return 'Vor Ort';
      case 'hybrid': return 'Hybrid';
      case 'remote': return 'Remote';
      default: return workMode;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{formData.title}</h1>
        <div className="flex items-center justify-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <span className="font-medium">{company?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>{formData.city}, {formData.state}</span>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {getJobTypeLabel(formData.job_type)}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {getEmploymentTypeLabel(formData.employment_type)}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {getWorkModeLabel(formData.work_mode)}
          </Badge>
          {formData.is_urgent && (
            <Badge variant="destructive" className="text-sm">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Dringend
            </Badge>
          )}
          {formData.is_featured && (
            <Badge variant="default" className="text-sm">
              <Star className="h-3 w-3 mr-1" />
              Hervorgehoben
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={company?.logo_url} alt={company?.name} />
                  <AvatarFallback>
                    <Building2 className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{company?.name}</h2>
                  <p className="text-sm text-gray-600">{company?.industry}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.company_description && (
                <p className="text-gray-700 leading-relaxed">{formData.company_description}</p>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Stellenbeschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {formData.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          {formData.tasks_description && (
            <Card>
              <CardHeader>
                <CardTitle>Ihre Aufgaben</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {formData.tasks_description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {formData.requirements_description && (
            <Card>
              <CardHeader>
                <CardTitle>Ihre Qualifikationen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {formData.requirements_description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {formData.benefits_description && (
            <Card>
              <CardHeader>
                <CardTitle>Das bieten wir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {formData.benefits_description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Button */}
          <Card>
            <CardContent className="pt-6">
              <Button className="w-full" size="lg">
                Jetzt bewerben
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Bewerbung über unsere Plattform
              </p>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Stellendetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Arbeitsort</p>
                  <p className="text-sm text-gray-600">
                    {formData.work_mode === 'remote' 
                      ? 'Remote' 
                      : `${formData.address_street} ${formData.address_number}, ${formData.postal_code} ${formData.city}`
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Arbeitszeit</p>
                  <p className="text-sm text-gray-600">
                    {formData.hours_per_week_min && formData.hours_per_week_max
                      ? `${formData.hours_per_week_min}-${formData.hours_per_week_max} Std./Woche`
                      : 'Vollzeit'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Vergütung</p>
                  <p className="text-sm text-gray-600">
                    {formatSalary(formData.salary_min, formData.salary_max, formData.salary_currency, formData.salary_interval)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Start</p>
                  <p className="text-sm text-gray-600">
                    {formData.start_immediately 
                      ? 'Sofort' 
                      : formData.start_date 
                        ? new Date(formData.start_date).toLocaleDateString('de-DE')
                        : 'Nach Vereinbarung'
                    }
                  </p>
                </div>
              </div>

              {formData.application_deadline && (
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Bewerbungsschluss</p>
                    <p className="text-sm text-orange-600">
                      {new Date(formData.application_deadline).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card>
            <CardHeader>
              <CardTitle>Ansprechpartner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{formData.contact_person_name}</p>
                <p className="text-sm text-gray-600">{formData.contact_person_role}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a 
                    href={`mailto:${formData.contact_person_email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {formData.contact_person_email}
                  </a>
                </div>
                
                {formData.contact_person_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`tel:${formData.contact_person_phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {formData.contact_person_phone}
                    </a>
                  </div>
                )}
              </div>

              {formData.application_url && (
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Externe Bewerbung
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {formData.tags && formData.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Button */}
      {showEditButton && onEdit && (
        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-center">
            <Button onClick={onEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Stellenanzeige bearbeiten
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
