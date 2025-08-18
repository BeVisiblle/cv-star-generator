import React from 'react';
import { Button } from "@/components/ui/button";
import ProductShowcaseSection from "./ProductShowcase";

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
    <div className="min-h-screen bg-black text-white overflow-x-hidden w-full">
      {/* Simple Header */}
      <header className="relative bg-black py-6 w-full">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-3xl font-bold text-white">
              🎯 AkademikerPlus
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-white/80 hover:text-white transition-colors">Einloggen</a>
            <Button variant="secondary" className="bg-white text-black hover:bg-gray-100 font-semibold px-6 py-2">
              Registrieren
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Image */}
      <section className="relative bg-black py-20 min-h-[80vh] flex items-center w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[url('/images/step1-hero.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-white leading-tight">
            Deine Karriere<br />beginnt hier
          </h1>
          <p className="text-2xl md:text-3xl mb-12 text-white/80 max-w-4xl mx-auto leading-relaxed">
            Erstelle professionelle CVs, vernetze dich mit Unternehmen und finde deinen Traumjob
          </p>
          <Button className="bg-white text-black hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all">
            Jetzt CV erstellen
          </Button>
        </div>
      </section>

      {/* Features Grid - 9 Features in 5 Columns */}
      <FeatureCardsSection />

      {/* Product Showcase Sections */}
      <ProductShowcaseSection />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 py-20 w-full">
        <div className="container mx-auto px-6 text-center">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="p-10 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <h3 className="text-3xl font-bold mb-6 text-white">Für Schüler, Azubis & Fachkräfte</h3>
              <p className="text-white/80 mb-8 text-lg leading-relaxed">Erstelle deinen professionellen CV und finde deine nächste Chance</p>
              <Button className="bg-white text-black hover:bg-gray-100 w-full font-bold py-4 text-lg rounded-full transform hover:scale-105 transition-all">
                CV erstellen
              </Button>
            </div>
            <div className="p-10 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <h3 className="text-3xl font-bold mb-6 text-white">Für Unternehmen</h3>
              <p className="text-white/80 mb-8 text-lg leading-relaxed">Finde die besten Talente mit unserem intelligenten Matching-System</p>
              <Button className="bg-white text-black hover:bg-gray-100 w-full font-bold py-4 text-lg rounded-full transform hover:scale-105 transition-all">
                Talente finden
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-16 w-full">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Produkt</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">CV Generator</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">Templates</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Unternehmen</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">Talent Search</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">Preise</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">Hilfe</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">Kontakt</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">Datenschutz</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">Impressum</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-lg">AGB</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 mb-6 md:mb-0 text-lg">© 2024 AkademikerPlus. Alle Rechte vorbehalten.</p>
            <div className="flex space-x-8">
              <a href="#" className="text-white/60 hover:text-white transition-colors text-lg">📱 App Store</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-lg">🤖 Google Play</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-lg">📘 LinkedIn</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-lg">🐦 Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCardsSection() {
  return (
    <section className="bg-black py-24 w-full">
      <div className="w-full px-6">
        <h2 className="text-5xl md:text-6xl font-bold text-center mb-20 text-white">
          Alles was du brauchst, an einem Ort
        </h2>
        
        {/* Masonry Grid with 9 cards in 5 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-[1400px] mx-auto">
          
          {/* Row 1: CV in 5 Schritten (spans 2 columns) */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 p-10 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-all hover:shadow-blue-500/25">
            <div className="text-5xl mb-6">📝</div>
            <h3 className="text-3xl font-bold mb-4">CV in 5 Schritten</h3>
            <p className="text-blue-100 text-lg">Schnell und einfach zum perfekten Lebenslauf</p>
          </div>

          {/* Row 1: Community */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-all hover:shadow-green-500/25">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-3">Community</h3>
            <p className="text-green-100">Vernetze dich mit Gleichgesinnten</p>
          </div>

          {/* Row 1: Matches */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-8 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-all hover:shadow-orange-500/25">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">Matches</h3>
            <p className="text-orange-100">Perfekte Job-Matches für dich</p>
          </div>

          {/* Row 1: Qualität */}
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-8 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-all hover:shadow-yellow-500/25">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-3">Qualität</h3>
            <p className="text-yellow-100">Höchste Standards bei allen Prozessen</p>
          </div>

          {/* Row 2: KI-Powered (spans 2 columns) */}
          <div className="lg:col-span-2 bg-gradient-to-br from-red-600 to-pink-700 p-10 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-all hover:shadow-red-500/25">
            <div className="text-5xl mb-6">🤖</div>
            <h3 className="text-3xl font-bold mb-4">KI-Powered</h3>
            <p className="text-red-100 text-lg">Intelligente Optimierung deiner Bewerbungsunterlagen</p>
          </div>

          {/* Row 2: Kontakt */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-all hover:shadow-indigo-500/25">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-bold mb-3">Kontakt</h3>
            <p className="text-indigo-100">Direkter Draht zu deinen Wunsch-Unternehmen</p>
          </div>

          {/* Row 2: Unternehmen */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-all hover:shadow-purple-500/25">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-bold mb-3">Unternehmen</h3>
            <p className="text-purple-100">Entdecke spannende Arbeitgeber</p>
          </div>

          {/* Row 2: 360° Recruiting */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-8 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-all hover:shadow-teal-500/25">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-3">360° Recruiting</h3>
            <p className="text-teal-100">Rundum-Betreuung im Bewerbungsprozess</p>
          </div>

          {/* Row 2: Smart CV Optimization (9th feature) */}
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-8 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-all hover:shadow-cyan-500/25">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-3">Smart CV</h3>
            <p className="text-cyan-100">KI-optimierte Designs für maximale Wirkung</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Product Showcase Section ---
// Remove the old ProductShowcaseSection since we have the new one imported