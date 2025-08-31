import React, { useEffect } from 'react';
import { ArrowRight, Users, Building2, MessageSquare, Sparkles, ShieldCheck, PhoneCall } from "lucide-react";
import { Link } from 'react-router-dom';

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
                <Link to="/cv-generator" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold bg-[color:var(--brand)] text-black shadow-lg shadow-teal-500/20">
                  Profil anlegen – kostenlos
                </Link>
              </div>
              <p className="mt-3 text-xs text-zinc-500">*Durch deinen Lebenslauf wird automatisch ein Profil angelegt</p>
            </div>
            <div className="relative lg:ml-8 mx-0">
              <img src="/lovable-uploads/95e5dd4a-87e4-403a-b2cd-6f3d06433d25.png" alt="Ausbildungsbasis Mobile App" className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl transform lg:translate-x-8" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}