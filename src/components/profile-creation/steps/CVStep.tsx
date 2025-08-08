import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormFieldError } from '@/components/ui/form-field-error';
import { FileUp, FileText, Download, Eye, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ProfileCreationData, ValidationErrors } from '@/hooks/useProfileCreation';

interface CVStepProps {
  profileData: ProfileCreationData;
  validationErrors: ValidationErrors;
  onUpdate: (updates: Partial<ProfileCreationData>) => void;
}

export const CVStep: React.FC<CVStepProps> = ({
  profileData,
  validationErrors,
  onUpdate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const stepErrors = validationErrors[6] || [];
  
  const getFieldError = (field: string) => {
    return stepErrors.find(error => error.includes(field));
  };

  const generateCV = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate CV generation (in real app, this would call CV generator)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated CV URL
      const mockCVUrl = '/generated-cv-' + Date.now() + '.pdf';
      
      onUpdate({ 
        cv_url: mockCVUrl,
        has_generated_cv: true 
      });
      
      toast({
        title: 'Lebenslauf generiert!',
        description: 'Ihr automatischer Lebenslauf wurde erstellt.',
      });
    } catch (error) {
      toast({
        title: 'Generierung fehlgeschlagen',
        description: 'Lebenslauf konnte nicht generiert werden.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf')) {
      toast({
        title: 'Ungültiger Dateityp',
        description: 'Bitte laden Sie nur PDF-Dateien hoch.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Datei zu groß',
        description: 'Die Datei darf maximal 5MB groß sein.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate file upload (in real app, this would upload to Supabase Storage)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock uploaded CV URL
      const mockCVUrl = '/uploaded-cv-' + Date.now() + '.pdf';
      
      onUpdate({ 
        cv_url: mockCVUrl,
        has_generated_cv: false 
      });
      
      toast({
        title: 'Lebenslauf hochgeladen!',
        description: `${file.name} wurde erfolgreich hochgeladen.`,
      });
    } catch (error) {
      toast({
        title: 'Upload fehlgeschlagen',
        description: 'Datei konnte nicht hochgeladen werden.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }

    // Reset file input
    event.target.value = '';
  };

  const hasCV = !!profileData.cv_url;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Lebenslauf
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Laden Sie einen Lebenslauf hoch oder lassen Sie einen automatisch generieren
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!hasCV ? (
          <>
            {/* Option 1: Generate CV */}
            <Card className="border-dashed border-2">
              <CardContent className="pt-6 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Automatisch generieren</h4>
                  <p className="text-sm text-muted-foreground">
                    Erstellen Sie automatisch einen professionellen Lebenslauf 
                    aus Ihren eingegebenen Daten
                  </p>
                </div>
                
                <Button 
                  onClick={generateCV}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird generiert...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Lebenslauf generieren
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">oder</span>
              </div>
            </div>

            {/* Option 2: Upload CV */}
            <Card className="border-dashed border-2">
              <CardContent className="pt-6 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg mx-auto flex items-center justify-center mb-3">
                    <FileUp className="w-6 h-6 text-accent" />
                  </div>
                  <h4 className="font-semibold mb-2">Eigenen Lebenslauf hochladen</h4>
                  <p className="text-sm text-muted-foreground">
                    Laden Sie Ihren bereits erstellten Lebenslauf hoch (nur PDF)
                  </p>
                </div>
                
                <FormFieldError error={getFieldError('cv_url')}>
                  <div className="space-y-3">
                    <input
                      type="file"
                      id="cv-upload"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('cv-upload')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Wird hochgeladen...
                        </>
                      ) : (
                        <>
                          <FileUp className="w-4 h-4 mr-2" />
                          PDF hochladen
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      Maximale Dateigröße: 5MB
                    </p>
                  </div>
                </FormFieldError>
              </CardContent>
            </Card>
          </>
        ) : (
          /* CV is present - Show success and actions */
          <div className="space-y-4">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">
                    Lebenslauf vorhanden
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {profileData.has_generated_cv 
                      ? 'Automatisch generierter Lebenslauf' 
                      : 'Hochgeladener Lebenslauf'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Vorschau
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Replace CV */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">
                Lebenslauf ersetzen
              </Label>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={generateCV}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Neu generieren
                </Button>
                
                <input
                  type="file"
                  id="cv-replace"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => document.getElementById('cv-replace')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileUp className="w-4 h-4 mr-2" />
                  )}
                  Neue PDF
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            <strong>Empfehlung:</strong> Der automatisch generierte Lebenslauf 
            wird basierend auf Ihren eingegebenen Daten erstellt und ist für 
            die meisten Bewerbungen geeignet. Sie können jederzeit zwischen 
            den Optionen wechseln.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};