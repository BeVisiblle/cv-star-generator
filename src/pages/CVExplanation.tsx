import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle, Download, FileText, User, Briefcase, Award, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export default function CVExplanation() {
  // SEO Head Injection
  useEffect(() => {
    const site = "https://ausbildungsbasis.de";
    const title = "So funktioniert's - CV in 7 Schritten erstellen | Ausbildungsbasis";
    const desc = "Erfahre, wie du in 7 einfachen Schritten deinen perfekten Lebenslauf für die Ausbildung erstellst. Von der Auswahl des Layouts bis zum fertigen Profil.";
    const keywords = "CV erstellen, Lebenslauf Schritte, Anleitung CV, Bewerbung Ausbildung, CV Generator Tutorial";
    const head = document.head;
    
    document.title = title;
    
    const meta = (name: string, content: string, attr = "name") => {
      let el = head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    
    meta("description", desc);
    meta("keywords", keywords);
  }, []);

  const steps = [
    {
      number: 1,
      title: "Persönliche Daten eingeben",
      description: "Gib deine grundlegenden Informationen wie Name, Kontaktdaten und gewünschte Ausbildung ein.",
      icon: User,
      image: "/images/step1.jpg"
    },
    {
      number: 2,
      title: "Berufserfahrung hinzufügen",
      description: "Füge deine bisherigen Praktika, Nebenjobs oder ehrenamtlichen Tätigkeiten hinzu.",
      icon: Briefcase,
      image: "/images/step2.jpg"
    },
    {
      number: 3,
      title: "Bildungsweg dokumentieren",
      description: "Trage deine Schulbildung, Kurse und weitere Qualifikationen ein.",
      icon: Award,
      image: "/images/step3.jpg"
    },
    {
      number: 4,
      title: "Fähigkeiten & Interessen",
      description: "Liste deine besonderen Fähigkeiten, Hobbys und Interessen auf.",
      icon: CheckCircle,
      image: "/images/step1.jpg"
    },
    {
      number: 5,
      title: "Layout auswählen",
      description: "Wähle aus verschiedenen professionellen CV-Layouts das passende für deine Branche.",
      icon: FileText,
      image: "/images/step2.jpg"
    },
    {
      number: 6,
      title: "Vorschau & Anpassung",
      description: "Sieh dir dein fertiges CV an und nimm letzte Anpassungen vor.",
      icon: Share,
      image: "/images/step3.jpg"
    },
    {
      number: 7,
      title: "Download & Profil erstellen",
      description: "Lade deinen CV als PDF herunter und erstelle optional ein Profil für direkte Unternehmenskontakte.",
      icon: Download,
      image: "/images/step1.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header variant="talent" />
      
      <main className="bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-background py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
                So funktioniert's
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Erstelle deinen professionellen Lebenslauf in nur 7 einfachen Schritten. 
                Von der ersten Eingabe bis zum fertigen Profil - wir führen dich durch den gesamten Prozess.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-2xl">
                  <Link to="/cv-generator">
                    Jetzt CV erstellen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl">
                  <Link to="/onboarding">
                    Profil erstellen
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                7 Schritte zu deinem perfekten CV
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Folge unserer Schritt-für-Schritt Anleitung und erstelle einen CV, der überzeugt.
              </p>
            </div>

            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={step.number} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-reverse' : ''
                }`}>
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {step.number}
                      </div>
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <Card className="overflow-hidden shadow-lg">
                      <img 
                        src={step.image} 
                        alt={`Schritt ${step.number}: ${step.title}`}
                        className="w-full h-64 md:h-80 object-cover"
                        loading="lazy"
                      />
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-background">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Bereit für deinen perfekten CV?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Starte jetzt und erstelle in wenigen Minuten einen professionellen Lebenslauf, 
              der bei Arbeitgebern einen bleibenden Eindruck hinterlässt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-2xl">
                <Link to="/cv-generator">
                  CV Generator starten
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl">
                <Link to="/onboarding">
                  Vollständiges Profil erstellen
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              ✓ Kostenlos ✓ Keine Anmeldung für CV-Download ✓ DSGVO-konform
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Warum unser CV-Generator?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Branchenspezifisch</h3>
                <p className="text-muted-foreground">
                  Layouts optimiert für verschiedene Branchen - vom Handwerk bis zur IT.
                </p>
              </Card>
              <Card className="p-6 text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionell</h3>
                <p className="text-muted-foreground">
                  Moderne, ansprechende Designs die bei Personalern einen guten Eindruck hinterlassen.
                </p>
              </Card>
              <Card className="p-6 text-center">
                <Download className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sofort verfügbar</h3>
                <p className="text-muted-foreground">
                  Download als PDF oder erstelle ein Profil für direkte Unternehmenskontakte.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}