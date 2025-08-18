import React from 'react';
import {
  ArrowRight,
  Users,
  Building2,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  BarChart3
} from "lucide-react";
import { Link } from 'react-router-dom';

/*
 Landing Page – CV Generator
 - No navbar
 - Full black background
 - Hero has two CTAs (Azubis + Unternehmen)
 - 10 Feature Cards (360° + 4 small cards on the right)
*/

export default function LandingPage() {
  return (
    <main
      className="min-h-screen bg-black text-white w-full overflow-x-hidden"
      style={{ ['--brand' as any]: '#5ce1e6' }}
    >
      {/* HERO (no top navbar) */}
      <section className="relative overflow-hidden bg-black w-full">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
                Mach keinen Lebenslauf.<br />
                <span className="text-[color:var(--brand)]">Mach Eindruck.</span>
              </h1>
              <p className="mt-6 text-zinc-300 text-lg max-w-xl">
                In nur 5 Minuten zum perfekten Azubi-CV. Keine langweiligen Bewerbungen mehr –
                werde direkt von Unternehmen gefunden und kontaktiert.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/cv-generator"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold bg-[color:var(--brand)] text-black shadow-lg shadow-teal-500/20"
                >
                  Lebenslauf erstellen – kostenlos
                </Link>
                <Link
                  to="/unternehmen"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold border border-zinc-700 text-white hover:bg-zinc-900"
                >
                  Unternehmensprofil erstellen
                </Link>
              </div>
            </div>
            <div className="relative lg:ml-8">
              <img
                src="/lovable-uploads/95e5dd4a-87e4-403a-b2cd-6f3d06433d25.png"
                alt="CV Generator Mobile App"
                className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards (now 10 cards) */}
      <FeatureCardsSection />

      {/* Product Showcase */}
      <ProductShowcaseSection />

      {/* Dual Call-to-Action */}
      <section className="py-16 bg-black w-full">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl ring-1 ring-zinc-800 p-8 bg-zinc-900/40">
            <h3 className="text-2xl font-semibold">Bereit, deinen CV zu bauen?</h3>
            <p className="mt-2 text-sm text-zinc-300">
              Starte kostenlos, exportiere als PDF und teile dein Profil direkt.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/cv-generator"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-[color:var(--brand)] text-black"
              >
                Für Azubis: Jetzt starten
              </Link>
            </div>
          </div>
          <div className="rounded-2xl ring-1 ring-zinc-800 p-8 bg-zinc-900/40">
            <h3 className="text-2xl font-semibold">Talente schneller finden</h3>
            <p className="mt-2 text-sm text-zinc-300">
              Registrieren Sie Ihr Unternehmen und schalten Sie passende Profile frei.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/unternehmen"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-white text-black"
              >
                Unternehmen registrieren
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-zinc-700"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (keine Navbar oben, Footer bleibt) */}
      <footer className="border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[color:var(--brand)]" />
              <span className="text-lg font-semibold">Ausbildungsbasis</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400 max-w-xs">
              Die smarte Brücke zwischen Azubis und Unternehmen – mit CV-Generator, Matching und direktem Kontakt.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="App Store"
                className="h-10 w-auto"
              />
              <img
                src="https://developer.android.com/images/brand/de_generic_rgb_wo_45.png"
                alt="Google Play"
                className="h-10 w-auto"
              />
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
              <li><a href="#agb" className="hover:text-white">AGB</a></li>
            </ul>
          </div>
        </div>
        <div className="px-4 pb-8 mx-auto max-w-7xl text-xs text-zinc-500">
          © {new Date().getFullYear()} Ausbildungsbasis. Alle Rechte vorbehalten.
        </div>
      </footer>
    </main>
  );
}

