import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CVFormData } from "@/contexts/CVFormContext";
import { toast } from "@/hooks/use-toast";

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
      // For now, redirect to CV generator with PDF generation
      // This is a temporary solution until we have a proper CV preview component
      localStorage.setItem('cvFormData', JSON.stringify(cvData));
      localStorage.setItem('generatePDF', 'true');
      window.location.href = '/cv-generator';
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF-Fehler",
        description: "Beim Erstellen des PDFs ist ein Fehler aufgetreten.",
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