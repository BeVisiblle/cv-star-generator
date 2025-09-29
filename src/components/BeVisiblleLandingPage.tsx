import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingExtras from '@/components/LandingExtras';

export default function BeVisiblleLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Calendly integration
  const openCalendly = () => {
    // @ts-ignore
    if (window.Calendly) {
      // @ts-ignore
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/bevisiblle/demo'
      });
    }
  };

  // Newsletter form handler
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Newsletter-Anmeldung erfolgreich!');
  };

  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <header className="fixed top-4 left-0 right-0 z-50">
        <nav className="mx-auto max-w-5xl px-4">
          <div className="bg-white/90 backdrop-blur rounded-full shadow-sm border px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              {/* Left: Logo */}
              <Link to="/" className="flex items-center gap-2 pl-1">
                <div className="flex items-center gap-2">
                  <img src="/assets/Logo_visiblle.svg" alt="BeVisiblle" className="h-8 w-8 rounded-lg" />
                  <span className="text-lg font-semibold tracking-tight">BeVisiblle</span>
                </div>
              </Link>

              {/* Center: Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link to="/cv-generator" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Lebenslauf
                </Link>
                <a href="#netzwerk" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Netzwerk
                </a>
                <Link to="/company" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Unternehmen
                </Link>
                <a href="#about" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Über uns
                </a>
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Link to="/auth" className="hidden sm:inline-flex rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/cv-generator" className="rounded-full px-4 py-2 text-sm font-medium text-white bg-[#5170ff]">
                  Jetzt registrieren
                </Link>
                {/* Mobile menu button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile dropdown */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mx-4 mt-2 bg-white/90 backdrop-blur rounded-lg shadow-sm border px-4 py-2`}>
            <Link to="/cv-generator" className="block py-2 text-gray-700 hover:text-gray-900">
              Lebenslauf
            </Link>
            <a href="#netzwerk" className="block py-2 text-gray-700 hover:text-gray-900">
              Netzwerk
            </a>
            <Link to="/company" className="block py-2 text-gray-700 hover:text-gray-900">
              Unternehmen
            </Link>
            <a href="#about" className="block py-2 text-gray-700 hover:text-gray-900">
              Über uns
            </a>
            <Link to="/auth" className="block py-2 text-gray-700 hover:text-gray-900">
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Hey, wir sind <span className="text-[#5170ff]">BeVisiblle</span>
            </h1>
            <p className="mt-2 text-lg md:text-2xl text-gray-800">
              Dein Netzwerk für Austausch und neue Jobs
            </p>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Mit <span className="font-medium">be visiblle</span> kannst du dich mit deinen Kolleg:innen und Freund:innen vernetzen, dein Wissen & Arbeitsalltag teilen und neue Jobs & Unternehmen finden.
            </p>

            {/* CTA + Profile cluster */}
            <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
              <Link 
                to="/cv-generator" 
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ 
                  background: '#5170ff', 
                  boxShadow: '0 8px 25px rgba(81,112,255,0.35)' 
                }}
              >
                Jetzt registrieren
              </Link>
              <div className="bg-white/20 backdrop-blur-sm rounded-full border border-white/30 px-6 py-3 flex items-center justify-center gap-3">
                <img src="/assets/Cluster1.png" alt="Profile Cluster" className="h-8 w-auto object-contain" />
                <span className="text-sm font-medium text-gray-700">+345 weitere Profile</span>
              </div>
            </div>
          </div>

          {/* Hero-Bild */}
          <div className="relative mt-8 flex justify-center">
            <img src="/assets/hero-main.png" alt="BeVisiblle – Menschen vernetzen sich" className="max-w-5xl w-full h-auto object-contain" />
          </div>
        </div>
      </section>

      {/* CTA Section unter den Frauen */}
      <section className="relative -mt-8 z-10 flex justify-center gap-6">
        <button 
          onClick={openCalendly}
          className="inline-flex items-center rounded-full border border-gray-300 px-8 py-4 text-base font-semibold text-gray-700 bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105"
        >
          Demo buchen
        </button>
        <Link 
          to="/cv-generator" 
          className="inline-flex items-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          style={{ 
            background: '#5170ff', 
            boxShadow: '0 8px 25px rgba(81,112,255,0.35)' 
          }}
        >
          Lebenslauf erstellen
        </Link>
      </section>

      {/* Logo Marquee */}
      <section className="mt-8 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full border border-white/30 py-6 px-8">
            <div className="overflow-hidden relative">
              <div className="flex animate-marquee space-x-12">
                {/* Alle 10 Logos für nahtlose Schleife */}
                {[...Array(2)].map((_, round) => (
                  <React.Fragment key={round}>
                    {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                      <img 
                        key={`${round}-${num}`}
                        src={`/assets/logo${num}.png`} 
                        alt={`Logo ${num}`} 
                        className="h-12 w-auto grayscale opacity-80 hover:opacity-100 transition flex-shrink-0" 
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT Section (links Pill, rechts Text) */}
      <section id="about" className="mt-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] items-start gap-6">
            {/* Links: Pill */}
            <div className="flex">
              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs font-medium text-gray-700 shadow-sm border">
                About be Visiblle
              </span>
            </div>
            {/* Rechts: Text */}
            <div className="flex justify-end">
              <div className="max-w-xl text-right">
                <p className="text-gray-800 text-sm leading-relaxed">
                  Mit <span className="font-semibold">Visiblle</span> kannst du easy deinen Lebenslauf erstellen – dieser wird
                  direkt zu deinem Profil, wo du dich mit Freund:innen, Kolleg:innen oder Gleichgesinnten vernetzen,
                  austauschen und dein Wissen teilen kannst. Außerdem wirst du auf Jobs & Unternehmen aufmerksam und
                  kannst dich bewerben.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Landing Extras: Feature-Switcher, Stats, Testimonials */}
      <LandingExtras />

      {/* 3 FEATURE-CARDS (Text links, Bild rechts) */}
      <section id="netzwerk" className="mt-16">
        <div className="mx-auto max-w-5xl px-4 space-y-8">
          {/* Feature 1 */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="grid gap-6 md:grid-cols-[1fr,0.8fr] items-center">
              {/* Left: Text */}
              <div>
                <h3 className="text-2xl font-semibold mb-3">Erstelle deinen CV in Minuten</h3>
                <p className="text-gray-700 mb-4">
                  Mit unserem intuitiven CV-Generator erstellst du in wenigen Schritten einen 
                  professionellen Lebenslauf. Automatische Formatierung, moderne Vorlagen 
                  und direkte Bewerbungsmöglichkeiten inklusive.
                </p>
                <Link 
                  to="/cv-generator" 
                  className="inline-flex items-center text-[#5170ff] font-medium hover:underline"
                >
                  Jetzt CV erstellen →
                </Link>
              </div>
              {/* Right: Image */}
              <div className="rounded-2xl overflow-hidden">
                <img src="/assets/feature-1.png" alt="CV Generator" className="w-full h-48 object-cover" />
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="grid gap-6 md:grid-cols-[1fr,0.8fr] items-center">
              {/* Left: Text */}
              <div>
                <h3 className="text-2xl font-semibold mb-3">Vernetze dich authentisch</h3>
                <p className="text-gray-700 mb-4">
                  Tausche dich mit Kolleg:innen aus deiner Branche aus. Teile Erfahrungen, 
                  lerne von anderen und baue echte berufliche Beziehungen auf – 
                  ohne Spam oder oberflächliche Kontakte.
                </p>
                <Link 
                  to="/auth" 
                  className="inline-flex items-center text-[#5170ff] font-medium hover:underline"
                >
                  Community beitreten →
                </Link>
              </div>
              {/* Right: Image */}
              <div className="rounded-2xl overflow-hidden">
                <img src="/assets/feature-2.png" alt="Community" className="w-full h-48 object-cover" />
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="grid gap-6 md:grid-cols-[1fr,0.8fr] items-center">
              {/* Left: Text */}
              <div>
                <h3 className="text-2xl font-semibold mb-3">Finde passende Jobs</h3>
                <p className="text-gray-700 mb-4">
                  Entdecke Stellenanzeigen von Unternehmen, die wirklich zu dir passen. 
                  Bewirb dich mit 1-Klick über dein Profil und erhalte direktes 
                  Feedback von Arbeitgebern.
                </p>
                <Link 
                  to="/jobs" 
                  className="inline-flex items-center text-[#5170ff] font-medium hover:underline"
                >
                  Jobs entdecken →
                </Link>
              </div>
              {/* Right: Image */}
              <div className="rounded-2xl overflow-hidden">
                <img src="/assets/feature-3.png" alt="Jobs" className="w-full h-48 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Card */}
      <section className="mt-16 mb-8">
        <div className="mx-auto max-w-5xl px-4">
          <div 
            className="rounded-2xl shadow-lg border bg-[#5170ff] text-white px-6 py-8 md:px-10 md:py-10"
            style={{ boxShadow: '0 10px 30px rgba(81,112,255,0.25)' }}
          >
            <div className="grid gap-6 md:grid-cols-[1.1fr,1fr] items-center">
              {/* Left: Copy */}
              <div>
                <h3 className="text-xl md:text-2xl font-semibold">Abonniere unseren Newsletter</h3>
                <p className="mt-2 text-white/90">
                  Updates zu Community, neuen Funktionen & passenden Jobs – direkt in dein Postfach.
                </p>
              </div>
              {/* Right: Form */}
              <form className="flex w-full items-center gap-3" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  required
                  placeholder="Deine E-Mail"
                  className="w-full rounded-full bg-white text-gray-900 placeholder:text-gray-500 px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-white/70"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white text-[#5170ff] px-5 py-3 text-sm font-semibold shadow-md hover:shadow-lg transition"
                >
                  Abonnieren
                </button>
              </form>
            </div>
            <p className="mt-3 text-xs text-white/80">
              Du kannst dich jederzeit abmelden. Weitere Infos in unserer Datenschutzerklärung.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-16">
        <div className="border-t">
          <div className="mx-auto max-w-6xl px-4 pt-8 pb-10">
            <div className="grid gap-10 md:grid-cols-4">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2">
                  <img src="/assets/logo-mark.png" alt="BeVisiblle" className="h-8 w-8 rounded-lg" />
                  <span className="text-lg font-semibold">BeVisiblle</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Netzwerk für Austausch & echte Arbeit – Jobs als Zusatz.
                </p>
              </div>

              {/* Spalten */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Company</h4>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li><a className="hover:underline" href="#about">Über uns</a></li>
                  <li><a className="hover:underline" href="#netzwerk">Community</a></li>
                  <li><Link className="hover:underline" to="/company">Unternehmen</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Support</h4>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li><a className="hover:underline" href="#hilfe">Hilfe</a></li>
                  <li><a className="hover:underline" href="#feedback">Feedback</a></li>
                  <li><a className="hover:underline" href="#kontakt">Kontakt</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Rechtliches</h4>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li><Link className="hover:underline" to="/datenschutz">Datenschutz</Link></li>
                  <li><Link className="hover:underline" to="/impressum">Impressum</Link></li>
                  <li><Link className="hover:underline" to="/agb">AGB</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
              <p>© 2024 BeVisiblle. Alle Rechte vorbehalten.</p>
              <div className="flex items-center gap-4">
                <Link className="hover:underline" to="/datenschutz">Datenschutz</Link>
                <Link className="hover:underline" to="/impressum">Impressum</Link>
                <Link className="hover:underline" to="/agb">AGB</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
