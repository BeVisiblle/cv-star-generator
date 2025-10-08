import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useJobForm } from "@/contexts/JobFormContext";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function JobFormStep3() {
  const { formData, setFormData, nextStep, prevStep } = useJobForm();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm({
    defaultValues: {
      description_md: formData.description_md,
      tasks_md: formData.tasks_md,
      requirements_md: formData.requirements_md,
      benefits_description: formData.benefits_description,
    },
  });

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-job-description', {
        body: {
          jobData: {
            title: formData.title,
            city: formData.city,
            employment_type: formData.employment_type,
            skills: formData.skills,
            languages: formData.required_languages,
          },
        },
      });

      if (error) throw error;

      if (data) {
        form.setValue('tasks_md', data.tasks_md);
        form.setValue('requirements_md', data.requirements_md);
        form.setValue('benefits_description', data.benefits_description);
        toast.success('Beschreibung erfolgreich generiert!');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast.error(error.message || 'Fehler beim Generieren');
    } finally {
      setIsGenerating(false);
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
          <h2 className="text-2xl font-bold">Stellenbeschreibung</h2>
          <p className="text-muted-foreground">Beschreibe die Stelle im Detail</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAIGenerate}
          disabled={isGenerating}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generiere...' : 'Mit AI generieren'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="tasks_md"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aufgaben & Tätigkeiten</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="- Diagnose und Wartung von Fahrzeugen&#10;- Reparatur mechanischer Systeme&#10;..."
                    className="min-h-[120px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requirements_md"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anforderungen (Must-Have & Nice-to-Have)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="## Must-Have&#10;- Technisches Verständnis&#10;- Handwerkliches Geschick&#10;&#10;## Nice-to-Have&#10;- Führerschein Klasse B&#10;..."
                    className="min-h-[150px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="benefits_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Benefits & Zusatzleistungen</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="- Übernahmegarantie nach Ausbildung&#10;- Modernes Werkzeug & Equipment&#10;- Team-Events&#10;..."
                    className="min-h-[120px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description_md"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zusätzliche Beschreibung (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Weitere Informationen zur Stelle..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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