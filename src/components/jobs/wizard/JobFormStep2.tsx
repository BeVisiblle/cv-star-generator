import { useState } from "react";
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

  const handleAISuggest = async () => {
    if (!formData.title) {
      toast.error('Bitte gib zuerst einen Stellentitel in Schritt 1 ein');
      return;
    }

    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggest-job-skills', {
        body: {
          profession: formData.title,
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
    setFormData(data);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skills & Anforderungen</h2>
          <p className="text-muted-foreground">Definiere die wichtigsten Fähigkeiten</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAISuggest}
          disabled={isLoadingAI}
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
            <Button type="button" variant="outline" onClick={prevStep}>
              Zurück
            </Button>
            <Button type="submit">
              Weiter
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}