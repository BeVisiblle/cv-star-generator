import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useJobForm } from "@/contexts/JobFormContext";

export function JobFormStep4Contact() {
  const { formData, setFormData, nextStep, prevStep } = useJobForm();
  
  const form = useForm({
    defaultValues: {
      contact_person_name: formData.contact_person_name,
      contact_person_email: formData.contact_person_email,
      contact_person_phone: formData.contact_person_phone,
      contact_person_role: formData.contact_person_role,
    },
  });

  const onSubmit = (data: any) => {
    setFormData(data);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Kontaktinformationen</h2>
        <p className="text-muted-foreground">
          Diese Informationen werden Bewerbern angezeigt
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="contact_person_name"
            rules={{ required: "Name ist erforderlich" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name der Kontaktperson *</FormLabel>
                <FormControl>
                  <Input placeholder="Max Mustermann" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_person_email"
            rules={{ 
              required: "E-Mail ist erforderlich",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Ungültige E-Mail-Adresse"
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail-Adresse *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="max@unternehmen.de" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_person_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefonnummer (optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+49 123 456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_person_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position/Rolle (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Personalleiter" {...field} />
                </FormControl>
                <FormDescription>
                  z.B. Personalleiter, Geschäftsführer, HR Manager
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
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
