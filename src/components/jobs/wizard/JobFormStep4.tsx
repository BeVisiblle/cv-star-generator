import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useJobForm } from "@/contexts/JobFormContext";

export function JobFormStep4() {
  const { formData, setFormData, nextStep, prevStep } = useJobForm();
  
  const form = useForm({
    defaultValues: {
      salary_min: formData.salary_min,
      salary_max: formData.salary_max,
      work_mode: formData.work_mode,
      working_hours: formData.working_hours,
      is_public: formData.is_public,
    },
  });

  const onSubmit = (data: any) => {
    setFormData(data);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Details & Benefits</h2>
        <p className="text-muted-foreground">Zusätzliche Informationen zur Stelle</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="salary_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gehalt Min (€/Jahr)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="35000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                  <FormLabel>Gehalt Max (€/Jahr)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="45000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="work_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arbeitsmodell</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
            <Button type="button" variant="outline" onClick={prevStep}>
              Zurück
            </Button>
            <Button type="submit">
              Weiter zur Vorschau
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}