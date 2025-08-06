import React, { useState } from 'react';
import { Download, Edit3, Upload, Plus, Trash2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { SkillSelector } from '@/components/shared/SkillSelector';
import { useNavigate } from 'react-router-dom';
import { generatePDF } from '@/lib/pdf-generator';
import { toast } from '@/hooks/use-toast';

interface LinkedInProfileSidebarProps {
  profile: any;
  isEditing: boolean;
  onProfileUpdate: (updates: any) => void;
}

export const LinkedInProfileSidebar: React.FC<LinkedInProfileSidebarProps> = ({
  profile,
  isEditing,
  onProfileUpdate
}) => {
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
                <h3 style="font-size: 16px; margin: 0 0 5px 0;">${exp.titel} - ${exp.unternehmen}</h3>
                <p style="margin: 0 0 5px 0; color: #666;">${exp.zeitraum_von} - ${exp.zeitraum_bis}</p>
                ${exp.beschreibung ? `<p style="margin: 0;">${exp.beschreibung}</p>` : ''}
              </div>
            `).join('')}
          ` : ''}
          
          ${profile.schulbildung && profile.schulbildung.length > 0 ? `
            <h2 style="font-size: 18px; margin: 20px 0 10px 0; color: #000; border-bottom: 1px solid #ccc;">Bildung</h2>
            ${profile.schulbildung.map((edu: any) => `
              <div style="margin-bottom: 15px;">
                <h3 style="font-size: 16px; margin: 0 0 5px 0;">${edu.name}</h3>
                <p style="margin: 0 0 5px 0; color: #666;">${edu.zeitraum_von} - ${edu.zeitraum_bis}</p>
                ${edu.beschreibung ? `<p style="margin: 0;">${edu.beschreibung}</p>` : ''}
              </div>
            `).join('')}
          ` : ''}
          
          ${profile.faehigkeiten && profile.faehigkeiten.length > 0 ? `
            <h2 style="font-size: 18px; margin: 20px 0 10px 0; color: #000; border-bottom: 1px solid #ccc;">Fähigkeiten</h2>
            <p>${profile.faehigkeiten.join(', ')}</p>
          ` : ''}
          
          ${profile.sprachen && profile.sprachen.length > 0 ? `
            <h2 style="font-size: 18px; margin: 20px 0 10px 0; color: #000; border-bottom: 1px solid #ccc;">Sprachen</h2>
            <p>${profile.sprachen.map((lang: any) => `${lang.sprache} (${lang.niveau})`).join(', ')}</p>
          ` : ''}
        </div>
      `;
      
      document.body.appendChild(cvElement);
      
      const { generateCVFilename } = await import('@/lib/pdf-generator');
      const filename = generateCVFilename(profile.vorname, profile.nachname);
      
      await generatePDF(cvElement, {
        filename,
        quality: 2,
        format: 'a4',
        margin: 10
      });
      
      document.body.removeChild(cvElement);
      
      toast({
        title: "CV erfolgreich erstellt",
        description: `Dein Lebenslauf wurde als ${filename} heruntergeladen.`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Fehler beim Erstellen der PDF",
        description: "Es gab ein Problem beim Erstellen deines Lebenslaufs.",
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: "Feature in Entwicklung",
      description: "Dokument-Upload wird bald verfügbar sein."
    });
  };

  const handleLanguagesChange = (languages: any[]) => {
    onProfileUpdate({ sprachen: languages });
  };

  const handleSkillsChange = (skills: string[]) => {
    onProfileUpdate({ faehigkeiten: skills });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* CV Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Mein Lebenslauf
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Languages - Only editable in editing mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sprachen</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <LanguageSelector
              languages={profile?.sprachen || []}
              onLanguagesChange={handleLanguagesChange}
              maxLanguages={5}
            />
          ) : (
            <div className="space-y-2">
              {profile?.sprachen && profile.sprachen.length > 0 ? (
                profile.sprachen.map((lang: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm">{lang.sprache}</span>
                    <Badge variant="outline" className="text-xs">{lang.niveau}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Keine Sprachen hinzugefügt</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills - Only editable in editing mode */}
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
              maxSkills={10}
            />
          ) : (
            <div className="space-y-2">
              {profile?.faehigkeiten && profile.faehigkeiten.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.faehigkeiten.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Keine Fähigkeiten hinzugefügt</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Stats (Future Feature) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profil-Statistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profilaufrufe</span>
              <span className="font-medium">Coming soon</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CV Downloads</span>
              <span className="font-medium">Coming soon</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kontakte</span>
              <span className="font-medium">Coming soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};