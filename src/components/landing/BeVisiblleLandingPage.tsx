import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SmartInteractions from '@/components/landing/SmartInteractions';
import lebenslaufFeature from '@/assets/lebenslauf-feature.png';
import jobsFeature from '@/assets/jobs-feature.png';
import communityFeature from '@/assets/community-feature.png';
import { trackCalendlyClick, trackPageView } from '@/lib/telemetry';
import { motion } from 'framer-motion';

const heroVariants = [
  {
    id: 'main',
    image: '/assets/hero-main.png',
    headline: 'Hey, wir sind',
    subtitle: 'Dein Netzwerk für Austausch und neue Jobs',
    description: 'Mit BeVisiblle kannst du dich mit deinen Kolleg:innen und Freund:innen vernetzen, dein Wissen & Arbeitsalltag teilen und neue Jobs & Unternehmen finden.'
  },
  {
    id: 'business',
    image: '/assets/hero-business-cropped.png',
    headline: 'Finde deinen Traumjob mit',
    subtitle: 'Vernetze dich mit Unternehmen, die zu dir passen',
    description: 'Erstelle deinen Lebenslauf, präsentiere deine Fähigkeiten und werde sichtbar für Unternehmen, die genau nach dir suchen.'
  },
  {
    id: 'healthcare',
    image: '/assets/hero-healthcare-cropped.png',
    headline: 'Deine Karriere in der Pflege startet hier mit',
    subtitle: 'Jobs, Community und Weiterbildung an einem Ort',
    description: 'Ob Ausbildung oder Fachkraft – finde passende Stellen im Gesundheitswesen und tausche dich mit Kolleg:innen aus der Branche aus.'
  },
  {
    id: 'construction',
    image: '/assets/hero-construction-cropped.png',
    headline: 'Handwerk hat goldenen Boden',
    headlineExtra: '–\u00A0und',
    subtitle: 'Dein Netzwerk für Azubis und Fachkräfte im Handwerk',
    description: 'Zeige deine praktischen Fähigkeiten, finde Ausbildungsplätze oder Jobs im Handwerk und vernetze dich mit Gleichgesinnten.'
  }
];

