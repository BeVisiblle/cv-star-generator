
import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';


// A4 layout variants
import ModernLayout from '@/components/cv-layouts/ModernLayout';
import ClassicLayout from '@/components/cv-layouts/ClassicLayout';
import CreativeLayout from '@/components/cv-layouts/CreativeLayout';
import MinimalLayout from '@/components/cv-layouts/MinimalLayout';
import ProfessionalLayout from '@/components/cv-layouts/ProfessionalLayout';
import LiveCareerLayout from '@/components/cv-layouts/LiveCareerLayout';
import ClassicV2Layout from '@/components/cv-layouts/ClassicV2Layout';
import OliviaLayout from '@/components/cv-layouts/OliviaLayout';
import JohannaLayout from '@/components/cv-layouts/JohannaLayout';
import KatharinaLayout from '@/components/cv-layouts/KatharinaLayout';
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
      case 7: return 'Klassisch V2';
      case 8: return 'Olivia';
      case 9: return 'Johanna';
      case 10: return 'Katharina';
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

  const handleDownloadCV = () => {
    // Öffnet die isolierte CV-Print-Seite in neuem Tab
    window.open("/cv/print", "_blank", "noopener,noreferrer");
    toast.success('CV wird in neuem Tab geöffnet!');
  };

  const renderLayoutComponent = () => {
    // Always render A4 layout for consistent preview (also on mobile)
    const data = mapFormDataToCVData(formData);
    const selected = formData.layout ?? 1;

    console.log('🔵 CVStep6 (components/cv-steps) - formData.layout:', formData.layout);
    console.log('🔵 CVStep6 (components/cv-steps) - selected:', selected);
    console.log('🔵 CVStep6 (components/cv-steps) - Layout name:', getLayoutName());

    const LayoutComponent =
      selected === 2 ? ClassicLayout :
      selected === 3 ? CreativeLayout :
      selected === 4 ? MinimalLayout :
      selected === 5 ? ProfessionalLayout :
      selected === 6 ? LiveCareerLayout :
      selected === 7 ? ClassicV2Layout :
      ModernLayout;

    console.log('🔵 CVStep6 (components/cv-steps) - LayoutComponent:', LayoutComponent.name);

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
            <div className="origin-top scale-[0.74] sm:scale-90 md:scale-100 transition-transform">
              {/* Render the selected layout component */}
              {renderLayoutComponent()}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default CVStep6;