/* ---------------- FeatureCardsSection (10 tiles) ---------------- */
export function FeatureCardsSection() {
  return (
    <section id="features" className="w-full bg-black text-white py-16">
      <div className="w-full px-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 text-center">
          Warum unser CV-Generator anders ist
        </h2>

        {/* 5-col main grid; 360° takes 3 cols; right side is a nested 2-col grid with 4 small cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1) CV in 5 Schritten (tall) */}
          <article className="relative overflow-hidden rounded-2xl bg-zinc-900/90 ring-1 ring-zinc-800 lg:row-span-2">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
            <div className="relative p-6 md:p-8 h-full flex flex-col justify-end min-h-[300px]">
              <h3 className="text-3xl md:text-4xl font-bold">CV in 5 Schritten</h3>
              <p className="mt-4 text-sm text-zinc-200/90">
                Von Layout bis Profil in <strong>5 Minuten</strong>. Einfache Eingabe, klare Struktur,
                perfekter Look – bereit für PDF, Profil-Link & QR.
              </p>
            </div>
          </article>

          {/* 2) Community – white */}
          <article className="rounded-2xl bg-white text-zinc-900 ring-1 ring-zinc-200 p-6">
            <div className="flex items-center gap-2 text-zinc-700">
              <Users className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs font-semibold">Community</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Vernetzen & Austausch</h3>
            <p className="mt-3 text-sm text-zinc-700">
              Vernetze dich mit Fachkräften deiner Branche und erfahre, wie sie arbeiten.
            </p>
          </article>

          {/* 3) Unternehmen – dark */}
          <article className="relative rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
            <div className="relative">
              <div className="flex items-center gap-2 text-zinc-400">
                <Building2 className="h-5 w-5" />
                <span className="uppercase tracking-wide text-xs font-semibold">Unternehmen</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold text-white">Von Firmen kontaktiert werden</h3>
              <p className="mt-3 text-sm text-zinc-300">
                Werde direkt angesprochen – ohne klassische Bewerbung.
              </p>
            </div>
          </article>

          {/* 4) Fachbezogene Gruppen – brand, tall */}
          <article className="rounded-2xl bg-[color:var(--brand)] p-6 text-black lg:row-span-2">
            <div className="flex items-center gap-2 text-black/80">
              <MessageSquare className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs font-semibold">Gruppen</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Fachbezogene Gruppen & Lernhilfe</h3>
            <p className="mt-3 text-sm">
              Tritt passenden Gruppen bei, teile Lernzettel und bleib immer auf dem neuesten Stand.
            </p>
          </article>

          {/* 5) KI-Optimierung – gradient */}
          <article className="relative rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
            <div className="relative">
              <div className="flex items-center gap-2 text-white/90">
                <Sparkles className="h-5 w-5" />
                <span className="uppercase tracking-wide text-xs font-semibold">KI-Powered</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold">Smart CV Optimization</h3>
              <p className="mt-3 text-sm text-white/90">
                KI passt Formulierungen und Struktur für deine Wunschausbildung an.
              </p>
            </div>
          </article>

          {/* 6) 360° + right side 2x2 small cards */}
          <article className="rounded-2xl bg-zinc-900/90 ring-1 ring-zinc-800 p-6 md:p-8 lg:col-span-3">
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-6xl md:text-7xl font-extrabold tracking-tight">360°</div>
                <h3 className="text-2xl md:text-3xl font-bold mt-2">Recruiting & Employer Branding</h3>
                <p className="mt-3 text-sm text-zinc-300 max-w-2xl">
                  Finden Sie spannende Profile mit vollständigen Daten, schalten Sie diese frei
                  und überzeugen Sie Talente von Ihrem Unternehmen.
                </p>
              </div>
              <div className="inline-block rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-4 ring-1 ring-zinc-700/50 backdrop-blur-sm">
                <p className="text-xs text-zinc-300">Freigabe via Token-Modell, Export als Link/PDF/QR.</p>
              </div>
            </div>
          </article>

          {/* Right side wrapper (takes 2 cols) */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* 7) Matches */}
            <article className="rounded-2xl bg-red-600/90 text-white p-6">
              <div className="flex items-center gap-2 text-white/90">
                <Sparkles className="h-5 w-5" />
                <span className="uppercase tracking-wide text-xs font-semibold">Matches</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">Direkte Matches</h3>
              <p className="mt-2 text-sm text-white/90">
                Wöchentliche Vorschläge – mit einem Klick Interesse zeigen.
              </p>
            </article>

            {/* 8) Sofortkontakt */}
            <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <PhoneCall className="h-5 w-5" />
                <span className="uppercase tracking-wide text-xs font-semibold">Kontakt</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">Sofortkontakt & Multichannel</h3>
              <p className="mt-2 text-sm text-zinc-300">
                WhatsApp, Telefon oder E-Mail – ohne Umwege.
              </p>
            </article>

            {/* 9) Verifizierte Profile */}
            <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <ShieldCheck className="h-5 w-5" />
                <span className="uppercase tracking-wide text-xs font-semibold">Qualität</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">Verifizierte Profile</h3>
              <p className="mt-2 text-sm text-zinc-300">
                Standardisierte Daten & Dokumente – zuverlässig vergleichbar.
              </p>
            </article>

            {/* 10) Analytics & Insights */}
            <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <BarChart3 className="h-5 w-5" />
                <span className="uppercase tracking-wide text-xs font-semibold">Insights</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">Analytics & Team-Branding</h3>
              <p className="mt-2 text-sm text-zinc-300">
                Sichtbarkeit messen, Team-Profile stärken, Wirkung belegen.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- ProductShowcaseSection ---------------- */
export function ProductShowcaseSection() {
  return (
    <section className="w-full bg-black text-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-4">
          So sieht das Produkt aus
        </h2>
        <p className="text-center text-zinc-400 mb-16 max-w-2xl mx-auto">
          Ein Blick in die Anwendung – für Azubis, Schüler, Fachkräfte und Unternehmen.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* User Preview */}
          <div className="relative rounded-3xl ring-1 ring-zinc-800 bg-gradient-to-b from-zinc-900/50 to-black p-8 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
            <div className="relative">
              <div className="flex items-center gap-3 text-[color:var(--brand)] text-sm uppercase tracking-wider font-semibold mb-4">
                <Users className="h-5 w-5" />
                <span>Für Azubis, Schüler & Fachkräfte</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">CV-Editor & Community</h3>
              <p className="text-zinc-300 mb-8 leading-relaxed">
                Erstelle deinen professionellen CV in nur 5 Schritten, teile ihn per Link, PDF oder QR-Code
                und vernetze dich mit deiner Community. Entdecke Unternehmen und lass dich direkt kontaktieren.
              </p>
              <div className="aspect-[16/10] rounded-2xl bg-zinc-950 ring-1 ring-zinc-800 flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <span className="text-zinc-500 text-sm">CV-Editor Interface</span>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="px-3 py-1 bg-[color:var(--brand)]/20 text-[color:var(--brand)] rounded-full">PDF Export</span>
                <span className="px-3 py-1 bg-[color:var(--brand)]/20 text-[color:var(--brand)] rounded-full">QR-Code</span>
                <span className="px-3 py-1 bg-[color:var(--brand)]/20 text-[color:var(--brand)] rounded-full">Community</span>
              </div>
            </div>
          </div>

          {/* Company Preview */}
          <div className="relative rounded-3xl ring-1 ring-zinc-800 bg-gradient-to-b from-zinc-900/50 to-black p-8 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
            <div className="relative">
              <div className="flex items-center gap-3 text-blue-400 text-sm uppercase tracking-wider font-semibold mb-4">
                <Building2 className="h-5 w-5" />
                <span>Für Unternehmen</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Kandidatensuche & Recruitment</h3>
              <p className="text-zinc-300 mb-8 leading-relaxed">
                Durchsuchen Sie standardisierte Profile, schalten Sie passende Kandidat:innen mit Token frei
                und kontaktieren Sie diese direkt per WhatsApp, Telefon oder E-Mail. Employer Branding inklusive.
              </p>
              <div className="aspect-[16/10] rounded-2xl bg-zinc-950 ring-1 ring-zinc-800 flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏢</div>
                  <span className="text-zinc-500 text-sm">Unternehmens-Dashboard</span>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">Token-System</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">Direktkontakt</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
