import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Edit, X } from 'lucide-react';
import JobCandidatePreview from '../jobs/JobCandidatePreview';

interface JobCandidatePreviewDialogProps {
  job: any;
  company: any;
  onEdit?: () => void;
  trigger?: React.ReactNode;
}

export default function JobCandidatePreviewDialog({ 
  job, 
  company, 
  onEdit, 
  trigger 
}: JobCandidatePreviewDialogProps) {
  // Konvertiere Job-Daten zu JobFormData Format
  const formData = {
    title: job.title || '',
    job_type: job.job_type || 'professional',
    team_department: job.team_department || '',
    role_family: job.role_family || '',
    description: job.description || job.description_md || '',
    work_mode: job.work_mode || 'onsite',
    city: job.city || '',
    address_street: job.address_street || '',
    address_number: job.address_number || '',
    postal_code: job.postal_code || '',
    state: job.state || '',
    country: job.country || 'Deutschland',
    public_transport: job.public_transport || false,
    parking_available: job.parking_available || false,
    barrier_free_access: job.barrier_free_access || false,
    commute_distance_km: job.commute_distance_km || 0,
    employment_type: job.employment_type || 'fulltime',
    start_immediately: job.start_immediately || false,
    start_date: job.start_date || '',
    end_date: job.end_date || '',
    hours_per_week_min: job.hours_per_week_min || 0,
    hours_per_week_max: job.hours_per_week_max || 0,
    salary_min: job.salary_min || 0,
    salary_max: job.salary_max || 0,
    salary_currency: job.salary_currency || 'EUR',
    salary_interval: job.salary_interval || 'month',
    tasks_description: job.tasks_description || '',
    requirements_description: job.requirements_description || '',
    benefits_description: job.benefits_description || '',
    contact_person_name: job.contact_person_name || '',
    contact_person_role: job.contact_person_role || '',
    contact_person_email: job.contact_person_email || '',
    contact_person_phone: job.contact_person_phone || '',
    company_description: job.company_description || '',
    application_deadline: job.application_deadline || '',
    application_url: job.application_url || '',
    application_email: job.application_email || '',
    application_instructions: job.application_instructions || '',
    is_featured: job.is_featured || false,
    featured_until: job.featured_until || '',
    is_urgent: job.is_urgent || false,
    tags: job.tags || [],
    external_id: job.external_id || '',
    source: job.source || 'manual',
    visa_sponsorship: job.visa_sponsorship || false,
    relocation_support: job.relocation_support || false,
    travel_percentage: job.travel_percentage || 0,
    skills: job.skills || [],
    languages: job.languages || [],
    certifications: job.certifications || [],
    driving_licenses: job.driving_licenses || [],
    internship_data: job.internship_data || null,
    apprenticeship_data: job.apprenticeship_data || null,
    professional_data: job.professional_data || null,
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Kandidaten-Ansicht
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            So sehen Kandidaten diese Stellenanzeige
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <JobCandidatePreview 
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
  );
}