export default function BeVisiblleLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState(0);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Calendly integration - open in new tab
  const openCalendly = (buttonLabel: string = 'Demo buchen') => {
    trackCalendlyClick(buttonLabel, 'Landing Page');
    window.open('https://calendly.com/bevisiblle/demo', '_blank', 'noopener,noreferrer');
  };

  // Newsletter form handler
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Newsletter-Anmeldung erfolgreich!');
  };

  useEffect(() => {
    // Zufällige Hero-Version auswählen
    const randomIndex = Math.floor(Math.random() * heroVariants.length);
    setSelectedHero(randomIndex);

    trackPageView('Landing Page');
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
                  <img src="/assets/Logo_visiblle-2.svg" alt="BeVisiblle" className="h-8 w-8" />
                  <span className="text-lg font-semibold tracking-tight">
                    BeVisib<span className="text-primary">ll</span>e
                  </span>
                </div>
              </Link>

              {/* Center: Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link to="/cv-generator" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Lebenslauf
                </Link>
                <a href="#community" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Community
                </a>
                <Link to="/company" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Unternehmen
                </Link>
                <Link to="/about" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Über uns
                </Link>
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
              <Link to="/auth" className="hidden sm:inline-flex rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Login
              </Link>
              <Link to="/cv-generator" className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#5170ff]">
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
            <a href="#community" className="block py-2 text-gray-700 hover:text-gray-900">
              Community
            </a>
            <Link to="/company" className="block py-2 text-gray-700 hover:text-gray-900">
              Unternehmen
            </Link>
            <Link to="/about" className="block py-2 text-gray-700 hover:text-gray-900">
              Über uns
            </Link>
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
            <motion.h1
              key={`headline-${selectedHero}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
            >
              {heroVariants[selectedHero].headline}{' '}
              {heroVariants[selectedHero].headlineExtra && (
                <span className="whitespace-nowrap">{heroVariants[selectedHero].headlineExtra}{' '}</span>
              )}
              <span className="text-[#5170ff]">BeVisiblle</span>
            </motion.h1>
            <motion.p
              key={`subtitle-${selectedHero}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-2 text-lg md:text-2xl text-gray-800"
            >
              {heroVariants[selectedHero].subtitle}
            </motion.p>
            <motion.p
              key={`desc-${selectedHero}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-gray-600 max-w-2xl mx-auto"
            >
              {heroVariants[selectedHero].description}
            </motion.p>

            {/* CTA + Profile cluster */}
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
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
              
              {/* Profile Cluster ohne Card */}
              <div className="inline-flex items-center gap-3">
                <img src="/assets/Cluster1.png" alt="Profile Cluster" className="h-10 w-auto object-contain" />
                <span className="text-xs font-medium text-gray-700 tracking-wide">+345 weitere Profile</span>
              </div>
            </div>
          </div>

          {/* Hero-Bild */}
          <motion.div
            key={`image-${selectedHero}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mt-8 flex justify-center overflow-hidden"
            style={{ maxHeight: '500px' }}
          >
            <img 
              src={heroVariants[selectedHero].image} 
              alt="BeVisiblle – Menschen vernetzen sich" 
              className="w-full h-full object-cover object-center"
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center 20%',
                maxHeight: '500px'
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section direkt unter dem Bild */}
      <section className="relative -mt-4 z-10 flex justify-center gap-6 pb-16">
        <button
          onClick={() => openCalendly('Demo buchen (Hero)')}
          className="inline-flex items-center rounded-full border border-gray-300 px-8 py-4 text-base font-semibold text-gray-700 bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105"
        >
          Demo buchen
        </button>
        <Link 
          to="/cv-erstellen" 
          className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          style={{ 
            background: '#5170ff', 
            boxShadow: '0 8px 25px rgba(81,112,255,0.35)' 
          }}
        >
          Lebenslauf erstellen
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Neu</span>
        </Link>
      </section>


      {/* ABOUT Section (links Pill, rechts Text) */}
      <section id="about" className="mt-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] items-start gap-6">
            {/* Links: Pill */}
            <div className="flex">
              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs font-medium text-gray-700 shadow-sm border">
                Über BeVisib<span className="text-[#5170ff]">ll</span>e
              </span>
            </div>
            {/* Rechts: Text */}
            <div className="flex justify-end">
              <div className="max-w-xl text-right">
                <p className="text-gray-800 text-sm leading-relaxed">
                  Mit <span className="font-semibold">BeVisib<span className="text-[#5170ff]">ll</span>e</span> kannst du easy deinen Lebenslauf erstellen – dieser wird
                  direkt zu deinem Profil, wo du dich mit Freund:innen, Kolleg:innen oder Gleichgesinnten vernetzen,
                  austauschen und dein Wissen teilen kannst. Außerdem wirst du auf Jobs & Unternehmen aufmerksam und
                  kannst dich bewerben.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="community" className="mt-16">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 md:grid-cols-3">
          {[{
            title: "Community",
            img: communityFeature,
            link: "/auth"
          }, {
            title: "CV",
            img: lebenslaufFeature,
            link: "/cv-generator"
          }, {
            title: "Jobs",
            img: jobsFeature,
            link: "/jobs"
          }].map((card, idx) => (
            <Link
              key={card.title}
              to={card.link}
              className="group relative block rounded-[32px] overflow-hidden shadow-[0_18px_45px_rgba(81,112,255,0.28)] transition hover:-translate-y-1"
            >
              <img src={card.img} alt={card.title} className="w-full h-60 object-cover transition duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition" />
              <span className="absolute bottom-4 left-5 text-white text-2xl font-semibold tracking-tight">{card.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Smart Interactions Section */}
      <section className="mt-20">
        <SmartInteractions />
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
                  <img src="/assets/Logo_visiblle-2.svg" alt="BeVisiblle" className="h-8 w-8 object-contain" />
                  <span className="text-lg font-semibold">
                    BeVisib<span className="text-primary">ll</span>e
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  BeVisible ist mehr als eine Jobplattform. Mit uns findest du Menschen, Chancen und Unternehmen, die zu dir passen. Vernetze dich, teile Erfahrungen und werde sichtbar für deinen Traumjob. 💙
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
              <p>© 2025 BeVisiblle. Alle Rechte vorbehalten.</p>
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
