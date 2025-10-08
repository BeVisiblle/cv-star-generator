import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface JobFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function JobForm({ initialData, onSubmit, onCancel, isLoading }: JobFormProps) {
  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      city: initialData?.city || initialData?.location || "",
      employment_type: initialData?.employment_type || "apprenticeship",
      description_md: initialData?.description_md || initialData?.description || "",
      profession_id: initialData?.profession_id || "",
      salary_min: initialData?.salary_min || undefined,
      salary_max: initialData?.salary_max || undefined,
      start_date: initialData?.start_date || "",
      is_public: initialData?.is_public ?? true,
      is_active: initialData?.is_active ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stellentitel *</FormLabel>
              <FormControl>
                <Input placeholder="z.B. Ausbildung zum KFZ-Mechatroniker" {...field} />
              </FormControl>
              <FormDescription>
                Nach der Veröffentlichung kann der Titel nicht mehr geändert werden
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Standort *</FormLabel>
              <FormControl>
                <Input placeholder="z.B. Frankfurt am Main" {...field} />
              </FormControl>
              <FormDescription>
                Nach der Veröffentlichung kann der Standort nicht mehr geändert werden
              </FormDescription>
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
                    <SelectValue placeholder="Wählen Sie eine Art" />
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
          name="description_md"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stellenbeschreibung *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Beschreiben Sie die Stelle..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Abbrechen
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Speichern
          </Button>
        </div>
      </form>
    </Form>
  );
}
