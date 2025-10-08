import { Button } from "@/components/ui/button";
import { useJobForm } from "@/contexts/JobFormContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Calendar, DollarSign, Clock, Globe } from "lucide-react";

interface JobFormStep5Props {
  onSubmit: () => void;
  isLoading?: boolean;
}

export function JobFormStep5({ onSubmit, isLoading }: JobFormStep5Props) {
  const { formData, prevStep } = useJobForm();

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'must_have': return 'Must-Have';
      case 'nice_to_have': return 'Nice-to-Have';
      case 'trainable': return 'Trainable';
      default: return level;
    }
  };

  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case 'apprenticeship': return 'Ausbildung';
      case 'dual_study': return 'Duales Studium';
      case 'internship': return 'Praktikum';
      case 'full_time': return 'Vollzeit';
      default: return type;
    }
  };

  const getWorkModeLabel = (mode?: string) => {
    switch (mode) {
      case 'remote': return 'Remote';
      case 'hybrid': return 'Hybrid';
      case 'onsite': return 'Vor Ort';
      default: return 'Nicht angegeben';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vorschau & Veröffentlichen</h2>
        <p className="text-muted-foreground">Prüfe deine Stellenanzeige vor der Veröffentlichung</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{formData.title}</CardTitle>
          <CardDescription className="flex flex-wrap gap-3 text-base">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {formData.city}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {getEmploymentTypeLabel(formData.employment_type)}
            </span>
            {formData.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(formData.start_date).toLocaleDateString('de-DE')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Skills */}
          {formData.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Anforderungen
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, i) => (
                  <Badge key={i} variant={skill.level === 'must_have' ? 'destructive' : 'secondary'}>
                    {skill.name} <span className="text-xs opacity-70 ml-1">({getLevelLabel(skill.level)})</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {formData.required_languages.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Sprachen
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.required_languages.map((lang, i) => (
                  <Badge key={i} variant="outline">
                    {lang.language} ({lang.level})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {formData.certifications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Zertifikate</h3>
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map((cert, i) => (
                  <Badge key={i} variant="secondary">{cert}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {formData.tasks_md && (
            <div>
              <h3 className="font-semibold mb-2">Deine Aufgaben</h3>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                {formData.tasks_md}
              </div>
            </div>
          )}

          {/* Requirements */}
          {formData.requirements_md && (
            <div>
              <h3 className="font-semibold mb-2">Das bringst du mit</h3>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                {formData.requirements_md}
              </div>
            </div>
          )}

          {/* Benefits */}
          {formData.benefits_description && (
            <div>
              <h3 className="font-semibold mb-2">Das bieten wir</h3>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                {formData.benefits_description}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {(formData.salary_min || formData.salary_max) && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {formData.salary_min && formData.salary_max
                    ? `${formData.salary_min.toLocaleString()} - ${formData.salary_max.toLocaleString()} €/Jahr`
                    : formData.salary_min
                    ? `Ab ${formData.salary_min.toLocaleString()} €/Jahr`
                    : `Bis ${formData.salary_max?.toLocaleString()} €/Jahr`}
                </span>
              </div>
            )}
            {formData.work_mode && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{getWorkModeLabel(formData.work_mode)}</span>
              </div>
            )}
            {formData.working_hours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formData.working_hours}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Zurück
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? 'Wird erstellt...' : 'Jetzt veröffentlichen'}
        </Button>
      </div>
    </div>
  );
}