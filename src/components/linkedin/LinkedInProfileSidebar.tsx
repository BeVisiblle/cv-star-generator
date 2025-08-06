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
    setIsGeneratingPDF(true);
    try {
      await generatePDF(profile);
      toast({
        title: "CV heruntergeladen",
        description: "Ihr Lebenslauf wurde erfolgreich generiert."
      });
    } catch (error) {
      toast({
        title: "Fehler beim Download",
        description: "Der CV konnte nicht generiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEditCV = () => {
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

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sprachen</CardTitle>
        </CardHeader>
        <CardContent>
          <LanguageSelector
            languages={profile?.sprachen || []}
            onLanguagesChange={handleLanguagesChange}
            maxLanguages={5}
          />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Fähigkeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillSelector
            selectedSkills={profile?.faehigkeiten || []}
            onSkillsChange={handleSkillsChange}
            branch={profile?.branche}
            statusLevel={profile?.status}
            maxSkills={10}
          />
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