import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle, Download, FileText, User, Briefcase, Award, Share, Sparkles, Users, Building2 } from 'lucide-react';
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
    <div className="min-h-screen bg-black">
      <Header variant="talent" />
      
      <main className="bg-black text-white w-full" style={{
        ['--brand' as any]: '#5ce1e6'
      }}>
        {/* Hero Section with Black Background */}
        <section className="hero-section relative overflow-hidden bg-black w-full">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="text-center">
              <h1 className="hero-title text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] mb-6">
                So funktioniert's
              </h1>
              <p className="hero-subtitle text-zinc-300 text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Erstelle deinen professionellen Lebenslauf in nur 7 einfachen Schritten. 
                Von der ersten Eingabe bis zum fertigen Profil - wir führen dich durch den gesamten Prozess.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/cv-generator" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold bg-[color:var(--brand)] text-black hover:bg-[color:var(--brand)]/90">
                  Jetzt CV erstellen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/onboarding" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold border border-zinc-700 text-white hover:bg-zinc-900">
                  Profil erstellen
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section - Stylish Design */}
        <section className="w-full bg-black text-white py-16">
          <div className="w-full px-4">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 text-center">
              Warum unser CV-Generator perfekt für dich ist
            </h2>

            {/* Masonry-style Grid inspired by the landing page */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              
              {/* KI-Powered CV - Large card */}
              <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white lg:row-span-2 animate-fade-in hover-scale">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="relative h-full flex flex-col justify-between min-h-[300px]">
                  <div>
                    <div className="flex items-center gap-2 text-white/90 mb-4">
                      <Sparkles className="h-6 w-6" />
                      <span className="uppercase tracking-wide text-xs font-semibold">KI-Powered</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Smart CV Generator</h3>
                    <p className="text-sm leading-relaxed text-white/90">
                      KI optimiert automatisch deinen CV für verschiedene Branchen und Anforderungen. 
                      Intelligente Vorschläge für bessere Texte und Layout-Empfehlungen.
                    </p>
                  </div>
                </div>
              </article>

              {/* Schnell & Einfach - Brand color card */}
              <article className="rounded-2xl bg-[color:var(--brand)] p-6 text-black animate-fade-in hover-scale" style={{
                animationDelay: '0.1s'
              }}>
                <div className="flex items-center gap-2 text-black/80 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="uppercase tracking-wide text-xs font-semibold">Effizient</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">In 5 Minuten fertig</h3>
                <p className="text-sm leading-relaxed">
                  Vom ersten Klick bis zum fertigen PDF - unser Generator führt dich schnell durch alle Schritte.
                </p>
              </article>

              {/* Branchenspezifisch - Dark card */}
              <article className="relative rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 animate-fade-in hover-scale overflow-hidden" style={{
                animationDelay: '0.2s'
              }}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Building2 className="h-5 w-5" />
                    <span className="uppercase tracking-wide text-xs font-semibold">Branchenspezifisch</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Layouts für jede Branche</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Vom Handwerk bis zur IT - wähle das perfekte Design für deinen Bereich.
                  </p>
                </div>
              </article>

              {/* Community & Networking */}
              <article className="rounded-2xl bg-white text-zinc-900 ring-1 ring-zinc-200 p-6 animate-fade-in hover-scale" style={{
                animationDelay: '0.3s'
              }}>
                <div className="flex items-center gap-2 text-zinc-700 mb-2">
                  <Users className="h-5 w-5" />
                  <span className="uppercase tracking-wide text-xs font-semibold">Mehr als CV</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Profil & Networking</h3>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  Erstelle ein vollständiges Profil und werde direkt von Unternehmen kontaktiert.
                </p>
              </article>

              {/* DSGVO & Sicherheit */}
              <article className="relative rounded-2xl bg-emerald-600 p-6 text-white animate-fade-in hover-scale overflow-hidden lg:col-span-2" style={{
                animationDelay: '0.4s'
              }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="relative">
                  <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">100% SICHER</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">DSGVO-konform & Datenschutz</h3>
                  <p className="text-sm text-white/90 leading-relaxed max-w-lg">
                    Höchste Sicherheitsstandards, Server in Deutschland, volle DSGVO-Konformität. 
                    Deine Daten bleiben sicher und unter deiner Kontrolle.
                  </p>
                </div>
              </article>
            </div>

            {/* Call to Action in feature section */}
            <div className="text-center">
              <Link to="/cv-generator" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold bg-[color:var(--brand)] text-black hover:bg-[color:var(--brand)]/90">
                Jetzt deinen CV erstellen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Steps Section with Black Design */}
        <section className="py-16 md:py-24 bg-black">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                7 Schritte zu deinem perfekten CV
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
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
                      <div className="flex-shrink-0 w-12 h-12 bg-[color:var(--brand)] rounded-full flex items-center justify-center text-black font-bold text-lg">
                        {step.number}
                      </div>
                      <step.icon className="h-8 w-8 text-[color:var(--brand)]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-zinc-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 ring-1 ring-zinc-800 shadow-xl">
                      <img 
                        src={step.image} 
                        alt={`Schritt ${step.number}: ${step.title}`}
                        className="w-full h-64 md:h-80 object-cover opacity-80"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section with Black Background */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-zinc-900 to-black">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Bereit für deinen perfekten CV?
            </h2>
            <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto">
              Starte jetzt und erstelle in wenigen Minuten einen professionellen Lebenslauf, 
              der bei Arbeitgebern einen bleibenden Eindruck hinterlässt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link to="/cv-generator" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold bg-[color:var(--brand)] text-black hover:bg-[color:var(--brand)]/90">
                CV Generator starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/onboarding" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold border border-zinc-700 text-white hover:bg-zinc-900">
                Vollständiges Profil erstellen
              </Link>
            </div>
            <p className="text-sm text-zinc-400">
              ✓ Kostenlos ✓ Keine Anmeldung für CV-Download ✓ DSGVO-konform
            </p>
          </div>
        </section>

        {/* Benefits Section with Dark Theme */}
        <section className="py-16 md:py-24 bg-black">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Warum unser CV-Generator?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 p-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent" />
                <div className="relative">
                  <CheckCircle className="h-12 w-12 text-[color:var(--brand)] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Branchenspezifisch</h3>
                  <p className="text-zinc-300">
                    Layouts optimiert für verschiedene Branchen - vom Handwerk bis zur IT.
                  </p>
                </div>
              </div>
              <div className="relative rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 p-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
                <div className="relative">
                  <FileText className="h-12 w-12 text-[color:var(--brand)] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Professionell</h3>
                  <p className="text-zinc-300">
                    Moderne, ansprechende Designs die bei Personalern einen guten Eindruck hinterlassen.
                  </p>
                </div>
              </div>
              <div className="relative rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 p-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent" />
                <div className="relative">
                  <Download className="h-12 w-12 text-[color:var(--brand)] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Sofort verfügbar</h3>
                  <p className="text-zinc-300">
                    Download als PDF oder erstelle ein Profil für direkte Unternehmenskontakte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}