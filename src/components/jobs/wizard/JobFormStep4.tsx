import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useJobForm } from "@/contexts/JobFormContext";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Salary ranges by industry and employment type (in EUR/year)
const SALARY_RANGES: Record<string, Record<string, { min: number; max: number }>> = {
  'IT & Technologie': {
    apprenticeship: { min: 1000, max: 1400 },
    fulltime: { min: 45000, max: 75000 },
    parttime: { min: 20000, max: 35000 },
    internship: { min: 800, max: 1200 },
  },
  'Handwerk': {
    apprenticeship: { min: 800, max: 1200 },
    fulltime: { min: 35000, max: 50000 },
    parttime: { min: 18000, max: 28000 },
    internship: { min: 600, max: 900 },
  },
  'Gesundheit & Pflege': {
    apprenticeship: { min: 1000, max: 1300 },
    fulltime: { min: 38000, max: 55000 },
    parttime: { min: 20000, max: 30000 },
    internship: { min: 700, max: 1000 },
  },
  'Einzelhandel': {
    apprenticeship: { min: 900, max: 1100 },
    fulltime: { min: 28000, max: 40000 },
    parttime: { min: 15000, max: 22000 },
    internship: { min: 500, max: 800 },
  },
  'Gastronomie': {
    apprenticeship: { min: 800, max: 1000 },
    fulltime: { min: 26000, max: 38000 },
    parttime: { min: 14000, max: 20000 },
    internship: { min: 500, max: 750 },
  },
  'Logistik': {
    apprenticeship: { min: 850, max: 1100 },
    fulltime: { min: 32000, max: 48000 },
    parttime: { min: 16000, max: 25000 },
    internship: { min: 600, max: 900 },
  },
  'Finanzwesen': {
    apprenticeship: { min: 1000, max: 1300 },
    fulltime: { min: 42000, max: 70000 },
    parttime: { min: 22000, max: 35000 },
    internship: { min: 800, max: 1200 },
  },
  'Bildung': {
    apprenticeship: { min: 950, max: 1200 },
    fulltime: { min: 35000, max: 55000 },
    parttime: { min: 18000, max: 28000 },
    internship: { min: 600, max: 900 },
  },
  'Industrie': {
    apprenticeship: { min: 950, max: 1300 },
    fulltime: { min: 40000, max: 60000 },
    parttime: { min: 20000, max: 32000 },
    internship: { min: 700, max: 1000 },
  },
  'Öffentlicher Dienst': {
    apprenticeship: { min: 1000, max: 1300 },
    fulltime: { min: 38000, max: 58000 },
    parttime: { min: 20000, max: 30000 },
    internship: { min: 700, max: 1000 },
  },
};

function formatSalary(amount: number, employmentType: string): string {
  if (employmentType === 'apprenticeship') {
    return `${amount.toLocaleString('de-DE')} € pro Monat`;
  } else if (employmentType === 'internship') {
    return `${amount.toLocaleString('de-DE')} € pro Monat`;
  } else {
    return `${amount.toLocaleString('de-DE')} € pro Jahr`;
  }
}

export function JobFormStep4() {
  const { formData, setFormData, nextStep, prevStep } = useJobForm();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const form = useForm({
    defaultValues: {
      salary_min: formData.salary_min,
      salary_max: formData.salary_max,
      work_mode: formData.work_mode,
      working_hours: formData.working_hours,
      is_public: formData.is_public,
    },
  });

  const handleAISuggestSalary = async () => {
    if (!formData.industry || !formData.employment_type) {
      toast.error('Bitte gib zuerst Branche und Anstellungsart ein');
      return;
    }

    setIsLoadingAI(true);
    try {
      // Use predefined ranges
      const range = SALARY_RANGES[formData.industry]?.[formData.employment_type];
      
      if (range) {
        form.setValue('salary_min', range.min);
        form.setValue('salary_max', range.max);
        toast.success(`Gehaltsvorschlag: ${formatSalary(range.min, formData.employment_type)} - ${formatSalary(range.max, formData.employment_type)}`);
      } else {
        // Fallback to AI
        const { data, error } = await supabase.functions.invoke('ai-suggest-salary', {
          body: {
            industry: formData.industry,
            employmentType: formData.employment_type,
            title: formData.title,
          },
        });

        if (error) throw error;

        if (data?.salary_min && data?.salary_max) {
          form.setValue('salary_min', data.salary_min);
          form.setValue('salary_max', data.salary_max);
          toast.success('AI-Gehaltsvorschlag geladen!');
        }
      }
    } catch (error: any) {
      console.error('AI salary suggest error:', error);
      toast.error(error.message || 'Fehler beim Laden der Gehaltsvorschläge');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const onSubmit = (data: any) => {
    setFormData(data);
    nextStep();
  };

  const salaryLabel = formData.employment_type === 'apprenticeship' || formData.employment_type === 'internship'
    ? 'Vergütung (€/Monat)'
    : 'Gehalt (€/Jahr)';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Details & Benefits</h2>
          <p className="text-muted-foreground">Zusätzliche Informationen zur Stelle</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAISuggestSalary}
          disabled={isLoadingAI}
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isLoadingAI ? 'Lädt...' : 'Gehalt vorschlagen'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="salary_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{salaryLabel} (Min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={formData.employment_type === 'apprenticeship' ? '1000' : '35000'}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      className="text-base h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary_max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{salaryLabel} (Max)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={formData.employment_type === 'apprenticeship' ? '1400' : '45000'}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      className="text-base h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {form.watch('salary_min') && form.watch('salary_max') && (
            <p className="text-sm text-muted-foreground">
              Vorgeschlagene Range: {formatSalary(form.watch('salary_min')!, formData.employment_type)} - {formatSalary(form.watch('salary_max')!, formData.employment_type)}
            </p>
          )}

          <FormField
            control={form.control}
            name="work_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arbeitsmodell</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Wähle Arbeitsmodell..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="onsite">Vor Ort</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="working_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arbeitszeiten</FormLabel>
                <FormControl>
                  <Input
                    placeholder="z.B. 40h/Woche, flexible Zeiten"
                    {...field}
                    className="text-base h-12"
                  />
                </FormControl>
                <FormDescription>
                  Beschreibe die regulären Arbeitszeiten
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Öffentlich sichtbar</FormLabel>
                  <FormDescription>
                    Stelle in der öffentlichen Jobbörse anzeigen
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={prevStep} size="lg">
              Zurück
            </Button>
            <Button type="submit" size="lg">
              Weiter zur Vorschau
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
