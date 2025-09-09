import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, User, Mail, Phone } from 'lucide-react';
import { JobFormData } from '../JobCreationWizard';

interface JobCompanyStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  company: any;
}

export default function JobCompanyStep({ formData, updateFormData, company }: JobCompanyStepProps) {
  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Unternehmensdarstellung
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Diese Informationen werden aus Ihrem Unternehmensprofil übernommen und können für diese Stellenanzeige angepasst werden.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Company Preview */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={company?.logo_url} alt={company?.name} />
              <AvatarFallback>
                <Building className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{company?.name}</h3>
              <p className="text-sm text-muted-foreground">{company?.industry}</p>
              <p className="text-sm text-muted-foreground">{company?.main_location}</p>
            </div>
          </div>

          {/* Company Description for Job */}
          <div>
            <Label htmlFor="company_description">Kurzbeschreibung für Stellenanzeige</Label>
            <p className="text-xs text-muted-foreground mb-2">
              250-500 Zeichen • Wird in der Stellenanzeige angezeigt
            </p>
            <Textarea
              id="company_description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder={company?.description || "Beschreiben Sie Ihr Unternehmen für potentielle Bewerber..."}
              className="min-h-[100px]"
              maxLength={500}
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {formData.description.length}/500 Zeichen
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Person */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Ansprechpartner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_name">Name *</Label>
              <Input
                id="contact_name"
                value={formData.contact_person_name}
                onChange={(e) => updateFormData({ contact_person_name: e.target.value })}
                placeholder="Max Mustermann"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="contact_role">Position/Rolle *</Label>
              <Input
                id="contact_role"
                value={formData.contact_person_role}
                onChange={(e) => updateFormData({ contact_person_role: e.target.value })}
                placeholder="Personalleiter, HR Manager"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">E-Mail *</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_person_email}
                onChange={(e) => updateFormData({ contact_person_email: e.target.value })}
                placeholder="jobs@unternehmen.de"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Telefon</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_person_phone}
                onChange={(e) => updateFormData({ contact_person_phone: e.target.value })}
                placeholder="+49 123 456789"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vorschau Ansprechpartner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Avatar>
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {formData.contact_person_name || 'Name erforderlich'}
              </p>
              <p className="text-sm text-muted-foreground">
                {formData.contact_person_role || 'Position'}
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm">
                {formData.contact_person_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {formData.contact_person_email}
                  </span>
                )}
                {formData.contact_person_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {formData.contact_person_phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}