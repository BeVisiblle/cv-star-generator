import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Edit3, Upload, X, Clock, FileText, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { SkillSelector } from '@/components/shared/SkillSelector';
import { useNavigate } from 'react-router-dom';

// Import CV layout components
import ModernLayout from '@/components/cv-layouts/ModernLayout';
import ClassicLayout from '@/components/cv-layouts/ClassicLayout';
import CreativeLayout from '@/components/cv-layouts/CreativeLayout';
import MinimalLayout from '@/components/cv-layouts/MinimalLayout';
import ProfessionalLayout from '@/components/cv-layouts/ProfessionalLayout';
import LiveCareerLayout from '@/components/cv-layouts/LiveCareerLayout';

interface LinkedInProfileSidebarProps {
  profile: any;
  isEditing: boolean;
  onProfileUpdate: (updates: any) => void;
}

export const LinkedInProfileSidebar: React.FC<LinkedInProfileSidebarProps> = ({ profile, isEditing, onProfileUpdate }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showCVPreview, setShowCVPreview] = useState(false);
  const navigate = useNavigate();

  const handleDownloadCV = async () => {
    if (!profile?.vorname || !profile?.nachname) {
      toast({
        title: "Fehler",
        description: "Vor- und Nachname sind im Profil erforderlich.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      // Check if CV URL exists in profile, if yes, download directly
      if (profile.cv_url) {
        const link = document.createElement('a');
        link.href = profile.cv_url;
        link.download = `CV_${profile.vorname}_${profile.nachname}_${formatDate(new Date().toISOString())}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "CV erfolgreich heruntergeladen",
          description: "Dein gespeicherter Lebenslauf wurde heruntergeladen.",
        });
        return;
      }

      // Generate CV dynamically if no saved CV exists
      const cvElement = document.createElement('div');
      cvElement.style.position = 'absolute';
      cvElement.style.left = '-9999px';
      cvElement.style.width = '210mm';
      cvElement.style.minHeight = '297mm';
      cvElement.style.backgroundColor = 'white';
      cvElement.style.padding = '20mm';
      cvElement.style.fontFamily = 'Arial, sans-serif';
      
      // Generate CV content based on profile
      cvElement.innerHTML = `
        <div style="font-size: 14px; line-height: 1.4; color: #333;">
          <h1 style="font-size: 24px; margin-bottom: 10px; color: #000;">${profile.vorname} ${profile.nachname}</h1>
          <p style="margin-bottom: 20px; color: #666;">${profile.email} | ${profile.telefon} | ${profile.ort}</p>
          
          ${profile.bio ? `
            <h2 style="font-size: 18px; margin: 20px 0 10px 0; color: #000; border-bottom: 1px solid #ccc;">Über mich</h2>
            <p style="margin-bottom: 20px;">${profile.bio}</p>
          ` : ''}
          
          ${profile.berufserfahrung && profile.berufserfahrung.length > 0 ? `
            <h2 style="font-size: 18px; margin: 20px 0 10px 0; color: #000; border-bottom: 1px solid #ccc;">Berufserfahrung</h2>
            ${profile.berufserfahrung.map((exp: any) => `
              <div style="margin-bottom: 15px;">
                <h3 style="font-size: 16px; margin-bottom: 5px; color: #000;">${exp.titel} - ${exp.unternehmen}</h3>
                <p style="margin-bottom: 5px; color: #666;">${exp.zeitraum_von} - ${exp.zeitraum_bis} | ${exp.ort}</p>
                ${exp.beschreibung ? `<p style="margin-bottom: 10px;">${exp.beschreibung}</p>` : ''}
              </div>
            `).join('')}
          ` : ''}
          
          ${profile.schulbildung && profile.schulbildung.length > 0 ? `
            <h2 style="font-size: 18px; margin: 20px 0 10px 0; color: #000; border-bottom: 1px solid #ccc;">Schulbildung</h2>
            ${profile.schulbildung.map((edu: any) => `
              <div style="margin-bottom: 15px;">
                <h3 style="font-size: 16px; margin-bottom: 5px; color: #000;">${edu.schulform} - ${edu.name}</h3>
                <p style="margin-bottom: 5px; color: #666;">${edu.zeitraum_von} - ${edu.zeitraum_bis} | ${edu.ort}</p>
                ${edu.beschreibung ? `<p style="margin-bottom: 10px;">${edu.beschreibung}</p>` : ''}
              </div>
            `).join('')}
          ` : ''}
        </div>
      `;
      
      document.body.appendChild(cvElement);
      
      // Generate PDF using html2canvas and jsPDF
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      
      const canvas = await html2canvas(cvElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CV_${profile.vorname}_${profile.nachname}_${formatDate(new Date().toISOString())}.pdf`);
      
      document.body.removeChild(cvElement);
      
      toast({
        title: "CV erfolgreich heruntergeladen",
        description: "Dein Lebenslauf wurde als PDF gespeichert.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Fehler beim Erstellen der PDF",
        description: "Es gab ein Problem beim Generieren der PDF-Datei.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEditCV = () => {
    // Store current profile data for CV generator
    const cvEditData = {
      ...profile,
      // Ensure dates are properly formatted
      geburtsdatum: profile?.geburtsdatum ? new Date(profile.geburtsdatum).toISOString() : undefined
    };
    localStorage.setItem('cvEditData', JSON.stringify(cvEditData));
    navigate('/cv-generator');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: "Dateien hochgeladen",
      description: `${files.length} Datei(en) wurden erfolgreich hinzugefügt.`,
    });
  };

  const handleLanguagesChange = (languages: any[]) => {
    onProfileUpdate({ sprachen: languages });
  };

  const handleSkillsChange = (skills: string[]) => {
    onProfileUpdate({ faehigkeiten: skills });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

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

  const renderCVLayout = () => {
    const layout = profile?.layout || 1;
    const commonProps = { data: cvData, className: "scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none" };

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

  return (
    <div className="space-y-6">
      {/* Mein Lebenslauf */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            Mein Lebenslauf
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCVPreview(!showCVPreview)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {showCVPreview && profile?.vorname && profile?.nachname ? (
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-muted px-3 py-2 text-sm font-medium flex justify-between items-center">
                <span>Vorschau: {getLayoutName()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCVPreview(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="h-48 overflow-hidden relative">
                {renderCVLayout()}
              </div>
            </div>
          ) : showCVPreview && (!profile?.vorname || !profile?.nachname) ? (
            <div className="border rounded-lg p-4 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Vervollständigen Sie Ihr Profil für eine CV-Vorschau</p>
            </div>
          ) : null}
          
          <Button 
            onClick={handleDownloadCV}
            disabled={isGeneratingPDF}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? 'Generiere...' : 'CV herunterladen'}
          </Button>
          
          <Button 
            onClick={handleEditCV}
            variant="outline"
            className="w-full"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            CV bearbeiten
          </Button>
          
          {profile?.updated_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
              <Clock className="h-3 w-3" />
              zuletzt aktualisiert: {formatDate(profile.updated_at)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Dokumente hochladen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Input
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="document-upload"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('document-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Zeugnisse & Zertifikate
            </Button>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Hochgeladene Dateien:</p>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-muted p-2 rounded">
                  <span className="truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sprachen</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <LanguageSelector
              languages={profile?.sprachen || []}
              onLanguagesChange={handleLanguagesChange}
            />
          ) : (
            <div className="space-y-2">
              {profile?.sprachen && profile.sprachen.length > 0 ? (
                profile.sprachen.map((lang: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{lang.sprache}</span>
                    <Badge variant="secondary">{lang.niveau}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Keine Sprachen hinzugefügt</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Fähigkeiten</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <SkillSelector
              selectedSkills={profile?.faehigkeiten || []}
              onSkillsChange={handleSkillsChange}
              branch={profile?.branche}
              statusLevel={profile?.status}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.faehigkeiten && profile.faehigkeiten.length > 0 ? (
                profile.faehigkeiten.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Keine Fähigkeiten hinzugefügt</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profil-Statistiken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Profil vollständig:</span>
            <span className={profile?.profile_complete ? "text-green-600" : "text-orange-500"}>
              {profile?.profile_complete ? "Ja" : "Nein"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Öffentlich sichtbar:</span>
            <span className={profile?.profile_published ? "text-green-600" : "text-orange-500"}>
              {profile?.profile_published ? "Ja" : "Nein"}
            </span>
          </div>
          {profile?.created_at && (
            <div className="flex justify-between text-sm">
              <span>Erstellt am:</span>
              <span className="text-muted-foreground">
                {formatDate(profile.created_at)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};