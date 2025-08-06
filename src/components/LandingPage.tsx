import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, Zap, Star, ArrowRight, Download, Eye } from "lucide-react";
import step1HeroImage from '/images/step1-hero.jpg';
import step1Image from '/images/step1.jpg';
import step2Image from '/images/step2.jpg';
import step3Image from '/images/step3.jpg';

export default function LandingPage() {
  const navigate = useNavigate();

  const benefits = [
    { icon: Clock, title: "5 Minuten", description: "Bis zum fertigen Lebenslauf" },
    { icon: Users, title: "1000+", description: "Erfolgreiche Vermittlungen" },
    { icon: Zap, title: "Sofort", description: "Direkt von Firmen gefunden werden" },
    { icon: CheckCircle, title: "Kostenlos", description: "Komplett gratis nutzen" }
  ];

  const branches = [
    {
      emoji: "🔧",
      title: "Handwerk & Technik",
      description: "Mechanik, Elektrik, Bau, Produktion",
      jobs: "2.847 offene Stellen",
      highlight: "Besonders gefragt"
    },
    {
      emoji: "💻", 
      title: "IT & Digital",
      description: "Softwareentwicklung, Systemadministration, Mediengestaltung",
      jobs: "1.234 offene Stellen",
      highlight: "Zukunftssicher"
    },
    {
      emoji: "🩺",
      title: "Gesundheit & Pflege", 
      description: "Krankenpflege, Physiotherapie, Medizinische Assistenz",
      jobs: "3.456 offene Stellen",
      highlight: "Systemrelevant"
    }
  ];

  const testimonials = [
    {
      name: "Lisa M., 17",
      text: "Innerhalb von 2 Wochen hatte ich 3 Ausbildungsangebote. Unglaublich!",
      rating: 5,
      position: "Azubi Krankenpflege"
    },
    {
      name: "Tom K., 19", 
      text: "Viel besser als stundenlang Bewerbungen zu schreiben. Hat sofort funktioniert.",
      rating: 5,
      position: "Azubi KFZ-Mechatronik"
    },
    {
      name: "Sarah L., 18",
      text: "Das war so einfach! Jetzt arbeite ich in meinem Traumberuf.",
      rating: 5,
      position: "Azubi Mediengestaltung"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary">Ausbildungsbasis</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Deutschlands #1 Azubi-Portal
              </Badge>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Button variant="ghost" onClick={() => navigate('/blog')}>
                Ratgeber
              </Button>
              <Button variant="ghost" onClick={() => navigate('/unternehmen')}>
                Für Unternehmen
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Anmelden
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Above the fold */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge className="mb-4">
                    ⚡ Neu: KI-powered Matching
                  </Badge>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="text-foreground">Mach keinen</span>{" "}
                    <span className="text-primary">Lebenslauf.</span><br/>
                    <span className="text-foreground">Mach</span>{" "}
                    <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      Eindruck.
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-xl">
                    In nur 5 Minuten zum perfekten Azubi-CV. Keine langweiligen Bewerbungen mehr – 
                    werde direkt von Unternehmen gefunden.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => navigate('/cv-generator')}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Jetzt CV erstellen - Kostenlos
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-6"
                    onClick={() => navigate('/auth')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Beispiel ansehen
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <benefit.icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold text-sm">{benefit.title}</div>
                        <div className="text-xs text-muted-foreground">{benefit.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10">
                  <img 
                    src={step1HeroImage} 
                    alt="CV Generator Interface - Erstelle deinen Lebenslauf in 5 Minuten"
                    className="w-full rounded-2xl shadow-2xl border border-border"
                    loading="eager"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-semibold">CV in 5 Min fertig!</span>
                    </div>
                  </div>
                </div>
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-3xl -z-10 transform scale-110"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Das sagen unsere Nutzer</h2>
              <div className="flex justify-center items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-lg font-semibold ml-2">4.9/5</span>
                <span className="text-muted-foreground">(2,847 Bewertungen)</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Branchen */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Wähle deine Zukunft</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Egal ob Handwerk, IT oder Gesundheit – unser CV Generator passt sich deiner Branche an
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {branches.map((branch, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {branch.highlight}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="text-4xl mb-2">{branch.emoji}</div>
                    <CardTitle className="text-xl">{branch.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {branch.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-primary">{branch.jobs}</div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={() => navigate('/cv-generator')}
                      >
                        CV für {branch.title.split(' ')[0]} erstellen
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">So einfach funktioniert's</h2>
              <p className="text-xl text-muted-foreground">
                Von null zum Traumjob in nur 3 Schritten
              </p>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge className="bg-blue-100 text-blue-800">Schritt 1</Badge>
                  <h3 className="text-2xl font-bold">Daten eingeben – kinderleicht</h3>
                  <p className="text-lg text-muted-foreground">
                    Wähle deine Branche und beantworte ein paar einfache Fragen. 
                    Keine komplizierten Formulare – nur das, was wirklich zählt.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Persönliche Daten</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Schulabschluss & Noten</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Interessen & Stärken</span>
                    </li>
                  </ul>
                </div>
                <img 
                  src={step1Image} 
                  alt="CV Generator Schritt 1 - Daten eingeben"
                  className="w-full rounded-xl shadow-lg"
                  loading="lazy"
                />
              </div>

              {/* Step 2 */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <img 
                  src={step2Image} 
                  alt="CV Generator Schritt 2 - Automatische Generierung"
                  className="w-full rounded-xl shadow-lg lg:order-first"
                  loading="lazy"
                />
                <div className="space-y-4">
                  <Badge className="bg-green-100 text-green-800">Schritt 2</Badge>
                  <h3 className="text-2xl font-bold">KI erstellt deinen perfekten CV</h3>
                  <p className="text-lg text-muted-foreground">
                    Unsere künstliche Intelligenz wählt automatisch das beste Layout 
                    und formuliert deine Stärken professionell.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>5 verschiedene Designs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Branchenspezifische Anpassung</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Sofortige Vorschau</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge className="bg-purple-100 text-purple-800">Schritt 3</Badge>
                  <h3 className="text-2xl font-bold">Gefunden werden statt suchen</h3>
                  <p className="text-lg text-muted-foreground">
                    Dein Profil wird automatisch in unserer Matching-Datenbank sichtbar. 
                    Unternehmen finden dich – ganz ohne Bewerbungsstress.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Automatisches Matching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Direkte Kontaktaufnahme</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Mehrere Angebote erhalten</span>
                    </li>
                  </ul>
                </div>
                <img 
                  src={step3Image} 
                  alt="CV Generator Schritt 3 - Matching Platform"
                  className="w-full rounded-xl shadow-lg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-4">
              Starte jetzt. Werde gefunden.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Über 12.000 Jugendliche haben bereits ihren Traumjob gefunden. Du bist der Nächste!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/cv-generator')}
              >
                <Download className="mr-2 h-5 w-5" />
                Jetzt kostenlosen CV erstellen
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-6 bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => navigate('/auth')}
              >
                Profil anlegen & gefunden werden
              </Button>
            </div>

            <p className="text-sm mt-6 opacity-75">
              ✓ Kostenlos ✓ Ohne Anmeldung ✓ Sofort nutzbar ✓ DSGVO-konform
            </p>
          </div>
        </section>

        {/* FAQ Bereich */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Häufige Fragen</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ist der CV Generator wirklich kostenlos?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja, komplett kostenlos! Du kannst deinen CV erstellen, herunterladen und sogar 
                    ein Profil anlegen, ohne einen Cent zu bezahlen.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Wie funktioniert das Matching mit Unternehmen?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Unternehmen können in unserer Datenbank nach passenden Azubis suchen. 
                    Wenn dein Profil zu einer Stelle passt, kontaktieren sie dich direkt.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Welche Branchen werden unterstützt?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Wir unterstützen alle Ausbildungsbereiche: Handwerk, IT, Gesundheit, Gastronomie, 
                    Handel, Industrie und viele mehr.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Ausbildungsbasis</h3>
              <p className="text-sm mb-4">
                Deutschlands modernste Plattform für Azubi-Matching. 
                Schnell, einfach, erfolgreich.
              </p>
              <div className="flex space-x-4">
                <Badge variant="outline">TÜV geprüft</Badge>
                <Badge variant="outline">DSGVO konform</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Für Schüler</h4>
              <ul className="space-y-2 text-sm">
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate('/cv-generator')}>CV Generator</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate('/blog')}>Bewerbungstipps</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate('/auth')}>Profil erstellen</Button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Für Unternehmen</h4>
              <ul className="space-y-2 text-sm">
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate('/unternehmen')}>Azubi-Datenbank</Button></li>
                <li><Button variant="link" className="h-auto p-0">Premium Zugang</Button></li>
                <li><Button variant="link" className="h-auto p-0">Kontakt</Button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm">
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate('/impressum')}>Impressum</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate('/datenschutz')}>Datenschutz</Button></li>
                <li><Button variant="link" className="h-auto p-0">AGB</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 mt-8 text-center text-sm">
            <p>&copy; 2025 Ausbildungsbasis. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}