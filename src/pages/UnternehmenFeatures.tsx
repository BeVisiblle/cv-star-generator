import React, { useEffect } from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { 
  Target, Zap, BarChart3, Shield, Users2, TrendingUp, 
  CheckCircle, Search, MessageSquare, FileText, Clock,
  Brain, Globe, Settings, Award
} from "lucide-react";

const UnternehmenFeatures = () => {
  useEffect(() => {
    const site = "https://ausbildungsbasis.de";
    const title = "Unternehmen Features | Vollständige Recruiting-Lösung";
    const desc = "Entdecken Sie alle Features unserer Recruiting-Plattform: Kandidatensuche, intelligentes Matching, Team-Management und mehr.";
    
    document.title = title;
    const meta = (name: string, content: string, attr = "name") => {
      let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    
    meta("description", desc);
    meta("keywords", "Recruiting Features, Kandidatensuche, Unternehmen Software, HR Tools");
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <Header variant="business" />
      
      <main className="bg-black text-white w-full">
        {/* Hero Section */}
        <section className="py-16 bg-black">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6 text-white">
                Vollständige Recruiting-Lösung
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Alle Tools, die Sie für erfolgreiches Recruiting benötigen - von der Kandidatensuche bis zur Einstellung.
              </p>
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/unternehmensregistrierung">Jetzt kostenlos testen</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-16 bg-zinc-900/50">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
              Kernfunktionen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-zinc-800 border-zinc-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Intelligente Kandidatensuche
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Durchsuchen Sie unsere Datenbank mit erweiterten Filtern nach Standort, Skills, Erfahrung und mehr.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Geografische Filter</li>
                    <li>• Skill-basierte Suche</li>
                    <li>• Verfügbarkeitsstatus</li>
                    <li>• Branchenspezifische Filter</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800 border-zinc-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    KI-Matching
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Erhalten Sie automatisch passende Kandidatenvorschläge basierend auf Ihren Anforderungen.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Automatische Vorschläge</li>
                    <li>• Match-Score Bewertung</li>
                    <li>• Lernende Algorithmen</li>
                    <li>• Personalisierte Empfehlungen</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800 border-zinc-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Direktkommunikation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Kontaktieren Sie Kandidaten direkt ohne Umwege über E-Mail oder unsere integrierte Messaging-Funktion.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Integrierte Nachrichten</li>
                    <li>• E-Mail Integration</li>
                    <li>• Template-Bibliothek</li>
                    <li>• Antwort-Tracking</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Management Features */}
        <section className="py-16 bg-black">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
              Management & Organisation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-zinc-800 border-zinc-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Kandidaten-Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Verwalten Sie Ihre Kandidaten in verschiedenen Phasen des Bewerbungsprozesses.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Drag & Drop Interface</li>
                    <li>• Benutzerdefinierte Phasen</li>
                    <li>• Automatische Erinnerungen</li>
                    <li>• Status-Updates</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800 border-zinc-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users2 className="h-5 w-5 text-primary" />
                    Team-Kollaboration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Arbeiten Sie mit Ihrem gesamten HR-Team zusammen und teilen Sie Kandidateninformationen.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Multi-User Zugang</li>
                    <li>• Rollen & Berechtigungen</li>
                    <li>• Gemeinsame Notizen</li>
                    <li>• Aktivitäts-Feed</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800 border-zinc-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Analytics & Reporting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Verfolgen Sie Ihre Recruiting-Performance mit detaillierten Analysen und Reports.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Recruiting-Metriken</li>
                    <li>• Conversion-Raten</li>
                    <li>• Time-to-Hire</li>
                    <li>• Custom Dashboards</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security & Compliance */}
        <section className="py-16 bg-zinc-900/50">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
              Sicherheit & Compliance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-800 border-zinc-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    DSGVO-Konformität
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Vollständig DSGVO-konforme Datenverarbeitung mit Servern in Deutschland.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Server in Frankfurt</li>
                    <li>• Einwilligungsmanagement</li>
                    <li>• Datenlöschung auf Anfrage</li>
                    <li>• Audit-Trail</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800 border-zinc-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Anpassbare Einstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Passen Sie die Plattform an Ihre spezifischen Bedürfnisse und Workflows an.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Custom Felder</li>
                    <li>• Workflow-Automation</li>
                    <li>• Integration APIs</li>
                    <li>• White-Label Optionen</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-black">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Bereit, Ihr Recruiting zu revolutionieren?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Starten Sie noch heute kostenlos und finden Sie die perfekten Kandidaten für Ihr Unternehmen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/unternehmensregistrierung">Kostenlos registrieren</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent border-white text-white hover:bg-white hover:text-black">
                <a href="https://calendly.com/todd-bevisiblle/gettoknowbeviviblle" target="_blank" rel="noopener noreferrer">Demo buchen</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UnternehmenFeatures;