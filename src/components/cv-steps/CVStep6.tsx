import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Import layout components
import ModernLayout from '@/components/cv-layouts/ModernLayout';
import ClassicLayout from '@/components/cv-layouts/ClassicLayout';
import CreativeLayout from '@/components/cv-layouts/CreativeLayout';
import MinimalLayout from '@/components/cv-layouts/MinimalLayout';
import ProfessionalLayout from '@/components/cv-layouts/ProfessionalLayout';
import LiveCareerLayout from '@/components/cv-layouts/LiveCareerLayout';

const CVStep6 = () => {
  const { formData, setCurrentStep } = useCVForm();

  const getBrancheTitle = () => {
    switch (formData.branche) {
      case 'handwerk': return 'Handwerk';
      case 'it': return 'IT';
      case 'gesundheit': return 'Gesundheit';
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
      default: return 'Standard';
    }
  };

  const handleBackToLayout = () => {
    setCurrentStep(5);
  };

  const renderLayoutComponent = () => {
    const layoutProps = { data: formData };
    
    switch (formData.layout) {
      case 1: return <LiveCareerLayout {...layoutProps} />;
      case 2: return <ClassicLayout {...layoutProps} />;
      case 3: return <CreativeLayout {...layoutProps} />;
      case 4: return <MinimalLayout {...layoutProps} />;
      case 5: return <ProfessionalLayout {...layoutProps} />;
      default: return <LiveCareerLayout {...layoutProps} />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CV-Vorschau</CardTitle>
          <CardDescription>
            Hier siehst du eine Vorschau deines Lebenslaufs im {getLayoutName()}-Layout.
          </CardDescription>
          <Button
            variant="outline"
            onClick={handleBackToLayout}
            className="w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Layout-Auswahl
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Render the selected layout component */}
          {renderLayoutComponent()}

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