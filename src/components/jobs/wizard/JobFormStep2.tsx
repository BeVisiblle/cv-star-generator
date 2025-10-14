import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useJobForm } from "@/contexts/JobFormContext";
import { LanguageSelector } from "../LanguageSelector";
import { CertificationInput } from "../CertificationInput";
import { DocumentRequirementsSelector } from "../DocumentRequirementsSelector";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getSkillsForBranch } from "@/data/branchenSkills";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function JobFormStep2() {
  const { formData, setFormData, nextStep, prevStep } = useJobForm();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const form = useForm({
    defaultValues: {
      skills: formData.skills,
      required_languages: formData.required_languages,
      certifications: formData.certifications,
      required_documents: formData.required_documents,
      optional_documents: formData.optional_documents,
    },
  });

  // Get branch-specific skills
  const branchSkills = getSkillsForBranch(formData.industry);

  // Auto-suggest skills based on industry when component mounts or industry changes
  useEffect(() => {
    if (formData.industry && formData.skills.length === 0) {
      const suggestedSkills = branchSkills.slice(0, 5).map(name => ({
        name,
        level: 'must_have' as const
      }));
      form.setValue('skills', suggestedSkills);
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

  const addSkill = (skillName: string, level: 'must_have' | 'nice_to_have' = 'must_have') => {
    const currentSkills = form.watch('skills');
    const levelSkills = currentSkills.filter(s => s.level === level);
    
    if (levelSkills.length >= 5) {
      toast.error(`Maximal 5 ${level === 'must_have' ? 'Must-Have' : 'Nice-to-Have'} Fähigkeiten erlaubt`);
      return;
    }
    
    if (!currentSkills.some(s => s.name === skillName)) {
      form.setValue('skills', [...currentSkills, { name: skillName, level }]);
    }
  };

  const removeSkill = (index: number) => {
    const currentSkills = form.watch('skills');
    form.setValue('skills', currentSkills.filter((_, i) => i !== index));
  };

  const changeSkillLevel = (index: number, newLevel: 'must_have' | 'nice_to_have') => {
    const currentSkills = form.watch('skills');
    const newLevelSkills = currentSkills.filter(s => s.level === newLevel);
    
    if (newLevelSkills.length >= 5) {
      toast.error(`Maximal 5 ${newLevel === 'must_have' ? 'Must-Have' : 'Nice-to-Have'} Fähigkeiten erlaubt`);
      return;
    }
    
    const updatedSkills = [...currentSkills];
    updatedSkills[index] = { ...updatedSkills[index], level: newLevel };
    form.setValue('skills', updatedSkills);
  };

  const onSubmit = (data: any) => {
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

  const currentSkills = form.watch('skills');
  const mustHaveSkills = currentSkills.filter(s => s.level === 'must_have');
  const niceToHaveSkills = currentSkills.filter(s => s.level === 'nice_to_have');
  const availableSkills = branchSkills.filter(skill => !currentSkills.some(s => s.name === skill));

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
          {/* Must-Have Skills */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel className="text-base">Must-Have Fähigkeiten</FormLabel>
              <span className="text-sm text-muted-foreground">
                {mustHaveSkills.length}/5
              </span>
            </div>
            
            <Combobox
              items={availableSkills.map(skill => ({ value: skill, label: skill }))}
              value={undefined}
              onChange={(value) => addSkill(value, 'must_have')}
              placeholder={mustHaveSkills.length >= 5 ? "Maximum erreicht" : "Fähigkeit auswählen..."}
              searchPlaceholder="Fähigkeit suchen..."
              disabled={mustHaveSkills.length >= 5}
            />

            <div className="flex flex-wrap gap-2">
              {mustHaveSkills.map((skill, index) => {
                const actualIndex = currentSkills.findIndex(s => s === skill);
                return (
                  <Badge key={actualIndex} variant="default" className="px-3 py-2 text-sm">
                    {skill.name}
                    <Select
                      value={skill.level}
                      onValueChange={(value) => changeSkillLevel(actualIndex, value as any)}
                    >
                      <SelectTrigger className="h-6 w-auto ml-2 border-0 bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="must_have">Must-Have</SelectItem>
                        <SelectItem value="nice_to_have">Nice-to-Have</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => removeSkill(actualIndex)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Nice-to-Have Skills */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel className="text-base">Nice-to-Have Fähigkeiten</FormLabel>
              <span className="text-sm text-muted-foreground">
                {niceToHaveSkills.length}/5
              </span>
            </div>
            
            <Combobox
              items={availableSkills.map(skill => ({ value: skill, label: skill }))}
              value={undefined}
              onChange={(value) => addSkill(value, 'nice_to_have')}
              placeholder={niceToHaveSkills.length >= 5 ? "Maximum erreicht" : "Fähigkeit auswählen..."}
              searchPlaceholder="Fähigkeit suchen..."
              disabled={niceToHaveSkills.length >= 5}
            />

            <div className="flex flex-wrap gap-2">
              {niceToHaveSkills.map((skill, index) => {
                const actualIndex = currentSkills.findIndex(s => s === skill);
                return (
                  <Badge key={actualIndex} variant="outline" className="px-3 py-2 text-sm">
                    {skill.name}
                    <Select
                      value={skill.level}
                      onValueChange={(value) => changeSkillLevel(actualIndex, value as any)}
                    >
                      <SelectTrigger className="h-6 w-auto ml-2 border-0 bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="must_have">Must-Have</SelectItem>
                        <SelectItem value="nice_to_have">Nice-to-Have</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => removeSkill(actualIndex)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>

          <LanguageSelector
            value={form.watch('required_languages')}
            onChange={(langs) => form.setValue('required_languages', langs)}
          />

          <CertificationInput
            value={form.watch('certifications')}
            onChange={(certs) => form.setValue('certifications', certs)}
          />

          <DocumentRequirementsSelector
            requiredDocuments={form.watch('required_documents')}
            optionalDocuments={form.watch('optional_documents')}
            onChange={(required, optional) => {
              form.setValue('required_documents', required);
              form.setValue('optional_documents', optional);
            }}
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
