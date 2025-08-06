import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, UserPlus, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ExampleProfile = () => {
  const navigate = useNavigate();

  // Static example profile data
  const exampleData = {
    vorname: "Maximilian",
    nachname: "Beispiel",
    branche: "Handwerk & Technik", 
    status: "Suchend",
    headline: "Motivierter Azubi sucht Ausbildungsplatz als Elektroniker",
    email: "max.beispiel@email.de",
    telefon: "+49 123 456789",
    strasse: "Musterstraße",
    hausnummer: "42",
    plz: "12345",
    ort: "Beispielstadt",
    geburtsdatum: new Date('2005-03-15'),
    motivation: "Ich bin sehr interessiert an einer Ausbildung zum Elektroniker, da ich schon seit meiner Kindheit gerne an elektronischen Geräten bastele. In meiner Freizeit repariere ich Handys und Computer für Freunde und Familie.",
    faehigkeiten: [
      { name: "Teamarbeit", level: "Fortgeschritten" },
      { name: "Zuverlässigkeit", level: "Sehr gut" },
      { name: "Mathematik", level: "Gut" },
      { name: "Handwerkliches Geschick", level: "Fortgeschritten" }
    ],
    sprachen: [
      { name: "Deutsch", level: "Muttersprache" },
      { name: "Englisch", level: "Grundkenntnisse" }
    ],
    schulbildung: [
      {
        schule: "Realschule Beispielstadt",
        abschluss: "Realschulabschluss",
        zeitraum: "2019 - 2023",
        note: "2,3"
      }
    ],
    berufserfahrung: [
      {
        position: "Praktikant",
        unternehmen: "Elektro Schmidt GmbH",
        zeitraum: "Juli 2023 - August 2023",
        beschreibung: "Zweiwöchiges Schülerpraktikum in der Elektroinstallation"
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Warning Banner */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Dies ist ein öffentliches Beispielprofil.</strong> Um deinen eigenen Lebenslauf zu erstellen und von Unternehmen gefunden zu werden, registriere dich kostenlos.
        </AlertDescription>
      </Alert>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-primary">
            Erstelle jetzt deinen eigenen Lebenslauf
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Jetzt kostenlos registrieren und deine Ausbildungschancen verbessern
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Kostenlos registrieren
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Bereits Account? Einloggen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Persönliche Daten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vorname</label>
                <p className="text-foreground">{exampleData.vorname}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nachname</label>
                <p className="text-foreground">{exampleData.nachname}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">E-Mail</label>
                <p className="text-foreground">{exampleData.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                <p className="text-foreground">{exampleData.telefon}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Adresse</label>
              <p className="text-foreground">
                {exampleData.strasse} {exampleData.hausnummer}, {exampleData.plz} {exampleData.ort}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Headline</label>
              <p className="text-foreground font-medium">{exampleData.headline}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Motivation</label>
              <p className="text-foreground">{exampleData.motivation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status & Branch */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Branche</label>
              <Badge variant="secondary" className="block w-fit mt-1">
                {exampleData.branche}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant="outline" className="block w-fit mt-1">
                {exampleData.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills & Languages */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fähigkeiten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exampleData.faehigkeiten.map((skill, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-foreground">{skill.name}</span>
                  <Badge variant="secondary">{skill.level}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprachen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exampleData.sprachen.map((language, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-foreground">{language.name}</span>
                  <Badge variant="secondary">{language.level}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Education & Experience */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schulbildung</CardTitle>
          </CardHeader>
          <CardContent>
            {exampleData.schulbildung.map((education, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-foreground">{education.abschluss}</h4>
                <p className="text-sm text-muted-foreground">{education.schule}</p>
                <p className="text-sm text-muted-foreground">{education.zeitraum}</p>
                <Badge variant="outline">Note: {education.note}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Berufserfahrung</CardTitle>
          </CardHeader>
          <CardContent>
            {exampleData.berufserfahrung.map((experience, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-foreground">{experience.position}</h4>
                <p className="text-sm text-muted-foreground">{experience.unternehmen}</p>
                <p className="text-sm text-muted-foreground">{experience.zeitraum}</p>
                <p className="text-sm text-foreground">{experience.beschreibung}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-bold mb-2">Bereit für deinen eigenen Lebenslauf?</h3>
          <p className="mb-4 opacity-90">
            E-Mail-Adresse muss gültig und eindeutig sein
          </p>
          <Button 
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="text-primary font-semibold"
          >
            Jetzt kostenlos starten
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExampleProfile;