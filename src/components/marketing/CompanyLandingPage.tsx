import React, { useEffect } from 'react';
import { ArrowRight, Target, Zap, BarChart3, Shield, Users2, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from './Header';
import Footer from './Footer';

export default function CompanyLandingPage() {
  // SEO Head Injection
  useEffect(() => {
    const site = "https://ausbildungsbasis.de";
    const title = "Für Unternehmen | Schneller passende Auszubildende & Fachkräfte finden";
    const desc = "Standardisierte Profile, Direktkontakt und intelligentes Matching. Jetzt Unternehmens-Account erstellen.";
    const keywords = "Azubi finden, Fachkräfte rekrutieren, Unternehmen Ausbildung, Kandidatensuche, Recruiting";
    const ogImage = site + "/lovable-uploads/95e5dd4a-87e4-403a-b2cd-6f3d06433d25.png";
    
    const head = document.head;
    const meta = (name: string, content: string, attr = "name") => {
      let el = head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    const link = (rel: string, href: string) => {
      let el = head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        head.appendChild(el);
      }
      el.href = href;
    };

    // Basic meta tags
    document.title = title;
    meta("description", desc);
    meta("keywords", keywords);
    meta("robots", "index,follow,max-image-preview:large");
    meta("viewport", "width=device-width, initial-scale=1");
    link("canonical", site + "/unternehmen");

    // Open Graph
    meta("og:locale", "de_DE", "property");
    meta("og:type", "website", "property");
    meta("og:site_name", "Ausbildungsbasis", "property");
    meta("og:title", title, "property");
    meta("og:description", desc, "property");
    meta("og:url", site + "/unternehmen", "property");
    meta("og:image", ogImage, "property");
    meta("og:image:alt", "Unternehmens-Portal für Recruiting", "property");

    // Twitter Cards
    meta("twitter:card", "summary_large_image");
    meta("twitter:title", title);
    meta("twitter:description", desc);
    meta("twitter:image", ogImage);

    // JSON-LD Structured Data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Unternehmen - Ausbildungsbasis",
      "description": desc,
      "url": site + "/unternehmen",
      "mainEntity": {
        "@type": "Service",
        "name": "Recruiting-Service für Unternehmen",
        "provider": {
          "@type": "Organization",
          "name": "Ausbildungsbasis"
        },
        "description": "Finden Sie passende Auszubildende und Fachkräfte durch standardisierte Profile und intelligentes Matching."
      }
    };
    
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <Header variant="business" />
      
      <main className="bg-black text-white w-full" style={{
        ['--brand' as any]: '#5ce1e6'
      }}>
        {/* Hero Section with Black Background */}
        <section className="hero-section relative overflow-hidden bg-black w-full">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
          <div className="relative z-20 mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="max-w-4xl">
              <h1 className="hero-title text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] mb-6">
                Schneller passende Auszubildende finden.
              </h1>
              <p className="hero-subtitle text-zinc-300 text-xl mb-8 max-w-3xl leading-relaxed">
                Standardisierte, vollständige Profile. Direkte Ansprache. Weniger Aufwand – mehr Matches.
                Intelligentes Recruiting für moderne Unternehmen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/company/onboarding" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold bg-[color:var(--brand)] text-black hover:bg-[color:var(--brand)]/90">
                  Unternehmensaccount erstellen
                </Link>
                <Link to="/produkt#demo" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold border border-zinc-700 text-white hover:bg-zinc-900">
                  Demo ansehen
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-6 text-sm text-zinc-400">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  DSGVO-konform
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Hosted in Deutschland
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Sofort einsatzbereit
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section - Stylish Design */}
        <section className="w-full bg-black text-white py-16">
          <div className="w-full px-4">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 text-center">
              Warum Unternehmen auf uns vertrauen
            </h2>

            {/* Masonry-style Grid inspired by the landing page */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              
              {/* Intelligentes Matching - Large card */}
              <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white lg:row-span-2 animate-fade-in hover-scale">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="relative h-full flex flex-col justify-between min-h-[300px]">
                  <div>
                    <div className="flex items-center gap-2 text-white/90 mb-4">
                      <TrendingUp className="h-6 w-6" />
                      <span className="uppercase tracking-wide text-xs font-semibold">KI-Powered</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Intelligentes Matching</h3>
                    <p className="text-sm leading-relaxed text-white/90">
                      Unsere KI findet automatisch die passendsten Kandidaten für Ihre Stellen. 
                      Basierend auf Skills, Erfahrung und Präferenzen.
                    </p>
                  </div>
                </div>
              </article>

              {/* Direkte Ansprache - Brand color card */}
              <article className="rounded-2xl bg-[color:var(--brand)] p-6 text-black animate-fade-in hover-scale" style={{
                animationDelay: '0.1s'
              }}>
                <div className="flex items-center gap-2 text-black/80 mb-2">
                  <Zap className="h-5 w-5" />
                  <span className="uppercase tracking-wide text-xs font-semibold">Effizient</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Direkte Ansprache</h3>
                <p className="text-sm leading-relaxed">
                  Kontaktieren Sie Kandidaten mit einem Klick. Kein Postfach-Pingpong, sofort zum Gespräch.
                </p>
              </article>

              {/* Standardisierte Profile - Dark card */}
              <article className="relative rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 animate-fade-in hover-scale overflow-hidden" style={{
                animationDelay: '0.2s'
              }}>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-blue-900/20" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Target className="h-5 w-5" />
                    <span className="uppercase tracking-wide text-xs font-semibold">Vollständig</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Standardisierte Profile</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Alle relevanten Infos auf einen Blick: Skills, Erfahrung, Dokumente, Präferenzen.
                  </p>
                </div>
              </article>

              {/* DSGVO & Sicherheit */}
              <article className="rounded-2xl bg-white text-zinc-900 ring-1 ring-zinc-200 p-6 animate-fade-in hover-scale" style={{
                animationDelay: '0.3s'
              }}>
                <div className="flex items-center gap-2 text-zinc-700 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="uppercase tracking-wide text-xs font-semibold">Sicher</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">DSGVO & Datenschutz</h3>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  Daten in Frankfurt gehostet. Freigaben nur mit Einwilligung. 100% DSGVO-konform.
                </p>
              </article>

              {/* Team Management - Large bottom card */}
              <article className="relative rounded-2xl bg-zinc-900/90 ring-1 ring-zinc-800 p-6 md:p-8 lg:col-span-2 animate-fade-in hover-scale overflow-hidden" style={{
                animationDelay: '0.4s'
              }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-zinc-400 mb-4">
                    <Users2 className="h-6 w-6" />
                    <span className="uppercase tracking-wide text-xs font-semibold">Team-Features</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Team-Zugänge & Pipeline</h3>
                  <p className="text-sm text-zinc-200/90 leading-relaxed max-w-lg">
                    Kollegen einladen, Kandidaten bewerten, Notizen teilen und den gesamten Recruiting-Prozess 
                    in einer übersichtlichen Pipeline verwalten.
                  </p>
                </div>
              </article>
            </div>

            {/* Call to Action in feature section */}
            <div className="text-center">
              <Link to="/company/onboarding" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold bg-[color:var(--brand)] text-black hover:bg-[color:var(--brand)]/90">
                Jetzt kostenlos starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works Section with Black Theme */}
        <section id="so-funktionierts" className="py-16 bg-black">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">So funktioniert's</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[color:var(--brand)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-black">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Registrieren & Profil anlegen</h3>
                <p className="text-zinc-300">Erstellen Sie Ihr Firmenprofil in wenigen Minuten.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[color:var(--brand)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-black">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Profile filtern & kontaktieren</h3>
                <p className="text-zinc-300">Nutzen Sie intelligente Filter für passende Kandidaten.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[color:var(--brand)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-black">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Pipeline & Stellen besetzen</h3>
                <p className="text-zinc-300">Verwalten Sie Ihren Recruiting-Prozess effizient.</p>
              </div>
            </div>
            <div className="text-center">
              <Link to="/company/onboarding" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold bg-[color:var(--brand)] text-black hover:bg-[color:var(--brand)]/90">
                Jetzt kostenlos starten
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Grid with Dark Theme */}
        <section className="py-16 bg-zinc-900">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative rounded-2xl bg-zinc-800/60 ring-1 ring-zinc-700 p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
                <div className="relative">
                  <BarChart3 className="h-8 w-8 text-[color:var(--brand)] mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-3">Performance & Reporting</h3>
                  <p className="text-zinc-300 text-sm">
                    Behalten Sie Pipeline, Antwortraten und Besetzungen im Blick.
                  </p>
                </div>
              </div>

              <div className="relative rounded-2xl bg-zinc-800/60 ring-1 ring-zinc-700 p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent" />
                <div className="relative">
                  <Users2 className="h-8 w-8 text-[color:var(--brand)] mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-3">Team-Collaboration</h3>
                  <p className="text-zinc-300 text-sm">
                    Kollegen einladen, Bewertungen teilen, gemeinsam entscheiden.
                  </p>
                </div>
              </div>

              <div className="relative rounded-2xl bg-zinc-800/60 ring-1 ring-zinc-700 p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent" />
                <div className="relative">
                  <Target className="h-8 w-8 text-[color:var(--brand)] mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-3">Präzise Filter</h3>
                  <p className="text-zinc-300 text-sm">
                    Finden Sie genau die Kandidaten, die zu Ihren Anforderungen passen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Band with Dark Theme */}
        <section className="py-12 bg-gradient-to-r from-[color:var(--brand)] to-[color:var(--brand)]/80">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">
              Bereit, passende Kandidaten schneller zu finden?
            </h2>
            <Link to="/company/onboarding" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold bg-black text-white hover:bg-zinc-900">
              Kostenlos registrieren
            </Link>
          </div>
        </section>

        {/* Product Preview with Dark Theme */}
        <section className="py-16 bg-black">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Das Produkt – klar, einfach, effektiv.
                </h2>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[color:var(--brand)] flex-shrink-0" />
                    <span className="text-zinc-300">Kandidaten-Datenbank mit intelligenten Filtern</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[color:var(--brand)] flex-shrink-0" />
                    <span className="text-zinc-300">Direktkontakt ohne Umwege</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[color:var(--brand)] flex-shrink-0" />
                    <span className="text-zinc-300">KI-basiertes Matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[color:var(--brand)] flex-shrink-0" />
                    <span className="text-zinc-300">Pipeline-Management & Reporting</span>
                  </li>
                </ul>
                <Link to="/produkt" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold border border-zinc-700 text-white hover:bg-zinc-900">
                  Produkt ansehen
                </Link>
              </div>
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 ring-1 ring-zinc-800 shadow-xl">
                  <img 
                    src="/lovable-uploads/356afafd-8910-495a-8ba8-35d74adf7cb1.png" 
                    alt="Recruiting Interface" 
                    className="w-full opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section with Dark Theme */}
        <section className="py-16 bg-zinc-900">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Fragen? Wir helfen gern.</h2>
            <p className="text-zinc-300 mb-6">
              Sprechen Sie mit unserem Team über Ihre individuellen Anforderungen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/kontakt" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold bg-[color:var(--brand)] text-black hover:bg-[color:var(--brand)]/90">
                Kontakt aufnehmen
              </Link>
              <Link to="/kontakt?type=demo" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold border border-zinc-700 text-white hover:bg-zinc-800">
                Demo anfragen
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}