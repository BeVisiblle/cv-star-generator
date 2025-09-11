import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import CV layout components
import ModernLayout from '@/components/cv-layouts/ModernLayout';
import ClassicLayout from '@/components/cv-layouts/ClassicLayout';
import CreativeLayout from '@/components/cv-layouts/CreativeLayout';
import MinimalLayout from '@/components/cv-layouts/MinimalLayout';
import ProfessionalLayout from '@/components/cv-layouts/ProfessionalLayout';
import LiveCareerLayout from '@/components/cv-layouts/LiveCareerLayout';

interface CVPreviewCardProps {
  profile: any;
  onDownload: () => void;
  isGeneratingPDF?: boolean;
}

export const CVPreviewCard: React.FC<CVPreviewCardProps> = ({ 
  profile, 
  onDownload, 
  isGeneratingPDF = false 
}) => {
  const navigate = useNavigate();

  // Convert profile data to CV layout format
  const cvData = {
    vorname: profile?.vorname,
    nachname: profile?.nachname,
    telefon: profile?.telefon,
    email: profile?.email,
    strasse: profile?.strasse,
    hausnummer: profile?.hausnummer,
    plz: profile?.plz,
    ort: profile?.ort,
    geburtsdatum: profile?.geburtsdatum ? new Date(profile.geburtsdatum) : undefined,
    profilbild: profile?.avatar_url,
    status: profile?.status,
    branche: profile?.branche,
    ueberMich: profile?.uebermich || profile?.bio,
    schulbildung: profile?.schulbildung || [],
    berufserfahrung: profile?.berufserfahrung || [],
    sprachen: profile?.sprachen || [],
    faehigkeiten: profile?.faehigkeiten || []
  };

  const handleEditCV = () => {
    // Store current profile data in localStorage for CV generator
    const cvEditData = {
      ...profile,
      // Ensure dates are properly formatted
      geburtsdatum: profile?.geburtsdatum ? new Date(profile.geburtsdatum).toISOString() : undefined
    };
    localStorage.setItem('cvEditData', JSON.stringify(cvEditData));
    navigate('/cv-generator');
  };

  const renderCVLayout = () => {
    const layout = profile?.layout || 1;
    const commonProps = { data: cvData, className: "scale-50 origin-top-left w-[200%]" };

    switch (layout) {
      case 1:
        return <ModernLayout {...commonProps} />;
      case 2:
        return <ClassicLayout {...commonProps} />;
      case 3:
        return <CreativeLayout {...commonProps} />;
      case 4:
        return <MinimalLayout {...commonProps} />;
      case 5:
        return <ProfessionalLayout {...commonProps} />;
      case 6:
        return <LiveCareerLayout {...commonProps} />;
      default:
        return <ModernLayout {...commonProps} />;
    }
  };

  const getLayoutName = () => {
    const layout = profile?.layout || 1;
    switch (layout) {
      case 1: return 'Modern';
      case 2: return 'Classic';
      case 3: return 'Creative';
      case 4: return 'Minimal';
      case 5: return 'Professional';
      case 6: return 'LiveCareer';
      default: return 'Modern';
    }
  };

  if (!profile?.vorname || !profile?.nachname) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Kein CV verfügbar</h3>
          <p className="text-muted-foreground mb-4">
            Vervollständigen Sie Ihr Profil, um eine CV-Vorschau zu sehen.
          </p>
          <Button onClick={handleEditCV}>
            <Edit className="h-4 w-4 mr-2" />
            CV erstellen
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">CV Vorschau</h3>
            <p className="text-sm text-muted-foreground">Layout: {getLayoutName()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEditCV}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <Button 
              size="sm" 
              onClick={onDownload}
              disabled={isGeneratingPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generiere...' : 'Download'}
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="h-96 overflow-hidden bg-white">
          {renderCVLayout()}
        </div>
      </CardContent>
    </Card>
  );
};