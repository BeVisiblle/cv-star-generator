import React, { useEffect } from 'react';
import { ArrowRight, Users, Building2, MessageSquare, Sparkles, ShieldCheck, PhoneCall } from "lucide-react";
import { Link } from 'react-router-dom';

/*
 Landing Page – CV Generator
 Tech: React + TailwindCSS
 Structure:
 1) Hero Header
 2) Brand/Unternehmensname
 3) FeatureCardsSection (8 Tiles)
 4) Produkt‑Showcase (User & Unternehmen)
 5) Dual Call‑to‑Action (beide Zielgruppen)
 6) Footer

 Notes:
 - Accent color uses inline style var --brand (default #5ce1e6)
*/

export default function LandingPage() {
  // SEO Head Injection
  useEffect(() => {
    const site = "https://ausbildungsbasis.de";
    const title = "Lebenslauf Ausbildung – CV Generator | Ausbildungsbasis";
    const desc = "Erstelle deinen Azubi-Lebenslauf in 5 Minuten. CV für Ausbildung als PDF, Profil veröffentlichen und direkt von Unternehmen gefunden werden – kostenlos starten.";
    const keywords = "Lebenslauf Ausbildung, CV Ausbildung, Lebenslauf erstellen, Lebenslauf Hilfe, Azubi Lebenslauf, Bewerbung Ausbildung, CV Generator";
    const ogImage = site + "/images/step1-hero.jpg";
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
    link("canonical", site + "/");

    // Open Graph
    head.insertAdjacentHTML("beforeend", '<meta property="og:locale" content="de_DE">' + '<meta property="og:type" content="website">' + '<meta property="og:site_name" content="Ausbildungsbasis">' + '<meta property="og:title" content="' + title.replace(/"/g, '&quot;') + '">' + '<meta property="og:description" content="' + desc.replace(/"/g, '&quot;') + '">' + '<meta property="og:url" content="' + site + '/">' + '<meta property="og:image" content="' + ogImage + '">' + '<meta property="og:image:alt" content="CV Generator für Ausbildung">');

    // Twitter Cards
    head.insertAdjacentHTML("beforeend", '<meta name="twitter:card" content="summary_large_image">' + '<meta name="twitter:title" content="' + title.replace(/"/g, '&quot;') + '">' + '<meta name="twitter:description" content="' + desc.replace(/"/g, '&quot;') + '">' + '<meta name="twitter:image" content="' + ogImage + '">');

    // JSON-LD Structured Data
    const jsonLd = [{
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ausbildungsbasis",
      "url": site,
      "logo": site + "/images/step1-hero.jpg",
      "sameAs": ["https://www.linkedin.com/company/ausbildungsbasis"]
    }, {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": site,
      "name": "Ausbildungsbasis",
      "potentialAction": {
        "@type": "SearchAction",
        "target": site + "/suche?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }, {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "CV Generator (Lebenslauf Ausbildung)",
      "brand": {
        "@type": "Brand",
        "name": "Ausbildungsbasis"
      },
      "url": site + "/cv-generator",
      "description": "CV für Ausbildung in 5 Minuten: PDF, Profil, Direktkontakt zu Unternehmen.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      }
    }];
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    head.appendChild(script);
  }, []);
  return <main className="min-h-screen bg-black text-white w-full" style={{
    ['--brand' as any]: '#5ce1e6'
  }}>
      {/* Simple Header */}
      <header className="bg-black py-4 w-full">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/db86285e-b61d-4b09-b7a8-09931550f198.png" alt="Ausbildungsbasis Logo" className="h-8 w-8 object-contain" />
            <span className="text-lg font-semibold hidden sm:block">Ausbildungsbasis</span>
          </div>
          <div className="flex-1 flex justify-end">
            <Link to="/auth" className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold border border-zinc-700 text-white hover:bg-zinc-900">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Mobile Image */}
      <section className="relative overflow-hidden bg-black w-full">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
                Mach keinen Lebenslauf.<br />
                <span className="text-[color:var(--brand)]">Mach Eindruck.</span>
              </h1>
              <p className="mt-6 text-zinc-300 text-lg max-w-xl">
                In nur 5 Minuten zum perfekten Lebenslauf. Keine langweiligen Bewerbungen mehr –
                werde direkt von Unternehmen gefunden und kontaktiert.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/cv-generator" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold bg-[color:var(--brand)] text-black shadow-lg shadow-teal-500/20">
                  Lebenslauf erstellen – kostenlos
                </Link>
              </div>
            </div>
            <div className="relative lg:ml-8 mx-0">
              <img src="/lovable-uploads/95e5dd4a-87e4-403a-b2cd-6f3d06433d25.png" alt="CV Generator Mobile App" className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl transform lg:translate-x-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <FeatureCardsSection />

      {/* Product Showcase */}
      <ProductShowcaseSection />

      {/* Dual Call‑to‑Action */}
      <section className="py-16 bg-black w-full">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl ring-1 ring-zinc-800 p-8 bg-zinc-900/40">
            <h3 className="text-2xl font-semibold">Bereit, deinen CV zu bauen?</h3>
            <p className="mt-2 text-sm text-zinc-300">Starte kostenlos, exportiere als PDF und
teile dein Profil direkt.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/cv-generator" className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-[color:var(--brand)] text-black">Für Schüler, Azubis und Fachkräfte: Jetzt starten</Link>
            </div>
          </div>
          <div className="rounded-2xl ring-1 ring-zinc-800 p-8 bg-zinc-900/40">
            <h3 className="text-2xl font-semibold">Talente schneller finden</h3>
            <p className="mt-2 text-sm text-zinc-300">Registrieren Sie Ihr Unternehmen und schalten Sie passende Profile frei.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/unternehmen" className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-white text-black">Unternehmen registrieren</Link>
              <Link to="/auth" className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-zinc-700">Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6) Footer */}
      <footer className="border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/db86285e-b61d-4b09-b7a8-09931550f198.png" alt="Ausbildungsbasis Logo" className="h-8 w-8 object-contain" />
              <span className="text-lg font-semibold">Ausbildungsbasis</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400 max-w-xs">Die smarte Brücke zwischen Schülern, Azubis und Fachkräften und Unternehmen – Austausch untereinander, einem AI-Matching und einer Datenbank mit vollständigen Profilen.</p>
            <div className="mt-6 flex items-center gap-4">
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-10 w-auto" />
              <img src="https://developer.android.com/images/brand/de_generic_rgb_wo_45.png" alt="Google Play" className="h-10 w-auto" />
            </div>
          </div>
          <div className="text-sm text-zinc-400">
            <div className="font-semibold text-white">Navigation</div>
            <ul className="mt-3 space-y-2">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#produkt" className="hover:text-white">Produkt</a></li>
              <li><a href="#unternehmen" className="hover:text-white">Unternehmen</a></li>
              <li><a href="#kontakt" className="hover:text-white">Kontakt</a></li>
            </ul>
          </div>
          <div className="text-sm text-zinc-400">
            <div className="font-semibold text-white">Rechtliches</div>
            <ul className="mt-3 space-y-2">
              <li><Link to="/impressum" className="hover:text-white">Impressum</Link></li>
              <li><Link to="/datenschutz" className="hover:text-white">Datenschutz</Link></li>
              <li><Link to="/agb" className="hover:text-white">AGB</Link></li>
            </ul>
          </div>
        </div>
        
        {/* SEO Internal Navigation Links */}
        <nav aria-label="Beliebte Themen" className="mx-auto max-w-7xl px-4 py-6 border-t border-zinc-800">
          <h4 className="text-sm font-semibold text-white mb-3">Beliebte Themen</h4>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-400">
            <li><Link to="/cv-generator" className="hover:text-white">Lebenslauf erstellen (Generator)</Link></li>
            <li><a href="#produkt" className="hover:text-white">CV Ausbildung – so sieht's aus</a></li>
            <li><a href="#features" className="hover:text-white">Lebenslauf Hilfe – Features</a></li>
            <li><Link to="/unternehmen" className="hover:text-white">Kandidatensuche für Unternehmen</Link></li>
          </ul>
        </nav>
        
        <div className="px-4 pb-8 mx-auto max-w-7xl text-xs text-zinc-500">© {new Date().getFullYear()} Ausbildungsbasis. Alle Rechte vorbehalten.</div>
      </footer>
    </main>;
}

// --- FeatureCardsSection ---
export function FeatureCardsSection() {
  return <section className="w-full bg-black text-white py-16">
      <div className="w-full px-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 text-center">
          Warum unser Portal genau richtig für Dich ist.
        </h2>

        {/* Masonry-style Grid inspired by the reference */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* CV in 5 Schritten - Large left card */}
          <article className="relative overflow-hidden rounded-2xl bg-zinc-900/90 ring-1 ring-zinc-800 lg:row-span-2 animate-fade-in hover-scale">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
            <div className="relative p-6 md:p-8 h-full flex flex-col justify-between min-h-[300px]">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white">CV in 5 Schritten</h3>
                <p className="mt-4 text-sm text-zinc-200/90 leading-relaxed">
                  Von Layout bis Profil in <strong>5 Minuten</strong>. Einfache
                  Eingabe, klare Struktur, perfekter Look – lade Ihn als PDF herunter,
                  oder erstelle dir ein Profil. Die weltweit schnellste Art, professionelle Lebensläufe zu erstellen und einen neuen Job zu finden.
                </p>
              </div>
            </div>
          </article>

          {/* Community - White card */}
          <article className="rounded-2xl bg-white text-zinc-900 ring-1 ring-zinc-200 p-6 animate-fade-in hover-scale" style={{
          animationDelay: '0.1s'
        }}>
            <div className="flex items-center gap-2 text-zinc-700">
              <Users className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs font-semibold">Community</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Vernetzen & Austausch</h3>
            <p className="mt-3 text-sm text-zinc-700 leading-relaxed">Tritt in Kontakt mit Fachkräften aus deiner und anderen Branchen und vernetze dich mit der Community von morgen.</p>
          </article>

          {/* Unternehmen - Dark card with subtle background */}
          <article className="relative rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 animate-fade-in hover-scale overflow-hidden" style={{
          animationDelay: '0.2s'
        }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
            <div className="relative">
              <div className="flex items-center gap-2 text-zinc-400">
                <Building2 className="h-5 w-5" />
                <span className="uppercase tracking-wide text-xs font-semibold">Unternehmen</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold text-white">Von Firmen kontaktiert werden</h3>
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                Lasse dich direkt von Unternehmen ansprechen – ohne klassische Bewerbung.
              </p>
            </div>
          </article>

          {/* Gruppen - Brand color card */}
          <article className="rounded-2xl bg-[color:var(--brand)] p-6 text-black animate-fade-in hover-scale lg:row-span-2" style={{
          animationDelay: '0.3s'
        }}>
            <div className="flex items-center gap-2 text-black/80">
              <MessageSquare className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs font-semibold">Gruppen</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Tritt Gruppen bei & teile Lernhilfe mit anderen</h3>
            <p className="mt-3 text-sm leading-relaxed">
              Tritt Gruppen bei, lerne von anderen oder hilf mit. Teile
              Dokumente wie Lernzettel für Klausuren und diskutiere in
              kleinen Runden über deine relevante Themen von aktuellen Themen bis hin zur Prüfungsvorbereitungen.
            </p>
          </article>

          {/* AI-Powered CV - New 9th feature */}
          <article className="relative rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white animate-fade-in hover-scale overflow-hidden" style={{
          animationDelay: '0.8s'
        }}>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
            <div className="relative">
              <div className="flex items-center gap-2 text-white/90">
                <Sparkles className="h-5 w-5" />
                <span className="uppercase tracking-wide text-xs font-semibold">KI-Powered</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold">Smart CV</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                KI optimiert automatisch deinen CV für verschiedene Branchen und deinen Wünschen.
              </p>
            </div>
          </article>

          {/* 360° - Large bottom card */}
          <article className="relative rounded-2xl bg-zinc-900/90 ring-1 ring-zinc-800 p-6 md:p-8 lg:col-span-2 animate-fade-in hover-scale overflow-hidden" style={{
          animationDelay: '0.4s'
        }}>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
            <div className="relative">
              <div className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-4">360°</div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Recruiting & Employer Branding</h3>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                Finden Sie spannende Profile mit vollständigen Daten, schalten
                Sie diese frei und überzeugen Sie Fachkräfte und Talente von Ihrem
                Unternehmen. Mitarbeitende werden zu Markenbotschafter:innen –
                durch Austausch in Ihrem Namen.
              </p>
              <div className="mt-6 inline-block rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-4 ring-1 ring-zinc-700/50 backdrop-blur-sm">
                <p className="text-xs text-zinc-300">Freigabe via Token‑Modell, Export als Link/PDF/QR.</p>
              </div>
            </div>
          </article>

          {/* Matches - Red accent card */}
          <article className="rounded-2xl bg-red-600/90 text-white p-6 animate-fade-in hover-scale" style={{
          animationDelay: '0.5s'
        }}>
            <div className="flex items-center gap-2 text-white/90">
              <Sparkles className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs font-semibold">Matches</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Direkte Matches</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/90">Erhalte automatisch passende Matches – täglich aktualisiert.</p>
          </article>

          {/* Kontakt - Dark card */}
          <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 animate-fade-in hover-scale" style={{
          animationDelay: '0.6s'
        }}>
            <div className="flex items-center gap-2 text-zinc-400">
              <PhoneCall className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs font-semibold">Kontakt</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-white">Direkter Kontakt</h3>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
              WhatsApp, Telefon oder E-Mail – nimm sofort Kontakt auf.
            </p>
          </article>

          {/* Qualität - Dark card */}
          <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 animate-fade-in hover-scale" style={{
          animationDelay: '0.7s'
        }}>
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs font-semibold">Qualität</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-white">Geprüfte Profile</h3>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
              Alle Profile werden verifiziert für höchste Qualität.
            </p>
          </article>

          {/* CV Templates - New card */}
          <article className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white animate-fade-in hover-scale" style={{
          animationDelay: '0.9s'
        }}>
            <div className="flex items-center gap-2 text-white/90">
              <Users className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs font-semibold">Templates</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Professionelle Layouts</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Wähle aus verschiedenen modernen CV-Vorlagen für jeden Beruf.
            </p>
          </article>
          

        </div>
      </div>
    </section>;
}

