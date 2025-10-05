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
import { CompanyRecommendations } from '@/components/linkedin/right-rail/CompanyRecommendations';
import WeitereDokumenteWidget from '@/components/profile/WeitereDokumenteWidget';
import { WeitereDokumenteSection } from '@/components/linkedin/right-rail/WeitereDokumenteSection';
import { UnlockService } from '@/services/unlockService';
import { toast as sonnerToast } from 'sonner';
import { useCompany } from '@/hooks/useCompany';

// Import CV layout components
import ModernLayout from '@/components/cv-layouts/ModernLayout';
import ClassicLayout from '@/components/cv-layouts/ClassicLayout';
import CreativeLayout from '@/components/cv-layouts/CreativeLayout';
import MinimalLayout from '@/components/cv-layouts/MinimalLayout';
import ProfessionalLayout from '@/components/cv-layouts/ProfessionalLayout';
import LiveCareerLayout from '@/components/cv-layouts/LiveCareerLayout';
import ClassicV2Layout from '@/components/cv-layouts/ClassicV2Layout';

interface LinkedInProfileSidebarProps {
  profile: any;
  isEditing: boolean;
  onProfileUpdate: (updates: any) => void;
  readOnly?: boolean;
  showLanguagesAndSkills?: boolean;
  showLicenseAndStats?: boolean;
  showCVSection?: boolean;
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
  showCVSection = true
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isDokumenteWidgetOpen, setIsDokumenteWidgetOpen] = useState(false);
  const [isUnlockingCV, setIsUnlockingCV] = useState(false);
  const [unlockState, setUnlockState] = useState<{basic: boolean, contact: boolean}>({basic: false, contact: false});
  const [isCheckingUnlock, setIsCheckingUnlock] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { company } = useCompany();

  // Helper functions for pipeline and recently viewed
  const addToRecentlyViewed = async (profileId: string) => {
    if (!company?.id) return;
    
    try {
      await supabase.from('recently_viewed_profiles').upsert({
        company_id: company.id,
        profile_id: profileId,
        viewed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  const addToPipeline = async (profileId: string) => {
    if (!company?.id) return;
    
    try {
      // Get or create default pipeline
      const { data: pipelines } = await supabase
        .from('company_pipelines')
        .select('id')
        .eq('company_id', company.id)
        .eq('is_default', true)
        .single();

      let pipelineId = pipelines?.id;
      
      if (!pipelineId) {
        // Create default pipeline
        const { data: newPipeline } = await supabase
          .from('company_pipelines')
          .insert({
            company_id: company.id,
            name: 'Standard Pipeline',
            is_default: true
          })
          .select('id')
          .single();
        
        pipelineId = newPipeline?.id;
      }

      if (pipelineId) {
        // Get first stage
        const { data: firstStage } = await supabase
          .from('pipeline_stages')
          .select('id')
          .eq('pipeline_id', pipelineId)
          .order('order_index')
          .limit(1)
          .single();

        if (firstStage) {
          await supabase.from('pipeline_items').upsert({
            company_id: company.id,
            pipeline_id: pipelineId,
            stage_id: firstStage.id,
            profile_id: profileId,
            added_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error adding to pipeline:', error);
    }
  };

  // Check unlock state and log profile view
  useEffect(() => {
    const checkUnlockState = async () => {
      if (!profile?.id || !company?.id || !readOnly) return;
      
      setIsCheckingUnlock(true);
      try {
        const unlockService = new UnlockService();
        const state = await unlockService.getUnlockState(profile.id);
        setUnlockState(state);
        
        // Log profile view
        await unlockService.logProfileView(profile.id);
        
        // Add to recently viewed
        await addToRecentlyViewed(profile.id);
        
      } catch (error) {
        console.error('Error checking unlock state:', error);
      } finally {
        setIsCheckingUnlock(false);
      }
    };

    checkUnlockState();
  }, [profile?.id, company?.id, readOnly]);

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

      // Import CV layouts dynamically
      const ClassicV2Layout = (await import('@/components/cv-layouts/ClassicV2Layout')).default;

      // Select correct layout based on profile.layout
      let LayoutComponent;
      const layoutId = profile.layout || 1;
      console.log('Generating PDF with layout:', layoutId);
      
      switch (layoutId) {
        case 1:
          LayoutComponent = ModernLayout;
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
          LayoutComponent = LiveCareerLayout;
          break;
        case 7:
          LayoutComponent = ClassicV2Layout;
          break;
        default:
          LayoutComponent = ModernLayout;
      }

      // Prepare CV data
      const cvData = {
        vorname: profile.vorname,
        nachname: profile.nachname,
        email: profile.email,
        telefon: profile.telefon,
        geburtsdatum: profile.geburtsdatum,
        strasse: profile.strasse,
        hausnummer: profile.hausnummer,
        plz: profile.plz,
        ort: profile.ort,
        branche: profile.branche,
        status: profile.status,
        ueberMich: profile.uebermich || profile.bio || '',
        sprachen: profile.sprachen || [],
        faehigkeiten: profile.faehigkeiten || [],
        schulbildung: profile.schulbildung || [],
        berufserfahrung: profile.berufserfahrung || [],
        avatar_url: profile.avatar_url,
        profilbild: profile.avatar_url,
        has_drivers_license: profile.has_drivers_license,
        driver_license_class: profile.driver_license_class,
      };

      // Create and render CV element
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const cvElement = React.createElement(LayoutComponent, { data: cvData });
      const root = ReactDOM.createRoot(tempContainer);
      root.render(cvElement);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Find ONLY the CV preview element (not the whole page!)
      const cvPreviewElement = tempContainer.querySelector('[data-cv-preview]') as HTMLElement;
      if (!cvPreviewElement) {
        console.error('CV preview not found in container:', tempContainer.innerHTML);
        throw new Error('CV preview element not found');
      }

      console.log('Generating PDF from element:', cvPreviewElement);

      // Generate PDF from ONLY the CV element
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(cvPreviewElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Download PDF
      const filename = `CV_${profile.vorname}_${profile.nachname}.pdf`;
      pdf.save(filename);

      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);

      toast({
        title: "CV erfolgreich erstellt",
        description: `Dein Lebenslauf wurde als ${filename} heruntergeladen.`
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
    if (profile?.id) {
      loadUserDocuments();
    }
  }, [profile?.id]);

  const loadUserDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', profile.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.warn('Documents table might not exist:', error);
        setUserDocuments([]);
        return;
      }
      setUserDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      setUserDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleDownloadDocument = async (userDoc: UserDocument) => {
    try {
      console.log('Starting download for:', userDoc);
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(userDoc.filename);

      if (userDoc.file_type === 'application/pdf') {
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
        window.URL.revokeObjectURL(url);
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = async () => {
            try {
              const jsPDF = (await import('jspdf')).default;
              const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
              });

              const imgWidth = 190;
              const imgHeight = img.height * imgWidth / img.width;
              const pageHeight = 287;
              
              if (imgHeight <= pageHeight) {
                pdf.addImage(img, 'JPEG', 10, 10, imgWidth, imgHeight);
              } else {
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

              const fileName = userDoc.original_name.replace(/\.[^/.]+$/, '.pdf');
              pdf.save(fileName);
              resolve(true);
            } catch (error) {
              console.error('Error converting to PDF:', error);
              reject(error);
            }
          };
          img.onerror = reject;
          img.src = data.publicUrl;
        }).catch(() => {
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
    // Bestätigung für das Löschen
    const confirmed = window.confirm(
      `Möchten Sie das Dokument "${userDoc.original_name}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`
    );
    
    if (!confirmed) return;

    try {
      await deleteFile('documents', userDoc.filename);
      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', userDoc.id);
      if (error) throw error;

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
      await onProfileUpdate({ sprachen: languages });
      await regenerateCV();
    } catch (error) {
      console.error('Error updating languages:', error);
    }
  };

  const handleSkillsChange = async (skills: string[]) => {
    try {
      await onProfileUpdate({ faehigkeiten: skills });
      await regenerateCV();
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  };

  const regenerateCV = async () => {
    if (!profile.id || !profile.vorname || !profile.nachname) return;
    try {
      const { regenerateCVFromProfile } = await import('@/utils/profileSync');
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
      case 7:
        return <ClassicV2Layout {...commonProps} />;
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
      case 7:
        return 'Klassisch V2';
      default:
        return 'Modern';
    }
  };

  return (
    <div className="space-y-6">
      {/* CV Section - Show only if allowed */}
      {showCVSection && (
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
            
            {readOnly ? (
              <Button 
                onClick={async () => {
                  if (!profile?.id) return;
                  
                  setIsUnlockingCV(true);
                  try {
                    const unlockService = new UnlockService();
                    const result = await unlockService.unlockBasic({
                      profileId: profile.id,
                      generalInterest: true
                    });

                    switch (result) {
                      case 'unlocked_basic':
                        sonnerToast.success('Profil erfolgreich freigeschaltet! Sie können jetzt alle Daten sehen.');
                        // Add to pipeline
                        await addToPipeline(profile.id);
                        // Refresh unlock state
                        const newState = await unlockService.getUnlockState(profile.id);
                        setUnlockState(newState);
                        break;
                      case 'already_basic':
                        sonnerToast.info('Profil ist bereits freigeschaltet.');
                        break;
                      case 'insufficient_funds':
                        sonnerToast.error('Nicht genügend Tokens verfügbar. Bitte laden Sie Ihr Wallet auf.');
                        break;
                      case 'error':
                        sonnerToast.error('Fehler beim Freischalten des Profils. Bitte versuchen Sie es erneut.');
                        break;
                      default:
                        sonnerToast.error('Unbekannter Fehler beim Freischalten.');
                    }
                  } catch (error) {
                    console.error('Error unlocking profile:', error);
                    sonnerToast.error('Fehler beim Freischalten des Profils.');
                  } finally {
                    setIsUnlockingCV(false);
                  }
                }}
                disabled={isUnlockingCV || unlockState.basic}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm" 
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  {isUnlockingCV ? 'Freischalten...' : unlockState.basic ? 'Profil freigeschaltet' : 'Profil freischalten (1 Token)'}
                </span>
                <span className="sm:hidden">
                  {isUnlockingCV ? 'Freischalten...' : unlockState.basic ? 'Freigeschaltet' : 'Freischalten'}
                </span>
              </Button>
            ) : (
              <Button onClick={handleDownloadCV} disabled={isGeneratingPDF} className="w-full bg-primary hover:bg-primary/90 text-sm" size="sm">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{isGeneratingPDF ? 'Generiere...' : 'CV herunterladen'}</span>
                <span className="sm:hidden">{isGeneratingPDF ? 'Gen...' : 'Download'}</span>
              </Button>
            )}
            
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

      {/* Neue gruppierte Dokumenten-Sektion */}
      <WeitereDokumenteSection
        userId={profile?.id}
        readOnly={readOnly}
        openWidget={() => setIsDokumenteWidgetOpen(true)}
      />

      {/* Languages */}
      {showLanguagesAndSkills && (
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
                  <p className="text-muted-foreground text-sm">Keine Sprachen hinzugefügt</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {showLanguagesAndSkills && (
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
                  <p className="text-muted-foreground text-sm">Keine Fähigkeiten hinzugefügt</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Driver's License */}
      {showLicenseAndStats && (
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
                <p className="text-muted-foreground text-sm">Führerschein-Status nicht angegeben</p>
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

      {/* Company Recommendations */}
      <CompanyRecommendations limit={3} showMore={true} showMoreLink="/entdecken/unternehmen" />

      {/* WeitereDokumenteWidget PopUp */}
      <WeitereDokumenteWidget 
        isOpen={isDokumenteWidgetOpen} 
        onClose={() => setIsDokumenteWidgetOpen(false)}
        userId={profile?.id}
        onDocumentUploaded={loadUserDocuments}
      />
    </div>
  );
};
