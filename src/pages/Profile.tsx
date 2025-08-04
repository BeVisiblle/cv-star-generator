import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, User, UserPlus, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CVFormData } from "@/contexts/CVFormContext";
import { toast } from "@/hooks/use-toast";
import { generatePDF, generateCVFilename } from '@/lib/pdf-generator';

const Profile = () => {
  const [cvData, setCvData] = useState<CVFormData | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load CV data from localStorage
    const storedData = localStorage.getItem('cvFormData');
    if (storedData) {
      try {
        setCvData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error loading CV data:', error);
        toast({
          title: "Fehler",
          description: "CV-Daten konnten nicht geladen werden.",
          variant: "destructive"
        });
      }
    } else {
      // No CV data found, redirect to generator
      navigate('/cv-generator');
    }
  }, [navigate]);

  const getBrancheTitle = (branche?: string) => {
    switch (branche) {
      case 'handwerk': return 'Handwerk';
      case 'it': return 'IT & Technik';
      case 'gesundheit': return 'Gesundheit & Pflege';
      default: return 'Nicht angegeben';
    }
  };

  const getStatusTitle = (status?: string) => {
    switch (status) {
      case 'schueler': return 'Schüler';
      case 'azubi': return 'Azubi';
      case 'ausgelernt': return 'Ausgelernt';
      default: return 'Nicht angegeben';
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvData) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = document.querySelector('[data-cv-preview]') as HTMLElement;
      if (!element) {
        throw new Error('CV preview element not found');
      }
      
      const filename = generateCVFilename(
        cvData.vorname || 'CV',
        cvData.nachname || 'User'
      );
      
      await generatePDF(element, { filename });
      toast({
        title: "PDF erfolgreich erstellt!",
        description: "Ihr Lebenslauf wurde heruntergeladen.",
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "Fehler beim PDF-Export",
        description: "Das PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCreateAccount = () => {
    // CV data is already in localStorage, just redirect to auth
    navigate('/auth');
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('de-DE').format(new Date(date));
  };

  const getBranchenFarben = () => {
    switch (cvData?.branche) {
      case 'handwerk':
        return {
          primary: 'from-orange-600 to-red-600',
          text: 'text-orange-600',
          border: 'border-orange-600/30',
          bg: 'bg-orange-600/10'
        };
      case 'it':
        return {
          primary: 'from-blue-600 to-indigo-600',
          text: 'text-blue-600',
          border: 'border-blue-600/30',
          bg: 'bg-blue-600/10'
        };
      case 'gesundheit':
        return {
          primary: 'from-green-600 to-emerald-600',
          text: 'text-green-600',
          border: 'border-green-600/30',
          bg: 'bg-green-600/10'
        };
      default:
        return {
          primary: 'from-gray-600 to-gray-700',
          text: 'text-gray-600',
          border: 'border-gray-600/30',
          bg: 'bg-gray-600/10'
        };
    }
  };

  const getSprachNiveauBars = (niveau: string) => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Muttersprache'];
    const currentLevel = niveau === 'Muttersprache' ? 6 : levels.indexOf(niveau);
    const bars = [];
    const colors = getBranchenFarben();
    
    for (let i = 0; i < 6; i++) {
      bars.push(
        <div
          key={i}
          className={`h-2 w-4 rounded-sm ${
            i <= currentLevel ? colors.bg.replace('bg-', 'bg-').replace('/10', '') : 'bg-muted'
          }`}
        />
      );
    }
    return bars;
  };

  const getLayoutStyles = () => {
    const colors = getBranchenFarben();
    
    switch (cvData?.layout) {
      case 1: // Klassisch
        return {
          container: 'max-w-3xl mx-auto bg-white border border-gray-300 shadow-md',
          header: `bg-gradient-to-r ${colors.primary} text-white p-6`,
          grid: 'block space-y-6 p-6',
          sectionTitle: `text-lg font-serif ${colors.text} mb-3 border-b ${colors.border} pb-1`,
          accent: colors.bg
        };
      case 2: // Modern
        return {
          container: 'max-w-4xl mx-auto bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden',
          header: `bg-gradient-to-r ${colors.primary} text-white p-8`,
          grid: 'grid md:grid-cols-3 gap-8 p-8',
          sectionTitle: `text-lg font-semibold ${colors.text} mb-3 border-b ${colors.border} pb-1`,
          accent: colors.bg
        };
      case 3: // Kreativ
        return {
          container: 'max-w-4xl mx-auto bg-white border-l-4 border-r-4 border-t border-b border-gray-200 shadow-xl',
          header: `bg-gradient-to-45deg ${colors.primary} text-white p-8 transform -skew-y-1`,
          grid: 'grid md:grid-cols-5 gap-6 p-8',
          sectionTitle: `text-xl font-bold ${colors.text} mb-4 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:${colors.bg.replace('bg-', 'bg-').replace('/10', '')}`,
          accent: colors.bg
        };
      case 4: // Minimalistisch
        return {
          container: 'max-w-3xl mx-auto bg-white border-none shadow-none',
          header: `bg-white text-gray-900 p-8 border-b-2 ${colors.border}`,
          grid: 'block space-y-8 p-8',
          sectionTitle: `text-base font-medium ${colors.text} mb-2 uppercase tracking-wide`,
          accent: 'bg-transparent'
        };
      case 5: // Professionell
        return {
          container: 'max-w-4xl mx-auto bg-white border border-gray-300 shadow-lg',
          header: `bg-gray-50 text-gray-900 p-8 border-b-2 ${colors.border}`,
          grid: 'grid md:grid-cols-4 gap-8 p-8',
          sectionTitle: `text-lg font-semibold ${colors.text} mb-3 pb-2 border-b ${colors.border}`,
          accent: colors.bg
        };
      default:
        return {
          container: 'max-w-4xl mx-auto bg-white border border-gray-200 shadow-lg',
          header: `bg-gradient-to-r ${colors.primary} text-white p-8`,
          grid: 'grid md:grid-cols-3 gap-8 p-8',
          sectionTitle: `text-lg font-semibold ${colors.text} mb-3 border-b ${colors.border} pb-1`,
          accent: colors.bg
        };
    }
  };

  if (!cvData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p>CV-Daten werden geladen...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Startseite
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Mein Profil</h1>
              <p className="text-muted-foreground">Temporär gespeichert</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isGeneratingPDF ? 'Erstelle PDF...' : 'PDF herunterladen'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleCreateAccount}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Account erstellen
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Persönliche Daten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{cvData.vorname} {cvData.nachname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-Mail</p>
                  <p>{cvData.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                  <p>{cvData.telefon}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Geburtsdatum</p>
                  <p>{cvData.geburtsdatum ? new Date(cvData.geburtsdatum).toLocaleDateString('de-DE') : 'Nicht angegeben'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                <p>{cvData.strasse} {cvData.hausnummer}</p>
                <p>{cvData.plz} {cvData.ort}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Branche</p>
                  <Badge variant="secondary">{getBrancheTitle(cvData.branche)}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="secondary">{getStatusTitle(cvData.status)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Me */}
          {cvData.ueberMich && (
            <Card>
              <CardHeader>
                <CardTitle>Über mich</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{cvData.ueberMich}</p>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {cvData.sprachen && cvData.sprachen.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sprachen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {cvData.sprachen.map((sprache, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{sprache.sprache}</span>
                      <Badge variant="outline">{sprache.niveau}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {cvData.faehigkeiten && cvData.faehigkeiten.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fähigkeiten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cvData.faehigkeiten.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {cvData.schulbildung && cvData.schulbildung.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Schulbildung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cvData.schulbildung.map((schule, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4">
                      <h4 className="font-semibold">{schule.schulform}</h4>
                      <p className="text-sm text-muted-foreground">{schule.name}, {schule.ort}</p>
                      <p className="text-sm text-muted-foreground">{schule.zeitraum_von} - {schule.zeitraum_bis}</p>
                      {schule.beschreibung && (
                        <p className="text-sm mt-2">{schule.beschreibung}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          {cvData.berufserfahrung && cvData.berufserfahrung.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Berufserfahrung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cvData.berufserfahrung.map((job, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4">
                      <h4 className="font-semibold">{job.titel}</h4>
                      <p className="text-sm text-muted-foreground">{job.unternehmen}, {job.ort}</p>
                      <p className="text-sm text-muted-foreground">{job.zeitraum_von} - {job.zeitraum_bis}</p>
                      {job.beschreibung && (
                        <p className="text-sm mt-2">{job.beschreibung}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CV Preview for PDF Generation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>CV-Vorschau</CardTitle>
            <CardDescription>
              Ihre Lebenslauf-Daten im gewählten Layout
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const styles = getLayoutStyles();
              const colors = getBranchenFarben();
              
              return (
                <div className={styles.container} data-cv-preview>
                  {/* Header Section */}
                  <div className={styles.header}>
                    <div className="flex items-center gap-6">
                      {cvData.profilbild && (
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                          <img
                            src={typeof cvData.profilbild === 'string' ? cvData.profilbild : 
                              (cvData.profilbild instanceof File ? URL.createObjectURL(cvData.profilbild) : '/placeholder.svg')}
                            alt="Profilbild"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h1 className={`text-3xl font-bold mb-2 ${cvData.layout === 4 || cvData.layout === 5 ? 'text-gray-900' : 'text-white'}`}>
                          {cvData.vorname} {cvData.nachname}
                        </h1>
                        <div className={`text-lg mb-3 ${cvData.layout === 4 || cvData.layout === 5 ? 'text-gray-700' : 'opacity-90'}`}>
                          {getStatusTitle(cvData.status)} - {getBrancheTitle(cvData.branche)}
                        </div>
                        <div className={`flex flex-wrap gap-4 text-sm ${cvData.layout === 4 || cvData.layout === 5 ? 'text-gray-600' : ''}`}>
                          {cvData.telefon && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {cvData.telefon}
                            </div>
                          )}
                          {cvData.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {cvData.email}
                            </div>
                          )}
                          {(cvData.strasse && cvData.ort) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {cvData.strasse} {cvData.hausnummer}, {cvData.plz} {cvData.ort}
                            </div>
                          )}
                          {cvData.geburtsdatum && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(cvData.geburtsdatum)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className={styles.grid}>
                    {/* Left Column for Grid Layouts */}
                    {(cvData.layout === 2 || cvData.layout === 3 || cvData.layout === 5) && (
                      <div className={`${cvData.layout === 3 ? 'md:col-span-2' : cvData.layout === 5 ? 'md:col-span-1' : 'md:col-span-1'} space-y-6`}>
                        {/* Languages */}
                        {cvData.sprachen && cvData.sprachen.length > 0 && (
                          <div>
                            <h3 className={styles.sectionTitle}>
                              Sprachen
                            </h3>
                            <div className="space-y-3">
                              {cvData.sprachen.map((sprache, index) => (
                                <div key={index}>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium">{sprache.sprache}</span>
                                    <span className="text-sm text-muted-foreground">{sprache.niveau}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    {getSprachNiveauBars(sprache.niveau)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills (only for azubi/ausgelernt) */}
                        {(cvData.status === 'azubi' || cvData.status === 'ausgelernt') && cvData.faehigkeiten && cvData.faehigkeiten.length > 0 && (
                          <div>
                            <h3 className={styles.sectionTitle}>
                              Fähigkeiten
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {cvData.faehigkeiten.map((faehigkeit, index) => (
                                <span
                                  key={index}
                                  className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm`}
                                >
                                  {faehigkeit}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Right Column or Full Width for Block Layouts */}
                    <div className={`${cvData.layout === 2 ? 'md:col-span-2' : cvData.layout === 3 ? 'md:col-span-3' : cvData.layout === 5 ? 'md:col-span-3' : ''} space-y-6`}>
                      {/* Languages for Block Layouts */}
                      {(cvData.layout === 1 || cvData.layout === 4) && cvData.sprachen && cvData.sprachen.length > 0 && (
                        <div>
                          <h3 className={styles.sectionTitle}>
                            Sprachen
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {cvData.sprachen.map((sprache, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{sprache.sprache}</span>
                                  <span className="text-sm text-muted-foreground">{sprache.niveau}</span>
                                </div>
                                <div className="flex gap-1">
                                  {getSprachNiveauBars(sprache.niveau)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills for Block Layouts */}
                      {(cvData.layout === 1 || cvData.layout === 4) && (cvData.status === 'azubi' || cvData.status === 'ausgelernt') && cvData.faehigkeiten && cvData.faehigkeiten.length > 0 && (
                        <div>
                          <h3 className={styles.sectionTitle}>
                            Fähigkeiten
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {cvData.faehigkeiten.map((faehigkeit, index) => (
                              <span
                                key={index}
                                className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm`}
                              >
                                {faehigkeit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* About Me */}
                      {cvData.ueberMich && (
                        <div>
                          <h3 className={styles.sectionTitle}>
                            Über mich
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {cvData.ueberMich}
                          </p>
                        </div>
                      )}

                      {/* Education */}
                      {cvData.schulbildung && cvData.schulbildung.length > 0 && (
                        <div>
                          <h3 className={styles.sectionTitle}>
                            Schulbildung
                          </h3>
                          <div className="space-y-4">
                            {cvData.schulbildung.map((schule, index) => (
                              <div key={index} className={`border-l-2 ${colors.border} pl-4`}>
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-semibold">{schule.schulform}</h4>
                                  <span className="text-sm text-muted-foreground">
                                    {schule.zeitraum_von} - {schule.zeitraum_bis}
                                  </span>
                                </div>
                                <div className={`${colors.text} font-medium`}>{schule.name}</div>
                                <div className="text-sm text-muted-foreground">{schule.ort}</div>
                                {schule.beschreibung && (
                                  <p className="text-sm text-gray-600 mt-2">{schule.beschreibung}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Work Experience */}
                      {cvData.berufserfahrung && cvData.berufserfahrung.length > 0 && (
                        <div>
                          <h3 className={styles.sectionTitle}>
                            Praktische Erfahrung
                          </h3>
                          <div className="space-y-4">
                            {cvData.berufserfahrung.map((arbeit, index) => (
                              <div key={index} className={`border-l-2 ${colors.border} pl-4`}>
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-semibold">{arbeit.titel}</h4>
                                  <span className="text-sm text-muted-foreground">
                                    {arbeit.zeitraum_von} - {arbeit.zeitraum_bis}
                                  </span>
                                </div>
                                <div className={`${colors.text} font-medium`}>{arbeit.unternehmen}</div>
                                <div className="text-sm text-muted-foreground">{arbeit.ort}</div>
                                {arbeit.beschreibung && (
                                  <p className="text-sm text-gray-600 mt-2">{arbeit.beschreibung}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Action Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Dein Profil ist bereit!</h3>
              <p className="text-muted-foreground">
                Deine CV-Daten sind temporär gespeichert. Erstelle einen Account, um sie dauerhaft zu sichern.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  {isGeneratingPDF ? 'Erstelle PDF...' : 'PDF herunterladen'}
                </Button>
                <Button variant="outline" onClick={handleCreateAccount}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Account erstellen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;