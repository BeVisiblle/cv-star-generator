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
    <main className="bg-black text-white" style={{ ['--brand' as any]: '#5ce1e6' }}>
      {/* Header with Logo and Login */}
      <header className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[color:var(--brand)]" />
            <span className="text-lg font-semibold">Ausbildungsbasis</span>
          </div>
          <Link to="/auth" className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold border border-zinc-700 text-white hover:bg-zinc-900">
            Login
          </Link>
        </div>
      </header>

      {/* 1) Hero Section with Image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
                Mach keinen Lebenslauf.<br />
                <span className="text-[color:var(--brand)]">Mach Eindruck.</span>
              </h1>
              <p className="mt-6 text-zinc-300 text-lg">
                In nur 5 Minuten zum perfekten Azubi‑CV. Keine langweiligen Bewerbungen mehr –
                werde direkt von Unternehmen gefunden und kontaktiert.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/cv-generator" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold bg-[color:var(--brand)] text-black shadow-lg shadow-teal-500/20">
                  Lebenslauf erstellen – kostenlos
                </Link>
                <Link to="/auth" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold border border-zinc-700 text-white hover:bg-zinc-900">
                  Bereits einen Account? Login
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img 
                src="/lovable-uploads/8fb35cdb-4a8e-4fad-b852-15d97bce3b1f.png" 
                alt="CV-Generator App auf dem Smartphone" 
                className="max-w-sm w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3) Feature Cards */}
      <FeatureCardsSection />

      {/* 4) Produkt‑Showcase */}
      <section id="produkt" className="w-full bg-black text-white py-16 border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">So sieht das Produkt aus</h2>
          <p className="mt-2 text-zinc-400">Ein Blick in die Anwendung – für Azubis und Unternehmen.</p>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Preview */}
            <div className="rounded-2xl ring-1 ring-zinc-800 bg-gradient-to-b from-zinc-900 to-black p-6">
              <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider"><Users className="h-4 w-4" /> Für Azubis</div>
              <h3 className="mt-2 text-2xl font-semibold">CV‑Editor & Profil</h3>
              <p className="mt-2 text-sm text-zinc-300">Erstelle deinen CV in 5 Schritten, teile ihn per Link/PDF/QR und vernetze dich mit deiner Community.</p>
              <div className="mt-6 aspect-[16/9] rounded-xl bg-zinc-950 ring-1 ring-zinc-800 flex items-center justify-center">
                <span className="text-zinc-600 text-sm">Screenshot/Video: CV‑Editor</span>
              </div>
            </div>

            {/* Company Preview */}
            <div className="rounded-2xl ring-1 ring-zinc-800 bg-gradient-to-b from-zinc-900 to-black p-6">
              <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider"><Building2 className="h-4 w-4" /> Für Unternehmen</div>
              <h3 className="mt-2 text-2xl font-semibold">Kandidatensuche & Freischaltung</h3>
              <p className="mt-2 text-sm text-zinc-300">Standardisierte Profile, Token‑basiertes Freischalten und direkter Kontakt via WhatsApp/Telefon/E‑Mail.</p>
              <div className="mt-6 aspect-[16/9] rounded-xl bg-zinc-950 ring-1 ring-zinc-800 flex items-center justify-center">
                <span className="text-zinc-600 text-sm">Screenshot/Video: Unternehmen‑Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5) Dual Call‑to‑Action */}
      <section className="py-16 border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl ring-1 ring-zinc-800 p-8 bg-zinc-900/40">
            <h3 className="text-2xl font-semibold">Bereit, deinen CV zu bauen?</h3>
            <p className="mt-2 text-sm text-zinc-300">Starte kostenlos, exportiere als PDF und teile dein Profil direkt.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/cv-generator" className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-[color:var(--brand)] text-black">Für Azubis: Jetzt starten</Link>
              <a href="#app" className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-zinc-700">App laden</a>
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

// --- FeatureCardsSection (8 Tiles) ---
export function FeatureCardsSection() {
  return (
    <section id="features" className="w-full bg-black text-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
          Warum unser CV‑Generator?
        </h2>

        <div className="space-y-6" aria-label="Feature grid">
          {/* 360° – Full Width */}
          <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-5xl font-extrabold tracking-tight">360°</div>
                <h3 className="mt-2 text-lg font-medium text-zinc-200">Recruiting & Employer Branding</h3>
                <p className="mt-3 text-sm text-zinc-300 max-w-xl">
                  Finden Sie spannende Profile mit vollständigen Daten, schalten
                  Sie diese frei und überzeugen Sie Talente von Ihrem
                  Unternehmen. Mitarbeitende werden zu Markenbotschafter:innen –
                  durch Austausch in Ihrem Namen.
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 ring-1 ring-zinc-700">
                <p className="text-xs text-zinc-300">Freigabe via Token‑Modell, Export als Link/PDF/QR.</p>
              </div>
            </div>
          </article>

          {/* Three Cards in Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </section>
  );
}