// --- Product Showcase Section ---
export function ProductShowcaseSection() {
  return <section className="w-full bg-black text-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-4">
          So sieht das Produkt aus
        </h2>
        <p className="text-center text-zinc-400 mb-16 max-w-2xl mx-auto">
          Ein Blick in die Anwendung – für Azubis, Schüler, Fachkräfte und Unternehmen.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* User Preview */}
          <div className="relative rounded-3xl ring-1 ring-zinc-800 bg-gradient-to-b from-zinc-900/50 to-black p-8 animate-fade-in hover-scale overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
            <div className="relative">
              <div className="flex items-center gap-3 text-[color:var(--brand)] text-sm uppercase tracking-wider font-semibold mb-4">
                <Users className="h-5 w-5" /> 
                <span>Für Azubis, Schüler & Fachkräfte</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">CV‑Editor, Job finden &
Community beitreten</h3>
              <p className="text-zinc-300 mb-8 leading-relaxed font-light">Erstelle deinen professionellen CV in nur fünf Schritten. Lade ihn als PDF herunter oder veröffentliche dein Profil – und werde direkt von Unternehmen gefunden und kontaktiert. Vernetze dich mit anderen Fachkräften, tausche Erfahrungen aus und tritt passenden Gruppen bei, um immer auf dem neuesten Stand zu bleiben.</p>
              <div className="aspect-[16/10] rounded-2xl ring-1 ring-zinc-800 overflow-hidden mb-6">
                <img src="/lovable-uploads/4b784c18-de0b-4138-98bf-beb980e3fc0b.png" alt="Portal Feed Interface für Azubis und Fachkräfte" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex gap-3 text-xs">
                <span className="px-3 py-1 bg-[color:var(--brand)]/20 text-[color:var(--brand)] rounded-full">PDF Export</span>
                <span className="px-3 py-1 bg-[color:var(--brand)]/20 text-[color:var(--brand)] rounded-full">Vernetzen</span>
                <span className="px-3 py-1 bg-[color:var(--brand)]/20 text-[color:var(--brand)] rounded-full">Community</span>
              </div>
            </div>
          </div>

          {/* Company Preview */}
          <div className="relative rounded-3xl ring-1 ring-zinc-800 bg-gradient-to-b from-zinc-900/50 to-black p-8 animate-fade-in hover-scale overflow-hidden" style={{
          animationDelay: '0.2s'
        }}>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
            <div className="relative">
              <div className="flex items-center gap-3 text-blue-400 text-sm uppercase tracking-wider font-semibold mb-4">
                <Building2 className="h-5 w-5" /> 
                <span>Für Unternehmen</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Kandidatensuche & Employee Branding</h3>
              <p className="text-zinc-300 mb-8 leading-relaxed text-base font-light">Durchsuchen Sie standardisierte Azubi-Profile, schalten Sie passende Kandidat:innen per Token frei und nehmen Sie direkt Kontakt auf – via WhatsApp, Telefon oder E-Mail.

Stärken Sie Ihr Employer Branding: Vernetzen Sie Ihr Team auf der Plattform und lassen Sie Mitarbeitende als authentische Markenbotschafter wirken.</p>
              <div className="aspect-[16/10] rounded-2xl ring-1 ring-zinc-800 overflow-hidden mb-6">
                <img src="/lovable-uploads/356afafd-8910-495a-8ba8-35d74adf7cb1.png" alt="Kandidatensuche Interface für Unternehmen" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex gap-3 text-xs">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">Token-System</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">Direktkontakt</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">Employee Branding</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
}