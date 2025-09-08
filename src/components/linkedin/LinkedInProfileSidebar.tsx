import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Edit3, Upload, X, Clock, FileText, Eye, Mail, Phone, Trash2, Car } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { SkillSelector } from '@/components/shared/SkillSelector';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile, deleteFile } from '@/lib/supabase-storage';
import { useIsMobile } from '@/hooks/use-mobile';

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
  readOnly?: boolean;
  showLanguagesAndSkills?: boolean;
  showLicenseAndStats?: boolean;
  showCVSection?: boolean;
  isCompanyViewing?: boolean;
}
interface UserDocument {
  id: string;
  filename: string;
  original_name: string;
  document_type: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}
export const LinkedInProfileSidebar: React.FC<LinkedInProfileSidebarProps> = ({
  profile,
  isEditing,
  onProfileUpdate,
  readOnly = false,
  showLanguagesAndSkills = true,
  showLicenseAndStats = true,
  showCVSection = true,
  isCompanyViewing = false
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const handleDownloadCV = async () => {
    try {
      setIsGeneratingPDF(true);

      // Check if we have enough data to generate a CV
      if (!profile.vorname || !profile.nachname) {
        toast({
          title: "Fehlende Daten",
          description: "Vor- und Nachname sind für die CV-Generierung erforderlich.",
          variant: "destructive"
        });
        return;
      }

      // Create temporary container for CV rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.width = '210mm';
      tempContainer.style.minHeight = '297mm';
      document.body.appendChild(tempContainer);

      // Import and render the correct CV layout
      let LayoutComponent;
      const layoutId = profile.layout || 1;
      switch (layoutId) {
        case 1:
          LayoutComponent = LiveCareerLayout;
          break;
        case 2:
          LayoutComponent = ClassicLayout;
          break;
        case 3:
          LayoutComponent = CreativeLayout;
          break;
        case 4:
          LayoutComponent = MinimalLayout;
          break;
        case 5:
          LayoutComponent = ProfessionalLayout;
          break;
        case 6:
          LayoutComponent = ModernLayout;
          break;
        default:
          LayoutComponent = LiveCareerLayout;
      }

      // Create and render CV element with proper data formatting
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const cvElement = React.createElement(LayoutComponent, {
        data: {
          ...cvData,
          ueberMich: profile.uebermich || profile.bio || ''
        }
      });
      const root = ReactDOM.createRoot(tempContainer);
      root.render(cvElement);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find the CV preview element
      const cvPreviewElement = tempContainer.querySelector('[data-cv-preview]') as HTMLElement;
      if (!cvPreviewElement) {
        throw new Error('CV preview element not found');
      }

      // Generate filename and PDF using same logic as CVStep7
      const {
        generatePDF,
        generateCVFilename
      } = await import('@/lib/pdf-generator');
      const filename = generateCVFilename(profile.vorname, profile.nachname);

      // Generate PDF using the unified function
      await generatePDF(cvPreviewElement, {
        filename,
        quality: 2,
        format: 'a4',
        margin: 10
      });

      // Generate PDF file for Supabase upload
      const {
        generateCVFromHTML,
        uploadCV
      } = await import('@/lib/supabase-storage');
      const pdfFile = await generateCVFromHTML(cvPreviewElement, filename);
      const {
        url
      } = await uploadCV(pdfFile);

      // Save CV URL to profile
      const {
        error
      } = await supabase.from('profiles').update({
        cv_url: url
      }).eq('id', profile.id);
      if (error) {
        throw error;
      }

      // Update local profile state
      onProfileUpdate({
        cv_url: url
      });

      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);
      toast({
        title: "CV erfolgreich erstellt",
        description: `Dein Lebenslauf wurde als ${filename} heruntergeladen und gespeichert.`
      });
    } catch (error) {
      console.error('Error generating CV:', error);
      toast({
        title: "Fehler beim Generieren des CVs",
        description: "Es gab ein Problem beim Erstellen der PDF-Datei.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  const handleEditCV = () => {
    // Save current profile data to localStorage for CV generator
    const cvData = {
      branche: profile.branche,
      status: profile.status,
      vorname: profile.vorname,
      nachname: profile.nachname,
      geburtsdatum: profile.geburtsdatum,
      strasse: profile.strasse,
      hausnummer: profile.hausnummer,
      plz: profile.plz,
      ort: profile.ort,
      telefon: profile.telefon,
      email: profile.email,
      profilbild: profile.avatar_url,
      has_drivers_license: profile.has_drivers_license,
      driver_license_class: profile.driver_license_class,
      motivation: profile.bio,
      kenntnisse: profile.kenntnisse,
      sprachen: profile.sprachen || [],
      faehigkeiten: profile.faehigkeiten || [],
      schulbildung: profile.schulbildung || [],
      berufserfahrung: profile.berufserfahrung || [],
      layout: profile.layout || 1,
      ueberMich: profile.uebermich
    };
    localStorage.setItem('cvFormData', JSON.stringify(cvData));
    localStorage.setItem('cvLayoutEditMode', 'true');
    navigate('/cv-layout-selector');
  };

  // Load user documents on component mount
  useEffect(() => {
    if (profile?.id && (isCompanyViewing || !readOnly)) {
      loadUserDocuments();
    }
  }, [profile?.id, isCompanyViewing, readOnly]);
  const loadUserDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const {
        data,
        error
      } = await supabase.from('user_documents').select('*').eq('user_id', profile.id).order('uploaded_at', {
        ascending: false
      });
      if (error) throw error;
      setUserDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Fehler beim Laden der Dokumente",
        description: "Dokumente konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingDocument(true);
    try {
      for (const file of files) {
        // Upload file to storage
        const uploadResult = await uploadFile(file, 'documents', 'certificates');

        // Save document metadata to database with correct document_type value
        const {
          error
        } = await supabase.from('user_documents').insert({
          user_id: profile.id,
          filename: uploadResult.path,
          original_name: file.name,
          document_type: 'zertifikat',
          // Use allowed value instead of 'certificate'
          file_type: file.type,
          file_size: file.size
        });
        if (error) throw error;
      }

      // Reload documents
      await loadUserDocuments();
      toast({
        title: "Dateien erfolgreich hochgeladen",
        description: `${files.length} Datei(en) wurden gespeichert.`
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Dateien konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingDocument(false);
      // Reset file input
      e.target.value = '';
    }
  };
  const handleDownloadDocument = async (userDoc: UserDocument) => {
    try {
      console.log('Starting download for:', userDoc);
      const {
        data
      } = supabase.storage.from('documents').getPublicUrl(userDoc.filename);
      console.log('Public URL:', data.publicUrl);
      console.log('File type:', userDoc.file_type);

      // If it's already a PDF, download directly
      if (userDoc.file_type === 'application/pdf') {
        console.log('Downloading PDF directly');

        // Try to fetch the file first to ensure it exists
        const response = await fetch(data.publicUrl);
        if (!response.ok) {
          throw new Error(`File not found: ${response.status}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = userDoc.original_name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the object URL
        window.URL.revokeObjectURL(url);
        console.log('PDF download completed');
      } else {
        console.log('Converting image to PDF');
        // For images and other files, convert to PDF
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = async () => {
            try {
              console.log('Image loaded, creating PDF');
              const jsPDF = (await import('jspdf')).default;
              const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
              });

              // Calculate dimensions to fit A4
              const imgWidth = 190;
              const imgHeight = img.height * imgWidth / img.width;
              const pageHeight = 287;
              if (imgHeight <= pageHeight) {
                pdf.addImage(img, 'JPEG', 10, 10, imgWidth, imgHeight);
              } else {
                // Handle multi-page documents
                let remainingHeight = imgHeight;
                let position = 0;
                while (remainingHeight > 0) {
                  if (position > 0) {
                    pdf.addPage();
                  }
                  pdf.addImage(img, 'JPEG', 10, 10 - position, imgWidth, imgHeight);
                  remainingHeight -= pageHeight;
                  position += pageHeight;
                }
              }

              // Download the PDF
              const fileName = userDoc.original_name.replace(/\.[^/.]+$/, '.pdf');
              pdf.save(fileName);
              console.log('PDF conversion and download completed');
              resolve(true);
            } catch (error) {
              console.error('Error converting to PDF:', error);
              reject(error);
            }
          };
          img.onerror = error => {
            console.error('Error loading image for PDF conversion:', error);
            reject(error);
          };
          img.src = data.publicUrl;
        }).catch(() => {
          // Fallback to direct download
          const link = document.createElement('a');
          link.href = data.publicUrl;
          link.download = userDoc.original_name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
      toast({
        title: "Download gestartet",
        description: `${userDoc.original_name} wird als PDF heruntergeladen.`
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Fehler beim Download",
        description: "Datei konnte nicht heruntergeladen werden.",
        variant: "destructive"
      });
    }
  };
  const handleDeleteDocument = async (userDoc: UserDocument) => {
    try {
      // Delete from storage
      await deleteFile('documents', userDoc.filename);

      // Delete from database
      const {
        error
      } = await supabase.from('user_documents').delete().eq('id', userDoc.id);
      if (error) throw error;

      // Reload documents
      await loadUserDocuments();
      toast({
        title: "Datei gelöscht",
        description: `${userDoc.original_name} wurde entfernt.`
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Datei konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };
  const handleLanguagesChange = async (languages: any[]) => {
    try {
      await onProfileUpdate({
        sprachen: languages
      });
      await regenerateCV();
    } catch (error) {
      console.error('Error updating languages:', error);
    }
  };
  const handleSkillsChange = async (skills: string[]) => {
    try {
      await onProfileUpdate({
        faehigkeiten: skills
      });
      await regenerateCV();
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  };
  const regenerateCV = async () => {
    if (!profile.id || !profile.vorname || !profile.nachname) return;
    try {
      // Regenerate CV silently when profile data changes
      const {
        regenerateCVFromProfile
      } = await import('@/utils/profileSync');
      await regenerateCVFromProfile(profile.id, profile);
    } catch (error) {
      console.error('Error regenerating CV:', error);
    }
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
    has_drivers_license: profile?.has_drivers_license,
    driver_license_class: profile?.driver_license_class,
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
    const commonProps = {
      data: cvData,
      className: "scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none"
    };
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
      case 1:
        return 'Modern';
      case 2:
        return 'Classic';
      case 3:
        return 'Creative';
      case 4:
        return 'Minimal';
      case 5:
        return 'Professional';
      case 6:
        return 'LiveCareer';
      default:
        return 'Modern';
    }
  };
  return <div className="space-y-6">
      {/* CV Section - Always show CV for everyone */}
      {(
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-between flex-wrap gap-2">
              Mein Lebenslauf
              {!readOnly && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setShowCVPreview(!showCVPreview)} className="h-8 w-8 p-0 hidden md:inline-flex">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!readOnly && showCVPreview && !isMobile && profile?.vorname && profile?.nachname ? (
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-muted px-3 py-2 text-xs sm:text-sm font-medium flex flex-wrap justify-between items-center gap-2">
                  <span className="truncate">Vorschau: {getLayoutName()}</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowCVPreview(false)} className="h-6 w-6 p-0 min-w-[24px]">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="h-32 sm:h-48 overflow-hidden relative">
                  {renderCVLayout()}
                </div>
              </div>
            ) : (
              !readOnly && showCVPreview && (!profile?.vorname || !profile?.nachname) ? (
                <div className="border rounded-lg p-3 sm:p-4 text-center text-muted-foreground">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm">Vervollständigen Sie Ihr Profil für eine CV-Vorschau</p>
                </div>
              ) : null
            )}
            
            <Button onClick={handleDownloadCV} disabled={isGeneratingPDF} className="w-full bg-primary hover:bg-primary/90 text-sm" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{isGeneratingPDF ? 'Generiere...' : 'CV herunterladen'}</span>
              <span className="sm:hidden">{isGeneratingPDF ? 'Gen...' : 'Download'}</span>
            </Button>
            
            {!readOnly && (
              <Button onClick={handleEditCV} variant="outline" className="w-full text-sm" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">CV bearbeiten</span>
                <span className="sm:hidden">Bearbeiten</span>
              </Button>
            )}
            
            {profile?.updated_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-start">
                <Clock className="h-3 w-3" />
                zuletzt aktualisiert: {formatDate(profile.updated_at)}
              </div>
            )}
          </CardContent>
         </Card>
      )}

      {/* Document Section - Show for companies or if documents exist or not readonly */}
      {(isCompanyViewing || !readOnly || userDocuments.length > 0) && <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {readOnly ? "Zeugnisse & Zertifikate" : "Dokumente hochladen"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!readOnly && <div className="relative">
                <Input type="file" multiple accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" id="document-upload" />
                <Button variant="outline" className="w-full" onClick={() => document.getElementById('document-upload')?.click()} disabled={isUploadingDocument}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingDocument ? 'Uploading...' : 'Zeugnisse & Zertifikate'}
                </Button>
              </div>}
            
            {isLoadingDocuments ? <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div> : userDocuments.length > 0 ? <div className="space-y-2">
                <p className="text-sm font-medium">
                  {readOnly ? "Verfügbare Dokumente:" : "Gespeicherte Dokumente:"}
                </p>
                {userDocuments.map(doc => <div key={doc.id} className="flex flex-wrap items-center justify-between text-xs bg-muted p-2 rounded">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{doc.original_name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadDocument(doc)} className="h-6 w-6 p-0" title="Herunterladen">
                        <Download className="h-3 w-3" />
                      </Button>
                      {!readOnly && <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc)} className="h-6 w-6 p-0 text-destructive hover:text-destructive" title="Löschen">
                          <Trash2 className="h-3 w-3" />
                        </Button>}
                    </div>
                  </div>)}
              </div> : readOnly ? null : <p className="text-sm text-muted-foreground">Noch keine Dokumente hochgeladen.</p>}
          </CardContent>
        </Card>}

      {/* Contact Information */}
      

      {/* Languages - Only show if data exists or not readonly */}
{showLanguagesAndSkills && (profile?.sprachen?.length > 0 || !readOnly) && (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Sprachen</CardTitle>
    </CardHeader>
    <CardContent>
      {!readOnly && isEditing ? (
        <LanguageSelector languages={profile?.sprachen || []} onLanguagesChange={handleLanguagesChange} />
      ) : (
        <div className="space-y-2">
          {profile?.sprachen && profile.sprachen.length > 0 ? (
            profile.sprachen.map((lang: any, index: number) => (
              <div key={index} className="flex flex-wrap justify-between items-center gap-2">
                <span className="font-medium">{lang.sprache}</span>
                <Badge variant="secondary">{lang.niveau}</Badge>
              </div>
            ))
          ) : (
            !readOnly && <p className="text-muted-foreground text-sm">Keine Sprachen hinzugefügt</p>
          )}
        </div>
      )}
    </CardContent>
  </Card>
)}

      {/* Skills - Only show if data exists or not readonly */}
{showLanguagesAndSkills && (profile?.faehigkeiten?.length > 0 || !readOnly) && (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Fähigkeiten</CardTitle>
    </CardHeader>
    <CardContent>
      {!readOnly && isEditing ? (
        <SkillSelector selectedSkills={profile?.faehigkeiten || []} onSkillsChange={handleSkillsChange} branch={profile?.branche} statusLevel={profile?.status} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {profile?.faehigkeiten && profile.faehigkeiten.length > 0 ? (
            profile.faehigkeiten.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))
          ) : (
            !readOnly && <p className="text-muted-foreground text-sm">Keine Fähigkeiten hinzugefügt</p>
          )}
        </div>
      )}
    </CardContent>
  </Card>
)}

      {/* Driver's License - Only show if data exists or not readonly */}
{showLicenseAndStats && (profile?.has_drivers_license !== null && profile?.has_drivers_license !== undefined || !readOnly) && (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Führerschein</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {profile?.has_drivers_license ? (
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Führerschein {profile?.driver_license_class || 'vorhanden'}
            </span>
          </div>
        ) : profile?.has_drivers_license === false ? (
          <p className="text-muted-foreground text-sm">Kein Führerschein vorhanden</p>
        ) : (
          !readOnly && <p className="text-muted-foreground text-sm">Führerschein-Status nicht angegeben</p>
        )}
      </div>
    </CardContent>
  </Card>
)}

      {/* Profile Stats */}
{showLicenseAndStats && (
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
)}
    </div>;
};