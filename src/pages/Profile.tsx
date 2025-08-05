import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Download, 
  User, 
  MessageCircle, 
  UserPlus,
  Settings,
  FileUp,
  Star,
  Briefcase,
  GraduationCap,
  Languages,
  Award,
  Eye,
  Upload
} from 'lucide-react';
import { generatePDF, generateCVFilename } from '@/lib/pdf-generator';
import { CVFormData } from "@/contexts/CVFormContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfilePreviewModal } from "@/components/ProfilePreviewModal";

const Profile = () => {
  const [cvData, setCvData] = useState<CVFormData | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and load profile data
    const checkAuthAndLoadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsAuthenticated(true);
        
        // Load profile from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && !error) {
          setProfileData(profile);
          
          // Convert profile back to CVFormData format for compatibility
          const cvFormData: CVFormData = {
            branche: profile.branche as any,
            status: profile.status as any,
            vorname: profile.vorname,
            nachname: profile.nachname,
            geburtsdatum: profile.geburtsdatum ? new Date(profile.geburtsdatum) : undefined,
            strasse: profile.strasse,
            hausnummer: profile.hausnummer,
            plz: profile.plz,
            ort: profile.city,
            telefon: profile.telefon,
            email: profile.email,
            profilbild: profile.profilbild_url,
            schule: profile.schule,
            geplanter_abschluss: profile.geplanter_abschluss,
            abschlussjahr: profile.abschlussjahr,
            ausbildungsberuf: profile.ausbildungsberuf,
            ausbildungsbetrieb: profile.ausbildungsbetrieb,
            startjahr: profile.startjahr,
            voraussichtliches_ende: profile.voraussichtliches_ende,
            abschlussjahr_ausgelernt: profile.abschlussjahr_ausgelernt,
            aktueller_beruf: profile.aktueller_beruf,
            sprachen: typeof profile.sprachen === 'string' ? JSON.parse(profile.sprachen) : profile.sprachen,
            faehigkeiten: profile.faehigkeiten,
            schulbildung: typeof profile.schulbildung === 'string' ? JSON.parse(profile.schulbildung) : profile.schulbildung,
            berufserfahrung: typeof profile.berufserfahrung === 'string' ? JSON.parse(profile.berufserfahrung) : profile.berufserfahrung,
            layout: profile.layout_id,
            ueberMich: profile.ueber_mich,
            einwilligung: profile.einwilligung
          };
          
          setCvData(cvFormData);
        } else {
          // No profile found, check localStorage
          const savedCvData = localStorage.getItem('cvData');
          if (savedCvData) {
            const parsedData = JSON.parse(savedCvData);
            if (parsedData.geburtsdatum) {
              parsedData.geburtsdatum = new Date(parsedData.geburtsdatum);
            }
            setCvData(parsedData);
          } else {
            navigate('/cv-generator');
          }
        }
      } else {
        // Not authenticated, check localStorage
        const savedCvData = localStorage.getItem('cvData');
        if (savedCvData) {
          const parsedData = JSON.parse(savedCvData);
          if (parsedData.geburtsdatum) {
            parsedData.geburtsdatum = new Date(parsedData.geburtsdatum);
          }
          setCvData(parsedData);
        } else {
          navigate('/cv-generator');
        }
      }
    };

    checkAuthAndLoadProfile();
  }, [navigate]);

  const handleDownloadPDF = async () => {
    if (!cvData?.vorname || !cvData?.nachname) {
      toast({
        title: "Fehler",
        description: "Vor- und Nachname sind erforderlich für den PDF-Download.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const filename = generateCVFilename(cvData.vorname, cvData.nachname);
      const cvPreviewElement = document.querySelector('[data-cv-preview]') as HTMLElement;
      
      if (!cvPreviewElement) {
        throw new Error('CV Preview nicht gefunden');
      }

      await generatePDF(cvPreviewElement, {
        filename,
        quality: 2,
        format: 'a4',
        margin: 10
      });

      toast({
        title: "PDF erfolgreich erstellt",
        description: `Dein Lebenslauf wurde als ${filename} heruntergeladen.`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Fehler beim Erstellen der PDF",
        description: "Es gab ein Problem beim Erstellen deines Lebenslaufs.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEditProfile = () => {
    toast({
      title: "Information",
      description: "Profil-Bearbeitung wird bald verfügbar sein!"
    });
  };

  const handlePublishProfile = () => {
    if (!cvData) return;
    setIsPreviewModalOpen(true);
  };

  const handleProfilePublished = () => {
    setProfileData((prev: any) => ({ ...prev, profile_published: true }));
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('de-DE');
  };

  const getBrancheTitle = (branche?: string) => {
    const titles = {
      'handwerk': 'Handwerk',
      'it': 'IT & Technik',
      'gesundheit': 'Gesundheit & Pflege'
    };
    return branche ? titles[branche as keyof typeof titles] || branche : '';
  };

  const getStatusTitle = (status?: string) => {
    const titles = {
      'schueler': 'Schüler',
      'azubi': 'Azubi',
      'ausgelernt': 'Geselle/Fachkraft'
    };
    return status ? titles[status as keyof typeof titles] || status : '';
  };

  const getBranchenFarben = (branche?: string) => {
    const farben = {
      'handwerk': {
        primary: 'bg-orange-500',
        secondary: 'bg-orange-100',
        text: 'text-orange-700'
      },
      'it': {
        primary: 'bg-blue-500',
        secondary: 'bg-blue-100',
        text: 'text-blue-700'
      },
      'gesundheit': {
        primary: 'bg-green-500',
        secondary: 'bg-green-100',
        text: 'text-green-700'
      }
    };
    return farben[branche as keyof typeof farben] || farben.it;
  };

  const getSprachNiveauBars = (niveau: string) => {
    const niveaus = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6, 'Muttersprache': 6 };
    const stufe = niveaus[niveau as keyof typeof niveaus] || 0;
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
            className={`w-3 h-3 rounded-sm ${
              level <= stufe ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  const getLayoutStyles = (layoutId?: number) => {
    const layouts = [
      'cv-layout-klassisch',
      'cv-layout-modern', 
      'cv-layout-kreativ',
      'cv-layout-technisch',
      'cv-layout-handwerk'
    ];
    return layoutId ? layouts[layoutId - 1] || layouts[0] : layouts[0];
  };

  if (!cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const branchenFarben = getBranchenFarben(cvData.branche);

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
      </div>

      <div className="relative">
        {/* Profile Section */}
        <div className="container mx-auto px-4">
          {/* White background for profile info */}
          <div className="bg-background relative -mt-16 md:-mt-20 rounded-t-lg pb-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6 pt-6 px-6">
              {/* Profile Picture */}
              <div className="relative -mt-16 md:-mt-20">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
                  {cvData.profilbild ? (
                    <img
                      src={typeof cvData.profilbild === 'string' ? cvData.profilbild : URL.createObjectURL(cvData.profilbild)}
                      alt="Profilbild"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Status Badge */}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className={`${branchenFarben.primary} text-white shadow-lg`}>
                    <Briefcase className="h-3 w-3 mr-1" />
                    {getBrancheTitle(cvData.branche)}
                  </Badge>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-3 pt-2">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {cvData.vorname} {cvData.nachname}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground font-medium mb-2">
                    {getStatusTitle(cvData.status)} • {getBrancheTitle(cvData.branche)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {cvData.ort}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Mitglied seit {new Date().getFullYear()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Conditional based on profile status */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {isAuthenticated && profileData ? (
                    <>
                      <Button variant="outline" onClick={handleEditProfile}>
                        <User className="h-4 w-4 mr-2" />
                        Profil bearbeiten
                      </Button>
                      
                      {!profileData.profile_published && (
                        <Button onClick={handlePublishProfile} className="bg-primary hover:bg-primary/90">
                          <Upload className="h-4 w-4 mr-2" />
                          Profil hochladen
                        </Button>
                      )}
                      
                      {profileData.profile_published && (
                        <Badge variant="default" className="px-3 py-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Öffentlich sichtbar
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => navigate('/cv-generator')}>
                      <User className="h-4 w-4 mr-2" />
                      Account erstellen
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGeneratingPDF ? 'Generiere PDF...' : 'CV als PDF'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Profil-Statistiken</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Profil-Ansichten</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bewerbungen</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vollständigkeit</span>
                    <Badge variant="default">95%</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Kontaktinformationen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cvData.telefon && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{cvData.telefon}</span>
                    </div>
                  )}
                  {cvData.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{cvData.email}</span>
                    </div>
                  )}
                  {(cvData.strasse || cvData.ort) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        {cvData.strasse && cvData.hausnummer && (
                          <div>{cvData.strasse} {cvData.hausnummer}</div>
                        )}
                        {cvData.plz && cvData.ort && (
                          <div>{cvData.plz} {cvData.ort}</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Languages */}
              {cvData.sprachen && cvData.sprachen.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Sprachen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {cvData.sprachen.map((sprache, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{sprache.sprache}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{sprache.niveau}</span>
                          {getSprachNiveauBars(sprache.niveau)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* About Me */}
              {cvData.ueberMich && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Über mich
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {cvData.ueberMich}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Professional Experience */}
              {cvData.berufserfahrung && cvData.berufserfahrung.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Berufserfahrung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {cvData.berufserfahrung.map((job, index) => (
                      <div key={index} className="relative">
                        {index < cvData.berufserfahrung!.length - 1 && (
                          <div className="absolute left-0 top-8 w-px h-full bg-border" />
                        )}
                        <div className="flex gap-4">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 relative z-10" />
                          <div className="flex-1 pb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <h3 className="font-semibold text-foreground">{job.titel}</h3>
                              <Badge variant="outline" className="w-fit">
                                {job.zeitraum_von} - {job.zeitraum_bis}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {job.unternehmen} • {job.ort}
                            </p>
                            {job.beschreibung && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {job.beschreibung}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {cvData.schulbildung && cvData.schulbildung.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Ausbildung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {cvData.schulbildung.map((edu, index) => (
                      <div key={index} className="relative">
                        {index < cvData.schulbildung!.length - 1 && (
                          <div className="absolute left-0 top-8 w-px h-full bg-border" />
                        )}
                        <div className="flex gap-4">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 relative z-10" />
                          <div className="flex-1 pb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <h3 className="font-semibold text-foreground">{edu.schulform}</h3>
                              <Badge variant="outline" className="w-fit">
                                {edu.zeitraum_von} - {edu.zeitraum_bis}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {edu.name} • {edu.ort}
                            </p>
                            {edu.beschreibung && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {edu.beschreibung}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {cvData.faehigkeiten && cvData.faehigkeiten.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Fähigkeiten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {cvData.faehigkeiten.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    Dokumente
                  </CardTitle>
                  <CardDescription>
                    Lade wichtige Dokumente wie Zeugnisse oder Zertifikate hoch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Keine Dokumente hochgeladen
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Dokument hinzufügen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Hidden CV Preview for PDF Generation */}
        <div className="hidden">
          {(() => {
            if (!cvData) return null;
            
            const layoutClasses = getLayoutStyles(cvData.layout);
            
            return (
              <div 
                data-cv-preview 
                className={`cv-container ${layoutClasses} bg-white text-black min-h-[297mm] w-[210mm] mx-auto p-8 font-sans`}
                style={{
                  fontSize: '12px',
                  lineHeight: '1.4',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {/* CV content would be rendered here */}
                <div className="cv-content">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">{cvData.vorname} {cvData.nachname}</h1>
                    <p className="text-gray-600">{getStatusTitle(cvData.status)} • {getBrancheTitle(cvData.branche)}</p>
                  </div>
                  
                  {cvData.ueberMich && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold mb-2 border-b">Über mich</h2>
                      <p>{cvData.ueberMich}</p>
                    </div>
                  )}
                  
                  {/* More CV sections would be rendered here */}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Profile Preview Modal */}
        {cvData && (
          <ProfilePreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            profileData={cvData}
            onPublish={handleProfilePublished}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;