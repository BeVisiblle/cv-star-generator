import React from 'react';
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
  return (
    <main className="min-h-screen bg-black text-white" style={{ ['--brand' as any]: '#5ce1e6' }}>
      {/* Simple Header */}
      <header className="bg-black py-4">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[color:var(--brand)]" />
            <span className="text-lg font-semibold">Ausbildungsbasis</span>
          </div>
          <div className="flex-1 flex justify-end">
            <Link 
              to="/auth" 
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold border border-zinc-700 text-white hover:bg-zinc-900"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Mobile Image */}
      <section className="relative overflow-hidden bg-black">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
                Mach keinen Lebenslauf.<br />
                <span className="text-[color:var(--brand)]">Mach Eindruck.</span>
              </h1>
              <p className="mt-6 text-zinc-300 text-lg max-w-xl">
                In nur 5 Minuten zum perfekten Azubi‑CV. Keine langweiligen Bewerbungen mehr –
                werde direkt von Unternehmen gefunden und kontaktiert.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/cv-generator" 
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold bg-[color:var(--brand)] text-black shadow-lg shadow-teal-500/20"
                >
                  Lebenslauf erstellen – kostenlos
                </Link>
              </div>
            </div>
            <div className="relative lg:ml-8">
              <img 
                src="/lovable-uploads/95e5dd4a-87e4-403a-b2cd-6f3d06433d25.png" 
                alt="CV Generator Mobile App" 
                className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl transform lg:translate-x-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <FeatureCardsSection />

      {/* Dual Call‑to‑Action */}
      <section className="py-16 bg-black">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl ring-1 ring-zinc-800 p-8 bg-zinc-900/40">
            <h3 className="text-2xl font-semibold">Bereit, deinen CV zu bauen?</h3>
            <p className="mt-2 text-sm text-zinc-300">Starte kostenlos, exportiere als PDF und teile dein Profil direkt.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/cv-generator" className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-[color:var(--brand)] text-black">Für Azubis: Jetzt starten</Link>
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
              <div className="h-8 w-8 rounded-xl bg-[color:var(--brand)]" />
              <span className="text-lg font-semibold">Ausbildungsbasis</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400 max-w-xs">Die smarte Brücke zwischen Azubis und Unternehmen – mit CV‑Generator, Matching und direktem Kontakt.</p>
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
              <li><a href="#agb" className="hover:text-white">AGB</a></li>
            </ul>
          </div>
        </div>
        <div className="px-4 pb-8 mx-auto max-w-7xl text-xs text-zinc-500">© {new Date().getFullYear()} Ausbildungsbasis. Alle Rechte vorbehalten.</div>
      </footer>
    </main>
  );
}

// --- FeatureCardsSection ---
export function FeatureCardsSection() {
  return (
    <section className="w-full bg-black text-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 text-center">
          Warum unser CV‑Generator?
        </h2>

        {/* First Row - 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* CV in 5 Schritten */}
          <article className="relative overflow-hidden rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-25" />
            <div className="relative p-6 md:p-8">
              <h3 className="text-2xl font-bold">CV in 5 Schritten</h3>
              <p className="mt-3 text-sm text-zinc-200/90 leading-relaxed">
                Von Layout bis Profil in <strong>5 Minuten</strong>. Einfache
                Eingabe, klare Struktur, perfekter Look – bereit für PDF,
                Profil‑Link & QR.
              </p>
            </div>
          </article>

          {/* Community */}
          <article className="rounded-2xl bg-white text-zinc-900 ring-1 ring-zinc-200 p-6 md:p-8">
            <div className="flex items-center gap-2 text-zinc-700">
              <Users className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs">Community</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Vernetzen & Austausch</h3>
            <p className="mt-3 text-sm text-zinc-700">
              Tritt in Kontakt mit Azubis aus deiner Branche, lerne ihre
              Unternehmen kennen, vernetze dich mit Kolleg:innen und entdecke
              die Arbeit von morgen.
            </p>
          </article>

          {/* Unternehmen */}
          <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 md:p-8">
            <div className="flex items-center gap-2 text-zinc-400">
              <Building2 className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs">Unternehmen</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Von Firmen lernen & kontaktiert werden</h3>
            <p className="mt-3 text-sm text-zinc-300">
              Entdecke spannende Arbeitgeber, Einblicke in Berufe und lasse dich
              direkt von Unternehmen ansprechen – ohne klassische Bewerbung.
            </p>
          </article>

          {/* Gruppen */}
          <article className="rounded-2xl bg-[color:var(--brand)] p-6 md:p-8 text-black">
            <div className="flex items-center gap-2 text-black/80">
              <MessageSquare className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs">Gruppen</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Interessen‑Gruppen & Lernhilfe</h3>
            <p className="mt-3 text-sm">
              Tritt Gruppen bei, lerne von anderen oder hilf mit. Teile
              Dokumente (z. B. Lernzettel für Klausuren) und diskutiere in
              kleinen Runden.
            </p>
          </article>
        </div>

        {/* Second Row - 360° Full Width + 3 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* 360° - Full Width */}
          <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 md:p-8 lg:col-span-1">
            <div className="text-5xl font-extrabold tracking-tight">360°</div>
            <h3 className="mt-2 text-lg font-medium text-zinc-200">Recruiting & Employer Branding</h3>
            <p className="mt-3 text-sm text-zinc-300">
              Finden Sie spannende Profile mit vollständigen Daten, schalten
              Sie diese frei und überzeugen Sie Talente von Ihrem
              Unternehmen. Mitarbeitende werden zu Markenbotschafter:innen –
              durch Austausch in Ihrem Namen.
            </p>
            <div className="mt-4 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 ring-1 ring-zinc-700">
              <p className="text-xs text-zinc-300">Freigabe via Token‑Modell, Export als Link/PDF/QR.</p>
            </div>
          </article>

          {/* Matches */}
          <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 md:p-8">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs">Matches</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Direkte Matches & Wochen‑Vorschläge</h3>
            <p className="mt-3 text-sm text-zinc-300">
              Erhalte automatisch passende Ausbildungs‑Matches – wöchentlich
              aktualisiert. Mit einem Klick Interesse zeigen oder Kontakt
              freigeben.
            </p>
          </article>

          {/* Kontakt */}
          <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 md:p-8">
            <div className="flex items-center gap-2 text-zinc-400">
              <PhoneCall className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs">Kontakt</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Sofortkontakt & Multichannel</h3>
            <p className="mt-3 text-sm text-zinc-300">
              Erreichen Sie Kandidat:innen direkt per WhatsApp, Telefon oder
              E‑Mail – ohne Umwege. Schnelle Antworten, weniger Absprünge.
            </p>
          </article>

          {/* Qualität */}
          <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 md:p-8">
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs">Qualität</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold">Verifizierte Profile & Team‑Effekt</h3>
            <p className="mt-3 text-sm text-zinc-300">
              Standardisierte, geprüfte Lebensläufe. Team‑Profile stärken Ihre
              Arbeitgebermarke – Empfehlungen entstehen organisch.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}