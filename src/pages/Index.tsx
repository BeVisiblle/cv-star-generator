import React, { useEffect } from 'react';
import { ArrowRight, Users, Building2, MessageSquare, Sparkles, ShieldCheck, PhoneCall, CheckCircle, Target, Zap, Star } from "lucide-react";
import { Link } from 'react-router-dom';
import { Feature } from "@/components/Feature";
import { BranchCard } from "@/components/BranchCard";
import { Step } from "@/components/Step";

export default function Index() {
  // SEO Head Injection
  useEffect(() => {
    const site = "https://ausbildungsbasis.de";
    const title = "LinkedIn für Nonakademiker – Profile & Networking | Ausbildungsbasis";
    const desc = "Die Plattform für Fachkräfte, Azubis und Schüler. Profile anlegen, vernetzen und direkt von Unternehmen gefunden werden – kostenlos starten.";
    document.title = title;
  }, []);

  return (
    <main className="min-h-screen bg-black text-white w-full" style={{ ['--brand' as any]: '#5ce1e6' }}>
      {/* Header */}
      <header className="bg-black py-4 w-full">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/db86285e-b61d-4b09-b7a8-09931550f198.png" alt="Ausbildungsbasis Logo" className="h-8 w-8 object-contain" />
            <span className="text-lg font-semibold hidden sm:block">Ausbildungsbasis</span>
          </div>
          <div className="flex-1 flex justify-end">
            <Link to="/auth" className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold border border-zinc-700 text-white hover:bg-zinc-900">Login</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-black w-full">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
                LinkedIn für<br />
                <span className="text-[color:var(--brand)]">Nonakademiker.</span>
              </h1>
              <p className="mt-6 text-zinc-300 text-lg max-w-xl">
                Die Plattform für Fachkräfte, Azubis und Schüler. Profile anlegen, vernetzen 
                und direkt von Unternehmen gefunden werden – ohne klassische Bewerbung.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/auth" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold bg-[color:var(--brand)] text-black shadow-lg shadow-teal-500/20">
                  Profil anlegen – kostenlos
                </Link>
              </div>
              <p className="mt-3 text-xs text-zinc-500">*Durch deinen Lebenslauf wird automatisch ein Profil angelegt</p>
            </div>
            <div className="relative lg:ml-8 mx-0">
              <img src="/lovable-uploads/0e2d02cd-3bfb-4168-9d7f-9f201dc505be.png" alt="Ausbildungsbasis Mobile App" className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl transform lg:translate-x-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="bg-zinc-900 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-8">
            <p className="text-zinc-400 text-sm uppercase tracking-wide">Vertrauen von Unternehmen</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-12 md:space-x-16 animate-scroll">
              <div className="flex items-center justify-center h-12 w-24 bg-white rounded-lg">
                <span className="text-gray-800 font-bold text-lg">BMW</span>
              </div>
              <div className="flex items-center justify-center h-12 w-24 bg-white rounded-lg">
                <span className="text-gray-800 font-bold text-lg">VW</span>
              </div>
              <div className="flex items-center justify-center h-12 w-24 bg-white rounded-lg">
                <span className="text-gray-800 font-bold text-lg">Bosch</span>
              </div>
              <div className="flex items-center justify-center h-12 w-24 bg-white rounded-lg">
                <span className="text-gray-800 font-bold text-lg">SAP</span>
              </div>
              <div className="flex items-center justify-center h-12 w-24 bg-white rounded-lg">
                <span className="text-gray-800 font-bold text-lg">Siemens</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white text-black py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Warum Ausbildungsbasis anders ist</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <Feature icon="🎯" title="Branchenspezifisch" desc="Handwerk, IT, Gesundheit – Profile die zu deiner Branche passen." />
          <Feature icon="🚀" title="Ohne Bewerbung" desc="Unternehmen finden dich direkt über dein Profil. Kein Anschreiben nötig." />
          <Feature icon="💬" title="Direkter Kontakt" desc="Chat direkt mit Personalern und Ausbildungsverantwortlichen." />
          <Feature icon="🎨" title="Professionelle Profile" desc="Automatisch generierte Profile aus deinem Lebenslauf." />
          <Feature icon="📍" title="Regional & überregional" desc="Finde Ausbildungsplätze in deiner Nähe oder deutschlandweit." />
          <Feature icon="🔒" title="Datenschutz" desc="Du entscheidest, wer dein Profil sehen kann. Jederzeit widerrufbar." />
          <Feature icon="📱" title="Mobile first" desc="Optimiert für Smartphone – immer und überall erreichbar." />
          <Feature icon="⭐" title="100% kostenlos" desc="Für Azubis und Schüler komplett kostenfrei. Immer." />
        </div>
      </section>

      {/* Branchen */}
      <section className="bg-zinc-100 text-black py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Für alle Branchen gemacht</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <BranchCard
            emoji="👷"
            title="Handwerk"
            text="Zeig, was du kannst – auch ohne Berufserfahrung. Pünktlichkeit, Einsatz, Praxis sind gefragt."
          />
          <BranchCard
            emoji="💻"
            title="IT"
            text="Logisches Denken und digitales Interesse zählen mehr als Noten. Wir holen das Beste aus deinem Tech-Profil."
          />
          <BranchCard
            emoji="🩺"
            title="Gesundheit"
            text="Empathie, Sorgfalt, Verantwortung – das zählt bei dir. Wir bringen das in deinem Profil rüber."
          />
        </div>
      </section>

      {/* Für Unternehmen */}
      <section className="bg-white text-black py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Für Unternehmen</h2>
              <p className="text-lg text-gray-600 mb-8">
                Finden Sie die passenden Azubis ohne Bewerbungsaufwand. Gezieltes Matching nach Branche, Region und Qualifikationen.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Direkte Kontaktaufnahme mit interessierten Kandidaten</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Filterung nach Branche, Region und Qualifikationen</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Keine Streuverluste durch unpassende Bewerbungen</span>
                </div>
              </div>
              <Link to="/unternehmen" className="inline-flex items-center px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800">
                Für Unternehmen <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-2xl p-8 w-full max-w-md">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-center mb-4">Unternehmen-Dashboard</h3>
                <p className="text-gray-600 text-center">Verwalten Sie Ihre Stellenausschreibungen und finden Sie die besten Kandidaten.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Für Azubis */}
      <section className="bg-zinc-100 text-black py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
                <Users className="h-16 w-16 text-[#5ce1e6] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-center mb-4">Dein Profil</h3>
                <p className="text-gray-600 text-center">Erstelle dein professionelles Profil und werde von Unternehmen gefunden.</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Für Azubis & Schüler</h2>
              <p className="text-lg text-gray-600 mb-8">
                Zeig deine Stärken und werde direkt von Unternehmen kontaktiert. Ohne Bewerbungsstress zum Traumjob.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-[#5ce1e6] mr-3" />
                  <span>Profil in 5 Minuten erstellen</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-[#5ce1e6] mr-3" />
                  <span>Von Unternehmen direkt kontaktiert werden</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-[#5ce1e6] mr-3" />
                  <span>Keine klassischen Bewerbungen nötig</span>
                </div>
              </div>
              <Link to="/auth" className="inline-flex items-center px-6 py-3 bg-[#5ce1e6] text-black rounded-2xl font-semibold hover:bg-[#4ac9ce]">
                Jetzt starten <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CV Generator Section */}
      <section className="bg-white text-black py-20 px-6">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Professioneller Lebenslauf in 5 Minuten</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Unser CV-Generator erstellt automatisch ein professionelles Profil aus deinem Lebenslauf. 
            Perfekt für Handwerk, IT und Gesundheitswesen.
          </p>
          
          <div className="mb-12">
            <img 
              src="/lovable-uploads/b7b98cf2-e7aa-4114-acd1-846b6f7fa94c.png" 
              alt="CV Generator Mobile Views" 
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
            />
          </div>

          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto mb-12">
            <Step number="1" text="Branche wählen" />
            <Step number="2" text="Daten eingeben" />
            <Step number="3" text="Layout auswählen" />
            <Step number="4" text="PDF herunterladen" />
            <Step number="5" text="Profil erstellen" />
          </div>

          <Link to="/cv-generator" className="inline-flex items-center px-8 py-4 bg-[#5ce1e6] text-black rounded-2xl font-semibold text-lg hover:bg-[#4ac9ce] shadow-lg">
            Lebenslauf erstellen
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Produkt</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link to="/cv-generator" className="hover:text-white">Lebenslauf erstellen</Link></li>
                <li><Link to="/unternehmen" className="hover:text-white">Für Unternehmen</Link></li>
                <li><Link to="/ueber-uns" className="hover:text-white">Über uns</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="mailto:support@ausbildungsbasis.de" className="hover:text-white">Hilfe & Support</a></li>
                <li><a href="mailto:info@ausbildungsbasis.de" className="hover:text-white">Kontakt</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Rechtliches</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link to="/datenschutz" className="hover:text-white">Datenschutz</Link></li>
                <li><Link to="/impressum" className="hover:text-white">Impressum</Link></li>
                <li><Link to="/agb" className="hover:text-white">AGB</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Social</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="https://www.instagram.com/ausbildungsbasis" className="hover:text-white">Instagram</a></li>
                <li><a href="https://www.tiktok.com/@ausbildungsbasis" className="hover:text-white">TikTok</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-8 text-center text-sm text-zinc-400">
            <p>&copy; 2025 Ausbildungsbasis. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}