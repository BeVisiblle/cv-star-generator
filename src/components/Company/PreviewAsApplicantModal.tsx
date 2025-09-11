import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Eye } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';

interface PreviewAsApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewAsApplicantModal({ isOpen, onClose }: PreviewAsApplicantModalProps) {
  const { company } = useCompany();

  // Move early return after hooks
  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <DialogTitle>Vorschau als Bewerber</DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4">
          {/* Company Profile Preview - Mirror of how applicants see it */}
          <div className="bg-muted/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-4">
              So sehen Bewerber Ihr Unternehmensprofil:
            </p>
            
            {/* Header Image */}
            {company.header_image && (
              <div className="w-full h-48 mb-6 rounded-lg overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5">
                <img 
                  src={company.header_image} 
                  alt={`${company.name} Header`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Company Info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-background border">
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} Logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{company.name}</h2>
                {company.industry && (
                  <p className="text-muted-foreground mb-1">{company.industry}</p>
                )}
                {company.main_location && (
                  <p className="text-muted-foreground mb-1">{company.main_location}</p>
                )}
                {company.employee_count && (
                  <p className="text-sm text-muted-foreground">
                    {company.employee_count} Mitarbeiter
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {company.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Über uns</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </div>
            )}

            {/* Mission Statement */}
            {company.mission_statement && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Unsere Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {company.mission_statement}
                </p>
              </div>
            )}

            {/* Benefits */}
            {company.matching_benefits_text && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Was wir bieten</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {company.matching_benefits_text}
                </p>
              </div>
            )}

            {/* Contact Info */}
            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-semibold mb-3">Kontakt</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {company.website_url && (
                  <div>
                    <span className="font-medium">Website:</span>
                    <a 
                      href={company.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline"
                    >
                      {company.website_url}
                    </a>
                  </div>
                )}
                {company.primary_email && (
                  <div>
                    <span className="font-medium">E-Mail:</span>
                    <span className="ml-2 text-muted-foreground">{company.primary_email}</span>
                  </div>
                )}
                {company.phone && (
                  <div>
                    <span className="font-medium">Telefon:</span>
                    <span className="ml-2 text-muted-foreground">{company.phone}</span>
                  </div>
                )}
                {company.linkedin_url && (
                  <div>
                    <span className="font-medium">LinkedIn:</span>
                    <a 
                      href={company.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline"
                    >
                      LinkedIn Profil
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Vorschau schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}