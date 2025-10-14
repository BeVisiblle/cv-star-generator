import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useJobForm } from "@/contexts/JobFormContext";
import { SkillSelector } from "../SkillSelector";
import { LanguageSelector } from "../LanguageSelector";
import { CertificationInput } from "../CertificationInput";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INDUSTRY_SKILLS_MAP: Record<string, string[]> = {
  'IT & Technologie': ['JavaScript', 'Python', 'React', 'SQL', 'Git', 'Teamarbeit', 'Problemlösung'],
  'Handwerk': ['Handwerkliches Geschick', 'Technisches Verständnis', 'Präzision', 'Sorgfalt', 'Teamarbeit'],
  'Gesundheit & Pflege': ['Empathie', 'Kommunikation', 'Belastbarkeit', 'Teamarbeit', 'Verantwortungsbewusstsein'],
  'Einzelhandel': ['Kundenorientierung', 'Kommunikation', 'Verkaufstalent', 'Teamarbeit', 'Flexibilität'],
  'Gastronomie': ['Gastfreundschaft', 'Stressresistenz', 'Teamarbeit', 'Hygienebewusstsein', 'Flexibilität'],
  'Logistik': ['Organisationstalent', 'Sorgfalt', 'Belastbarkeit', 'Zeitmanagement', 'Teamarbeit'],
  'Finanzwesen': ['Analytisches Denken', 'Zahlenverständnis', 'Sorgfalt', 'Kommunikation', 'Vertraulichkeit'],
  'Bildung': ['Pädagogisches Geschick', 'Kommunikation', 'Geduld', 'Kreativität', 'Empathie'],
  'Industrie': ['Technisches Verständnis', 'Präzision', 'Teamarbeit', 'Sorgfalt', 'Belastbarkeit'],
  'Öffentlicher Dienst': ['Zuverlässigkeit', 'Kommunikation', 'Organisationstalent', 'Vertraulichkeit', 'Teamarbeit']
};

export function JobFormStep2() {
  const { formData, setFormData, nextStep, prevStep } = useJobForm();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const form = useForm({
    defaultValues: {
      skills: formData.skills,
      required_languages: formData.required_languages,
      certifications: formData.certifications,
    },
  });

  // Auto-suggest skills based on industry when component mounts
  useEffect(() => {
    if (formData.industry && formData.skills.length === 0) {
      const suggestedSkills = INDUSTRY_SKILLS_MAP[formData.industry] || [];
      if (suggestedSkills.length > 0) {
        const defaultSkills = suggestedSkills.slice(0, 5).map(name => ({
          name,
          level: 'must_have' as const
        }));
        form.setValue('skills', defaultSkills);
      }
    }
  }, [formData.industry]);

  const handleAISuggest = async () => {
    if (!formData.title || !formData.industry) {
      toast.error('Bitte gib zuerst Jobtitel und Branche in Schritt 1 ein');
      return;
    }

    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggest-job-skills', {
        body: {
          profession: formData.title,
          industry: formData.industry,
          employmentType: formData.employment_type,
        },
      });

      if (error) throw error;

      if (data?.skills) {
        form.setValue('skills', data.skills);
        toast.success('AI-Vorschläge geladen!');
      }
    } catch (error: any) {
      console.error('AI suggest error:', error);
      toast.error(error.message || 'Fehler beim Laden der Vorschläge');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const onSubmit = (data: any) => {
    // Validate: max 5 must_have and max 5 nice_to_have
    const mustHave = data.skills.filter((s: any) => s.level === 'must_have');
    const niceToHave = data.skills.filter((s: any) => s.level === 'nice_to_have');
    
    if (mustHave.length > 5) {
      toast.error('Maximal 5 Must-Have Fähigkeiten erlaubt');
      return;
    }
    if (niceToHave.length > 5) {
      toast.error('Maximal 5 Nice-to-Have Fähigkeiten erlaubt');
      return;
    }
    
    setFormData(data);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skills & Anforderungen</h2>
          <p className="text-muted-foreground">Definiere die wichtigsten Fähigkeiten (max. 5 Must-Have, max. 5 Nice-to-Have)</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAISuggest}
          disabled={isLoadingAI}
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isLoadingAI ? 'Lädt...' : 'AI-Vorschläge'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <SkillSelector
            value={form.watch('skills')}
            onChange={(skills) => form.setValue('skills', skills)}
          />

          <LanguageSelector
            value={form.watch('required_languages')}
            onChange={(langs) => form.setValue('required_languages', langs)}
          />

          <CertificationInput
            value={form.watch('certifications')}
            onChange={(certs) => form.setValue('certifications', certs)}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={prevStep} size="lg">
              Zurück
            </Button>
            <Button type="submit" size="lg">
              Weiter
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
