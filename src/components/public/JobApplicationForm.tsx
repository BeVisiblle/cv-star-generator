import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, ExternalLink, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobApplicationFormProps {
  jobId: string;
  companyId: string;
  jobTitle: string;
  companyName: string;
  onApplicationSubmitted?: () => void;
}

export default function JobApplicationForm({ 
  jobId, 
  companyId, 
  jobTitle, 
  companyName, 
  onApplicationSubmitted 
}: JobApplicationFormProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolioUrl: '',
    resumeFile: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.coverLetter.trim()) {
      toast({
        title: "Anschreiben erforderlich",
        description: "Bitte geben Sie ein Anschreiben ein.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Bitte melden Sie sich an, um sich zu bewerben.",
          variant: "destructive"
        });
        return;
      }

      // Check if user already applied
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('job_post_id', jobId)
        .eq('user_id', user.id)
        .single();

      if (existingApplication) {
        toast({
          title: "Bereits beworben",
          description: "Sie haben sich bereits auf diese Stelle beworben.",
          variant: "destructive"
        });
        return;
      }

      // Upload resume if provided
      let resumeUrl = null;
      if (formData.resumeFile) {
        const fileExt = formData.resumeFile.name.split('.').pop();
        const fileName = `${user.id}/${jobId}/resume.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.resumeFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        resumeUrl = publicUrl;
      }

      // Create application
      const { error } = await supabase
        .from('applications')
        .insert({
          job_post_id: jobId,
          user_id: user.id,
          company_id: companyId,
          cover_letter: formData.coverLetter.trim(),
          resume_url: resumeUrl,
          portfolio_url: formData.portfolioUrl || null,
          status: 'applied'
        });

      if (error) throw error;

      // Track job post view
      await supabase
        .from('job_post_views')
        .upsert({
          job_post_id: jobId,
          viewed_by: user.id
        });

      toast({
        title: "Bewerbung abgesendet",
        description: "Ihre Bewerbung wurde erfolgreich übermittelt."
      });

      // Reset form
      setFormData({
        coverLetter: '',
        portfolioUrl: '',
        resumeFile: null
      });
      setIsOpen(false);

      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Fehler",
        description: "Bewerbung konnte nicht abgesendet werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Datei zu groß",
          description: "Die Datei darf maximal 5MB groß sein.",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({ ...prev, resumeFile: file }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Send className="h-4 w-4 mr-2" />
          Jetzt bewerben
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bewerbung für {jobTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            bei {companyName}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="coverLetter">Anschreiben *</Label>
            <Textarea
              id="coverLetter"
              placeholder="Erzählen Sie uns, warum Sie der richtige Kandidat für diese Position sind..."
              value={formData.coverLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              className="mt-1"
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="portfolioUrl">Portfolio-URL (optional)</Label>
            <Input
              id="portfolioUrl"
              type="url"
              placeholder="https://ihr-portfolio.com"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="resume">Lebenslauf (optional)</Label>
            <div className="mt-1">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC oder DOCX, maximal 5MB
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.coverLetter.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Bewerbung absenden
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
