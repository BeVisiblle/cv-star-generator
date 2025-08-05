import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, User, UserPlus, Phone, Mail, MapPin, Calendar, Camera, Upload, FileText, Award, Building, GraduationCap, Briefcase, Languages, Star, Eye, Users, MessageCircle } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p>CV-Daten werden geladen...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getLanguageProgress = (niveau: string) => {
    const levels = { 'A1': 17, 'A2': 33, 'B1': 50, 'B2': 67, 'C1': 83, 'C2': 100, 'Muttersprache': 100 };
    return levels[niveau as keyof typeof levels] || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* LinkedIn-style Cover & Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary via-primary/90 to-secondary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <Camera className="h-4 w-4 mr-2" />
            Cover bearbeiten
          </Button>
        </div>

        {/* Profile Section */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 md:-mt-24 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
                  {cvData.profilbild ? (
                    <img
                      src={typeof cvData.profilbild === 'string' ? cvData.profilbild : 
                        (cvData.profilbild instanceof File ? URL.createObjectURL(cvData.profilbild) : '/placeholder.svg')}
                      alt="Profilbild"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-2">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                    {cvData.vorname} {cvData.nachname}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground font-medium">
                    {getStatusTitle(cvData.status)} • {getBrancheTitle(cvData.branche)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {cvData.ort}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Verfügbar
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button className="bg-primary hover:bg-primary/90">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Kontakt aufnehmen
                  </Button>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Vernetzen
                  </Button>
                  <Button variant="outline" onClick={handleCreateAccount}>
                    <User className="h-4 w-4 mr-2" />
                    Account erstellen
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/')}
                    className="ml-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zurück
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Profilaufrufe</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      127
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Verbindungen</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      45
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Kontaktinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cvData.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{cvData.email}</span>
                  </div>
                )}
                {cvData.telefon && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{cvData.telefon}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{cvData.strasse} {cvData.hausnummer}, {cvData.plz} {cvData.ort}</span>
                </div>
              </CardContent>
            </Card>

            {/* Languages Card */}
            {cvData.sprachen && cvData.sprachen.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Sprachen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.sprachen.map((sprache, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{sprache.sprache}</span>
                        <span className="text-muted-foreground">{sprache.niveau}</span>
                      </div>
                      <Progress value={getLanguageProgress(sprache.niveau)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {cvData.ueberMich && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{cvData.ueberMich}</p>
                </CardContent>
              </Card>
            )}

            {/* Experience Section */}
            {cvData.berufserfahrung && cvData.berufserfahrung.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Berufserfahrung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cvData.berufserfahrung.map((job, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{job.titel}</h4>
                        <p className="text-muted-foreground font-medium">{job.unternehmen}</p>
                        <p className="text-sm text-muted-foreground">{job.zeitraum_von} - {job.zeitraum_bis} • {job.ort}</p>
                        {job.beschreibung && (
                          <p className="text-sm mt-2 text-muted-foreground leading-relaxed">{job.beschreibung}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education Section */}
            {cvData.schulbildung && cvData.schulbildung.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Bildungsweg
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cvData.schulbildung.map((schule, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{schule.schulform}</h4>
                        <p className="text-muted-foreground font-medium">{schule.name}</p>
                        <p className="text-sm text-muted-foreground">{schule.zeitraum_von} - {schule.zeitraum_bis} • {schule.ort}</p>
                        {schule.beschreibung && (
                          <p className="text-sm mt-2 text-muted-foreground leading-relaxed">{schule.beschreibung}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Skills Section */}
            {cvData.faehigkeiten && cvData.faehigkeiten.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Kenntnisse & Fähigkeiten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {cvData.faehigkeiten.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* CV Download & Documents */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dokumente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGeneratingPDF ? 'Erstelle...' : 'CV herunterladen'}
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Zeugnisse hochladen
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Zertifikate hochladen
                </Button>
              </CardContent>
            </Card>

            {/* Status Badge */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium">Verfügbar für Anfragen</p>
                    <p className="text-xs text-muted-foreground">Antwortet normalerweise innerhalb von 24h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Aktivität</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">Profil aktualisiert vor 2 Tagen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">CV heruntergeladen vor 1 Woche</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">Neue Verbindung vor 2 Wochen</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CV Preview for PDF Generation - Hidden */}
        <div className="hidden">
          <div data-cv-preview>
            {(() => {
              const styles = getLayoutStyles();
              const colors = getBranchenFarben();
              
              return (
                <div className={styles.container}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;