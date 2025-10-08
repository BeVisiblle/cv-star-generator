import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJobForm } from "@/contexts/JobFormContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function JobFormStep1() {
  const { formData, setFormData, nextStep } = useJobForm();
  
  const form = useForm({
    defaultValues: {
      title: formData.title,
      city: formData.city,
      employment_type: formData.employment_type,
      start_date: formData.start_date,
    },
  });

  // Hole Professions aus DB (fallback auf häufige Berufe falls keine DB-Tabelle)
  const { data: professions } = useQuery({
    queryKey: ['professions'],
    queryFn: async () => {
      // Fallback data falls keine professions table existiert
      return [
        { id: 'kfz', name: 'KFZ-Mechatroniker' },
        { id: 'elektroniker', name: 'Elektroniker' },
        { id: 'einzelhandel', name: 'Kaufmann/-frau im Einzelhandel' },
        { id: 'bueromanagement', name: 'Kaufmann/-frau für Büromanagement' },
        { id: 'fachinformatiker', name: 'Fachinformatiker' },
        { id: 'koch', name: 'Koch/Köchin' },
        { id: 'industriemechaniker', name: 'Industriemechaniker' },
        { id: 'medizinisch', name: 'Medizinische/r Fachangestellte/r' },
        { id: 'pflege', name: 'Pflegefachmann/-frau' },
      ];
    },
  });

  const onSubmit = (data: any) => {
    setFormData(data);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Basis-Informationen</h2>
        <p className="text-muted-foreground">Grundlegende Details zur Stellenanzeige</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: 'Titel ist erforderlich' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stellentitel *</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Ausbildung zum KFZ-Mechatroniker (m/w/d)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="city"
            rules={{ required: 'Standort ist erforderlich' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Standort *</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Frankfurt am Main" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employment_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschäftigungsart *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="apprenticeship">Ausbildung</SelectItem>
                    <SelectItem value="dual_study">Duales Studium</SelectItem>
                    <SelectItem value="internship">Praktikum</SelectItem>
                    <SelectItem value="full_time">Vollzeit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Startdatum</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit">
              Weiter
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}