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
            <span className="text-lg font-semibold hidden sm:block text-white">Ausbildungsbasis</span>
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
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] text-white">
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
      <section className="bg-black py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-8">
            <p className="text-zinc-400 text-sm uppercase tracking-wide">Vertrauen von Unternehmen</p>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex items-center justify-center animate-scroll">
              <div className="flex items-center space-x-12 md:space-x-16">
                <div className="flex items-center justify-center h-16 w-32">
                  <img src="/lovable-uploads/audi-logo.png" alt="Audi" className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center justify-center h-16 w-32">
                  <img src="/lovable-uploads/biontech-logo.png" alt="BioNTech" className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center justify-center h-16 w-32">
                  <img src="/lovable-uploads/rewe-logo.png" alt="REWE" className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center justify-center h-16 w-32">
                  <img src="/lovable-uploads/db-logo.png" alt="Deutsche Bahn" className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center justify-center h-16 w-32">
                  <img src="/lovable-uploads/crsen-logo.png" alt="CRSEN" className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-black py-20 px-6">
        <div className="mx-auto max-w-7xl text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Warum unser Portal genau richtig für Dich ist.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* CV in 5 Schritten */}
          <div className="bg-zinc-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-white mb-2">CV in 5 Schritten</h3>
            <p className="text-zinc-300 text-sm">Von Layout bis Profil in 5 Minuten. Einfache Eingabe, klare Struktur, perfekter Look – lade ihn als PDF herunter, oder erstelle dir ein Profil.</p>
          </div>
          
          {/* Community */}
          <div className="bg-white rounded-2xl p-6">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-black mb-2">Vernetzen & Austausch</h3>
            <p className="text-gray-600 text-sm">Tritt in Kontakt mit Fachkräften aus deiner und anderen Branchen und vernetze dich mit der Community von morgen.</p>
          </div>
          
          {/* Unternehmen */}
          <div className="bg-blue-900 rounded-2xl p-6">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-bold text-white mb-2">Von Firmen kontaktiert werden</h3>
            <p className="text-blue-200 text-sm">Lasse dich direkt von Unternehmen ansprechen – ohne klassische Bewerbung.</p>
          </div>
          
          {/* KI-Powered */}
          <div className="bg-purple-600 rounded-2xl p-6">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-white mb-2">Smart CV</h3>
            <p className="text-purple-200 text-sm">KI optimiert automatisch deinen CV für verschiedene Branchen und deinen Wünschen.</p>
          </div>
          
          {/* Gruppen */}
          <div className="bg-teal-500 rounded-2xl p-6">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-black mb-2">Tritt Gruppen bei & teile Lernhilfe mit anderen</h3>
            <p className="text-teal-900 text-sm">Tritt Gruppen bei, lerne von anderen oder hilf mit. Teile Dokumente wie Lernzettel für Klausuren und diskutiere in kleinen Runden über deine relevante Themen von aktuellen Themen bis hin zur Prüfungsvorbereitung.</p>
          </div>
          
          {/* Matches */}
          <div className="bg-red-500 rounded-2xl p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Direkte Matches</h3>
            <p className="text-red-200 text-sm">Erhalte automatisch passende Matches – täglich aktualisiert.</p>
          </div>
          
          {/* Mobile first */}
          <div className="bg-green-600 rounded-2xl p-6">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-white mb-2">Mobile first</h3>
            <p className="text-green-200 text-sm">Optimiert für Smartphone – immer und überall erreichbar.</p>
          </div>
          
          {/* Kostenlos */}
          <div className="bg-yellow-500 rounded-2xl p-6">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-black mb-2">100% kostenlos</h3>
            <p className="text-yellow-800 text-sm">Für Azubis und Schüler komplett kostenfrei. Immer.</p>
          </div>
        </div>
      </section>

      {/* So sieht das Produkt aus */}
      <section className="bg-black py-20 px-6">
        <div className="mx-auto max-w-7xl text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">So sieht das Produkt aus</h2>
          <p className="text-zinc-400 text-lg">Ein Blick in die Anwendung – für Azubis, Schüler, Fachkräfte und Unternehmen.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Für Azubis, Schüler & Fachkräfte */}
          <div className="bg-zinc-900 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-[#5ce1e6] mr-3" />
              <span className="text-[#5ce1e6] text-sm font-semibold uppercase tracking-wide">Für Azubis, Schüler & Fachkräfte</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">CV-Editor, Job finden & Community beitreten</h3>
            <p className="text-zinc-300 mb-6">
              Erstelle deinen professionellen CV in nur fünf Schritten. Lade ihn als PDF herunter oder veröffentliche dein Profil – und werde direkt von Unternehmen gefunden und kontaktiert. Vernetze dich mit anderen Fachkräften, tausche Erfahrungen aus und tritt passenden Gruppen bei, um immer auf dem neuesten Stand zu bleiben.
            </p>
            <div className="bg-zinc-800 rounded-xl p-4 mb-6">
              <img src="/lovable-uploads/f1e5ea3a-b50e-43ce-ae9d-9b13fcbd32bf.png" alt="User Interface Preview" className="w-full rounded-lg" />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#5ce1e6] text-black rounded-full text-xs font-medium">PDF Export</span>
              <span className="px-3 py-1 bg-[#5ce1e6] text-black rounded-full text-xs font-medium">Vernetzen</span>
              <span className="px-3 py-1 bg-[#5ce1e6] text-black rounded-full text-xs font-medium">Community</span>
            </div>
          </div>
          
          {/* Für Unternehmen */}
          <div className="bg-zinc-900 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Building2 className="h-6 w-6 text-blue-400 mr-3" />
              <span className="text-blue-400 text-sm font-semibold uppercase tracking-wide">Für Unternehmen</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Kandidatensuche & Employee Branding</h3>
            <p className="text-zinc-300 mb-6">
              Durchsuchen Sie standardisierte Azubi-Profile, schalten Sie passende Kandidat:innen per Token frei und nehmen Sie direkt Kontakt auf – via WhatsApp, Telefon oder E-Mail. Stärken Sie Ihr Employer Branding: Vernetzen Sie Ihr Team auf der Plattform und lassen Sie Mitarbeitende als authentische Markenbotschafter wirken.
            </p>
            <div className="bg-zinc-800 rounded-xl p-4 mb-6">
              <img src="/lovable-uploads/f1e5ea3a-b50e-43ce-ae9d-9b13fcbd32bf.png" alt="Company Dashboard Preview" className="w-full rounded-lg" />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-400 text-black rounded-full text-xs font-medium">Token-System</span>
              <span className="px-3 py-1 bg-blue-400 text-black rounded-full text-xs font-medium">Direktkontakt</span>
              <span className="px-3 py-1 bg-blue-400 text-black rounded-full text-xs font-medium">Employee Branding</span>
            </div>
          </div>
        </div>
      </section>

      {/* CV Generator CTA Section */}
      <section className="bg-black py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: CTA */}
            <div className="bg-zinc-900 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">Bereit, deinen CV zu bauen?</h2>
              <p className="text-zinc-300 mb-6">Starte kostenlos, exportiere als PDF und teile dein Profil direkt.</p>
              <Link to="/lebenslauf-erstellen" className="inline-flex items-center px-6 py-3 bg-[#5ce1e6] text-black rounded-2xl font-semibold hover:bg-[#4ac9ce]">
                Für Schüler, Azubis und Fachkräfte: Jetzt starten
              </Link>
            </div>
            
            {/* Right: Company CTA */}
            <div className="bg-zinc-900 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">Talente schneller finden</h2>
              <p className="text-zinc-300 mb-6">Registrieren Sie Ihr Unternehmen und schalten Sie passende Profile frei.</p>
              <div className="flex gap-3">
                <Link to="/unternehmen" className="inline-flex items-center px-4 py-2 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100">
                  Unternehmen registrieren
                </Link>
                <Link to="/auth" className="inline-flex items-center px-4 py-2 border border-zinc-700 text-white rounded-2xl font-semibold hover:bg-zinc-800">
                  Login
                </Link>
              </div>
            </div>
          </div>
          
          {/* Mobile Screenshots */}
          <div className="mt-12 text-center">
            <img 
              src="/lovable-uploads/b7b98cf2-e7aa-4114-acd1-846b6f7fa94c.png" 
              alt="CV Generator Mobile Views" 
              className="w-full max-w-4xl mx-auto rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/db86285e-b61d-4b09-b7a8-09931550f198.png" alt="Ausbildungsbasis Logo" className="h-8 w-8 object-contain" />
              <span className="text-2xl font-bold text-white">Ausbildungsbasis</span>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Die smarte Brücke zwischen Schülern, Azubis und Fachkräften und Unternehmen – Austausch untereinander, einem KI-Matching und einer Datenbank mit vollständigen Profilen.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-4 text-white">Navigation</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link to="/lebenslauf-erstellen" className="hover:text-white">Features</Link></li>
                <li><Link to="/unternehmen" className="hover:text-white">Produkt</Link></li>
                <li><Link to="/unternehmen" className="hover:text-white">Unternehmen</Link></li>
                <li><a href="mailto:info@ausbildungsbasis.de" className="hover:text-white">Kontakt</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Rechtliches</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link to="/impressum" className="hover:text-white">Impressum</Link></li>
                <li><Link to="/datenschutz" className="hover:text-white">Datenschutz</Link></li>
                <li><Link to="/agb" className="hover:text-white">AGB</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Social</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="https://www.instagram.com/ausbildungsbasis" className="hover:text-white">Instagram</a></li>
                <li><a href="https://www.tiktok.com/@ausbildungsbasis" className="hover:text-white">TikTok</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Beliebte Themen</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link to="/lebenslauf-erstellen" className="hover:text-white">Lebenslauf erstellen (Generator)</Link></li>
                <li><Link to="/lebenslauf-erstellen" className="hover:text-white">CV Ausbildung – so sieht's aus</Link></li>
                <li><Link to="/lebenslauf-erstellen" className="hover:text-white">Lebenslauf Hilfe – Features</Link></li>
                <li><Link to="/unternehmen" className="hover:text-white">Kandidatensuche für Unternehmen</Link></li>
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