import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJobForm } from "@/contexts/JobFormContext";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const INDUSTRIES = [
  'IT & Technologie',
  'Handwerk',
  'Gesundheit & Pflege',
  'Einzelhandel',
  'Gastronomie',
  'Logistik',
  'Finanzwesen',
  'Bildung',
  'Industrie',
  'Öffentlicher Dienst'
];

export function JobFormStep1() {
  const { formData, setFormData, nextStep } = useJobForm();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const form = useForm({
    defaultValues: {
      title: formData.title,
      industry: formData.industry,
      city: formData.city,
      employment_type: formData.employment_type,
      start_date: formData.start_date,
    },
  });

  const handleAISuggest = async () => {
    const title = form.watch('title');
    const industry = form.watch('industry');
    
    if (!title || !industry) {
      toast.error('Bitte gib zuerst Jobtitel und Branche ein');
      return;
    }

    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggest-job-title', {
        body: { title, industry },
      });

      if (error) throw error;

      if (data?.suggestions) {
        toast.success('AI-Vorschläge erhalten!');
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

  // Get tomorrow's date for minimum start_date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Basisinformationen</h2>
          <p className="text-muted-foreground">Grundlegende Details zur Stelle</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAISuggest}
          disabled={isLoadingAI}
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isLoadingAI ? 'Lädt...' : 'AI-Hilfe'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: "Jobtitel ist erforderlich" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jobtitel</FormLabel>
                <FormControl>
                  <Input
                    placeholder="z.B. Ausbildung zum Elektroniker (m/w/d)"
                    {...field}
                    className="text-base h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            rules={{ required: "Branche ist erforderlich" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branche</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Branche auswählen..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            rules={{ required: "Standort ist erforderlich" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Standort</FormLabel>
                <FormControl>
                  <Input
                    placeholder="z.B. Berlin"
                    {...field}
                    className="text-base h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employment_type"
            rules={{ required: "Anstellungsart ist erforderlich" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anstellungsart</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Anstellungsart wählen..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="apprenticeship">Ausbildung</SelectItem>
                    <SelectItem value="fulltime">Vollzeit</SelectItem>
                    <SelectItem value="parttime">Teilzeit</SelectItem>
                    <SelectItem value="internship">Praktikum</SelectItem>
                    <SelectItem value="temporary">Zeitarbeit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_date"
            rules={{ required: "Startdatum ist erforderlich" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gewünschtes Startdatum</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={minDate}
                    {...field}
                    className="text-base h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg">
              Weiter
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
