
import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { generateCVFilename } from '@/lib/pdf-generator';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateCVVariantFile, uploadCVWithFilename } from '@/lib/supabase-storage';

// Variant-aware CV renderers
import { CvRendererMobile } from '@/components/cv-renderers/CvRendererMobile';

import { mapFormDataToContent, CVContent } from '@/components/cv-renderers/CVContent';
import { adjustContentForVariant } from '@/lib/page-length';

// A4 layout variants
import ModernLayout from '@/components/cv-layouts/ModernLayout';
import ClassicLayout from '@/components/cv-layouts/ClassicLayout';
import CreativeLayout from '@/components/cv-layouts/CreativeLayout';
import MinimalLayout from '@/components/cv-layouts/MinimalLayout';
import ProfessionalLayout from '@/components/cv-layouts/ProfessionalLayout';
import LiveCareerLayout from '@/components/cv-layouts/LiveCareerLayout';
import { mapFormDataToCVData } from '@/components/cv-layouts/mapFormDataToCVData';
import { cn } from '@/lib/utils';

const CVStep6 = () => {
  const { formData, setCurrentStep, isLayoutEditMode, setLayoutEditMode } = useCVForm();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const getBrancheTitle = () => {
    switch (formData.branche) {
      case 'handwerk': return 'Handwerk';
      case 'it': return 'IT & Technik';
      case 'gesundheit': return 'Gesundheit & Pflege';
      case 'buero': return 'Büro & Verwaltung';
      case 'verkauf': return 'Verkauf & Handel';
      case 'gastronomie': return 'Gastronomie';
      case 'bau': return 'Bau & Architektur';
      default: return '';
    }
  };

  const getStatusTitle = () => {
    switch (formData.status) {
      case 'schueler': return 'Schüler/in';
      case 'azubi': return 'Auszubildende/r';
      case 'ausgelernt': return 'Ausgelernte/r';
      default: return '';
    }
  };

  const getLayoutName = () => {
    switch (formData.layout) {
      case 1: return 'Modern';
      case 2: return 'Klassisch';
      case 3: return 'Kreativ';
      case 4: return 'Minimalistisch';
      case 5: return 'Professionell';
      case 6: return 'LiveCareer';
      default: return 'Modern';
    }
  };

  const handleBackToLayout = () => {
    setCurrentStep(5);
  };

  const handleFinish = async () => {
    if (isLayoutEditMode && profile) {
      try {
        // Save the selected layout to the user's profile
        const { error } = await supabase
          .from('profiles')
          .update({ layout: formData.layout })
          .eq('id', profile.id);

        if (error) throw error;

        toast.success('Layout erfolgreich gespeichert!');
        
        // Reset layout edit mode and return to profile
        setLayoutEditMode(false);
        localStorage.removeItem('cvLayoutEditMode');
        navigate('/profile');
      } catch (error) {
        console.error('Error saving layout:', error);
        toast.error('Fehler beim Speichern des Layouts');
      }
    } else {
      // Normal CV generation flow
      setCurrentStep(7);
    }
  };

  const handleDownloadCV = async () => {
    try {
      const cvElement = document.querySelector('[data-cv-preview]') as HTMLElement;
      if (!cvElement) {
        toast.error('CV-Vorschau nicht gefunden');
        return;
      }

      const base = generateCVFilename(formData.vorname || 'Unknown', formData.nachname || 'User');
      const baseNoExt = base.replace(/\.pdf$/i, '');
      const variant: 'mobile' | 'a4' = isMobile ? 'mobile' : 'a4';

      // Primary: generate and download current variant
      const file = await generateCVVariantFile(cvElement, `${baseNoExt}_${variant}.pdf`, variant);
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('CV erfolgreich heruntergeladen!');

      // Upload if authenticated
      if (profile) {
        try {
          await uploadCVWithFilename(file, file.name);
          toast.success('CV in deinem Konto gespeichert.');
        } catch (e) {
          console.error('Fehler beim Hochladen des CVs:', e);
        }
      }

      // Background: generate alternate variant
      const other: 'mobile' | 'a4' = variant === 'mobile' ? 'a4' : 'mobile';
      setTimeout(async () => {
        try {
          const alt = await generateCVVariantFile(cvElement, `${baseNoExt}_${other}.pdf`, other);
          if (profile) {
            await uploadCVWithFilename(alt, alt.name);
          }
          toast.success(`Alternatives ${other.toUpperCase()}-Format bereit.`);
        } catch (err) {
          console.error('Fehler beim Erzeugen des alternativen Formats:', err);
        }
      }, 0);
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast.error('Fehler beim Herunterladen des CVs');
    }
  };

  const renderLayoutComponent = () => {
    const variant: 'mobile' | 'a4' = isMobile ? 'mobile' : 'a4';

    if (variant === 'mobile') {
      const content: CVContent = mapFormDataToContent(formData);
      const adjusted = adjustContentForVariant(content, 'mobile');
      return <CvRendererMobile content={adjusted} />;
    }

    // A4 preview using selected layout
    const data = mapFormDataToCVData(formData);
    const selected = formData.layout ?? 1;

    const LayoutComponent =
      selected === 2 ? ClassicLayout :
      selected === 3 ? CreativeLayout :
      selected === 4 ? MinimalLayout :
      selected === 5 ? ProfessionalLayout :
      selected === 6 ? LiveCareerLayout :
      ModernLayout;

    return (
      <article
        data-cv-preview
        data-variant="a4"
        className={cn(
          'cv-a4 mx-auto bg-card text-foreground rounded-md shadow-sm border border-border overflow-hidden',
          'max-w-full'
        )}
        aria-label="Lebenslauf Vorschau – A4"
      >
        <LayoutComponent data={data} />
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CV-Vorschau</CardTitle>
          <CardDescription>
            Hier siehst du eine Vorschau deines Lebenslaufs im {getLayoutName()}-Layout.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleBackToLayout}
                className="w-full sm:w-fit"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Layout-Auswahl
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadCV}
                className="w-full sm:w-fit"
              >
                <Download className="h-4 w-4 mr-2" />
                CV herunterladen
              </Button>
            </div>
            {isLayoutEditMode && (
              <Button
                onClick={handleFinish}
                className="w-full sm:w-fit"
              >
                Layout speichern
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="w-full flex justify-center">
            <div className="origin-top scale-90 sm:scale-100 transition-transform">
              {/* Render the selected layout component */}
              {renderLayoutComponent()}
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Hinweis:</strong> Layout "{getLayoutName()}" mit branchenspezifischem Farbschema. 
              Das finale Layout wird für PDF optimiert und professionell formatiert.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CVStep6;
