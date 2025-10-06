import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Community() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <header className="fixed top-4 left-0 right-0 z-50">
        <nav className="mx-auto max-w-5xl px-4">
          <div className="bg-white/90 backdrop-blur rounded-full shadow-sm border px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <Link to="/" className="flex items-center gap-2 pl-1">
                <img src="/assets/Logo_visiblle_1.png" alt="BeVisiblle" className="h-12 w-auto" />
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link to="/cv-generator" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Lebenslauf
                </Link>
                <Link to="/community" className="rounded-md px-3 py-2 text-sm font-medium text-[#5170ff] hover:bg-blue-50">
                  Community
                </Link>
                <Link to="/company" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Unternehmen
                </Link>
                <Link to="/about" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Über uns
                </Link>
              </nav>

              <div className="flex items-center gap-2">
                <Link to="/auth" className="hidden sm:inline-flex rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex rounded-full bg-[#5170ff] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-300 transition hover:bg-[#3f5bff]"
                >
                  Jetzt starten
                </Link>
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

          <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden mx-4 mt-2 bg-white/90 backdrop-blur rounded-lg shadow-sm border px-4 py-2`}>
            <Link to="/cv-generator" className="block py-2 text-gray-700 hover:text-gray-900">
              Lebenslauf
            </Link>
            <Link to="/community" className="block py-2 font-semibold text-[#5170ff]">
              Community
            </Link>
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

      <section className="relative pt-32 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              <span className="text-[#5170ff]">Community Spaces</span>
              <span className="text-4xl md:text-5xl font-semibold text-gray-900"> – Echter Austausch, echte Verbindungen</span>
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-gray-800">
              Bleib mit Kolleg:innen, Teams oder deiner Klasse verbunden. Teile Wissen, plane Schichten und starte Lernrunden – ohne Plattform-Stress.
            </p>
            <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
              In unseren Community Spaces kannst du dich mit Gleichgesinnten vernetzen, gemeinsam lernen und dein berufliches Netzwerk aufbauen.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{
                  background: '#5170ff',
                  boxShadow: '0 8px 25px rgba(81,112,255,0.35)'
                }}
              >
                Jetzt Community beitreten
              </Link>
            </div>
          </div>

          <div className="relative mt-12 flex justify-center">
            <img src="/assets/feature-2.png" alt="Community Spaces" className="max-w-4xl w-full h-auto object-contain rounded-3xl shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="mt-16 py-16 bg-white/50">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Was bietet dir die Community?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-[#5170ff]/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#5170ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Netzwerken</h3>
              <p className="text-gray-600">
                Vernetze dich mit Kolleg:innen, Gleichgesinnten und baue dein berufliches Netzwerk auf.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-[#5170ff]/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#5170ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Wissen teilen</h3>
              <p className="text-gray-600">
                Teile dein Wissen, lerne von anderen und wachse gemeinsam in deinem Fachgebiet.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-[#5170ff]/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#5170ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Schichten planen</h3>
              <p className="text-gray-600">
                Organisiere Schichten, koordiniere Teams und bleibe immer auf dem neuesten Stand.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Bereit loszulegen?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Werde Teil unserer Community und starte noch heute mit dem Networking.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              background: '#5170ff',
              boxShadow: '0 8px 25px rgba(81,112,255,0.35)'
            }}
          >
            Kostenlos registrieren
          </Link>
        </div>
      </section>

      <footer className="mt-16 border-t bg-white/80 backdrop-blur py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/assets/Logo_visiblle_1.png" alt="BeVisiblle" className="h-10 w-auto" />
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link to="/impressum" className="hover:text-gray-900">Impressum</Link>
              <Link to="/datenschutz" className="hover:text-gray-900">Datenschutz</Link>
              <Link to="/agb" className="hover:text-gray-900">AGB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
