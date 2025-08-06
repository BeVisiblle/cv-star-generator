import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Unternehmen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Zurück zur Startseite
          </Button>
          
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Für Unternehmen
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Finden Sie die passenden Azubis und Fachkräfte direkt über unsere Matching-Plattform. 
            Keine aufwändigen Bewerbungsprozesse mehr – die Talente kommen zu Ihnen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 <span>Direktes Matching</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Finden Sie Kandidaten, die genau zu Ihren Anforderungen passen – 
                automatisch und zielgenau.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ <span>Schneller Prozess</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Von der Suche bis zum Kontakt in wenigen Minuten. 
                Keine wochenlangen Bewerbungsverfahren mehr.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 <span>Transparente Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vollständige CV-Profile mit allen relevanten Informationen 
                auf einen Blick verfügbar.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-secondary rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-foreground">
            Zugang zur Azubi-Datenbank
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Sofortiger Zugang</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Über 1.000 aktuelle Profile</li>
                <li>✓ Filterung nach Branche und Region</li>
                <li>✓ Direkter Kontakt zu Kandidaten</li>
                <li>✓ Mobile-optimierte Plattform</li>
              </ul>
            </div>
            
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6 mb-4"
              >
                Jetzt registrieren
              </Button>
              <p className="text-sm text-muted-foreground">
                30 Tage kostenlos testen
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Haben Sie Fragen?
          </h2>
          <p className="text-muted-foreground mb-6">
            Kontaktieren Sie uns für eine individuelle Beratung und Demo
          </p>
          <Button variant="outline" size="lg">
            📧 Kontakt aufnehmen
          </Button>
        </div>
      </div>
    </div>
  );
}