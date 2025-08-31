import React, { useEffect } from 'react';
import { Users, Target, Heart, Award } from "lucide-react";
import { Link } from 'react-router-dom';

export default function UeberUns() {
  // SEO Head Injection
  useEffect(() => {
    const site = "https://ausbildungsbasis.de";
    const title = "Über uns – Die Vision von Ausbildungsbasis";
    const desc = "Erfahre mehr über Ausbildungsbasis: Unser Team, unsere Mission und wie wir Fachkräfte und Unternehmen zusammenbringen.";
    const keywords = "Über Ausbildungsbasis, Team, Mission, Vision, Fachkräfte Plattform";
    const ogImage = site + "/images/step1-hero.jpg";
    const head = document.head;
    const meta = (name: string, content: string, attr = "name") => {
      let el = head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    const link = (rel: string, href: string) => {
      let el = head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        head.appendChild(el);
      }
      el.href = href;
    };

    // Basic meta tags
    document.title = title;
    meta("description", desc);
    meta("keywords", keywords);
    meta("robots", "index,follow,max-image-preview:large");
    meta("viewport", "width=device-width, initial-scale=1");
    link("canonical", site + "/ueber-uns");

    // Open Graph
    head.insertAdjacentHTML("beforeend", '<meta property="og:locale" content="de_DE">' + '<meta property="og:type" content="website">' + '<meta property="og:site_name" content="Ausbildungsbasis">' + '<meta property="og:title" content="' + title.replace(/"/g, '&quot;') + '">' + '<meta property="og:description" content="' + desc.replace(/"/g, '&quot;') + '">' + '<meta property="og:url" content="' + site + '/ueber-uns">' + '<meta property="og:image" content="' + ogImage + '">' + '<meta property="og:image:alt" content="Über Ausbildungsbasis Team">');

    // Twitter Cards
    head.insertAdjacentHTML("beforeend", '<meta name="twitter:card" content="summary_large_image">' + '<meta name="twitter:title" content="' + title.replace(/"/g, '&quot;') + '">' + '<meta name="twitter:description" content="' + desc.replace(/"/g, '&quot;') + '">' + '<meta name="twitter:image" content="' + ogImage + '">');
  }, []);

  return (
    <main className="min-h-screen bg-black text-white w-full" style={{
      ['--brand' as any]: '#5ce1e6'
    }}>
      {/* Simple Header */}
      <header className="bg-black py-4 w-full">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/lovable-uploads/db86285e-b61d-4b09-b7a8-09931550f198.png" alt="Ausbildungsbasis Logo" className="h-8 w-8 object-contain" />
            <span className="text-lg font-semibold">Ausbildungsbasis</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/profil-anlegen" className="text-sm text-zinc-300 hover:text-white">Profil anlegen</Link>
            <Link to="/unternehmen" className="text-sm text-zinc-300 hover:text-white">Für Unternehmen</Link>
            <Link to="/auth" className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold border border-zinc-700 text-white hover:bg-zinc-900">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black w-full">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] mb-8">
              Über<br />
              <span className="text-[color:var(--brand)]">Ausbildungsbasis</span>
            </h1>
            <p className="text-zinc-300 text-xl max-w-3xl mx-auto">
              Wir glauben daran, dass jeder Mensch das Recht auf eine faire Chance im Berufsleben hat – 
              unabhängig vom Bildungsweg. Deshalb schaffen wir die Plattform für Nonakademiker.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-black w-full">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Unsere Mission</h2>
              <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                LinkedIn ist großartig – aber es ist für Akademiker gemacht. Wir schaffen das LinkedIn 
                für alle anderen: Handwerker, Pflegekräfte, Techniker, Azubis und alle, die mit ihren 
                Händen und ihrem Können die Welt bewegen.
              </p>
              <p className="text-zinc-300 text-lg leading-relaxed">
                Unsere Vision ist eine Welt, in der Talent erkannt wird – nicht nur Titel und Abschlüsse.
              </p>
            </div>
            <div className="relative">
              <img src="/images/step3.jpg" alt="Team Mission" className="w-full rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-zinc-900/20 w-full">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Unsere Werte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[color:var(--brand)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Authentizität</h3>
              <p className="text-zinc-300">Echte Menschen, echte Profile, echte Chancen. Keine Schönfärberei.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gemeinschaft</h3>
              <p className="text-zinc-300">Zusammen sind wir stärker. Wir bauen Brücken zwischen Menschen.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fairness</h3>
              <p className="text-zinc-300">Jeder verdient eine faire Chance – unabhängig vom Bildungsweg.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Qualität</h3>
              <p className="text-zinc-300">Handwerk und Fachkompetenz sind genauso wertvoll wie jeder Universitätsabschluss.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-black w-full">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Das Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-[color:var(--brand)] to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl font-bold text-black">TM</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Todd Morawe</h3>
              <p className="text-[color:var(--brand)] mb-4">Co-Founder & CEO</p>
              <p className="text-zinc-300">
                "Ich glaube daran, dass praktische Erfahrung genauso wertvoll ist wie theorisches Wissen. 
                Deshalb schaffen wir eine Plattform, die das würdigt."
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">TM</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Tom Morawe</h3>
              <p className="text-[color:var(--brand)] mb-4">Co-Founder & CTO</p>
              <p className="text-zinc-300">
                "Technologie soll Menschen zusammenbringen, nicht trennen. Wir entwickeln Tools, 
                die echte Verbindungen schaffen."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-zinc-900/40 w-full">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Werde Teil der Bewegung
          </h2>
          <p className="text-zinc-300 text-lg mb-8">
            Gemeinsam schaffen wir eine Welt, in der Können zählt – nicht nur Abschlüsse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/profil-anlegen" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold bg-[color:var(--brand)] text-black shadow-lg shadow-teal-500/20">
              Profil anlegen
            </Link>
            <Link to="/unternehmen" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold border border-zinc-700 text-white hover:bg-zinc-900">
              Unternehmen werden
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/db86285e-b61d-4b09-b7a8-09931550f198.png" alt="Ausbildungsbasis Logo" className="h-8 w-8 object-contain" />
              <span className="text-lg font-semibold">Ausbildungsbasis</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400 max-w-xs">Die smarte Brücke zwischen Schülern, Azubis und Fachkräften und Unternehmen – Austausch untereinander, einem AI-Matching und einer Datenbank mit vollständigen Profilen.</p>
          </div>
          <div className="text-sm text-zinc-400">
            <div className="font-semibold text-white">Navigation</div>
            <ul className="mt-3 space-y-2">
              <li><Link to="/profil-anlegen" className="hover:text-white">Profil anlegen</Link></li>
              <li><Link to="/unternehmen" className="hover:text-white">Für Unternehmen</Link></li>
              <li><Link to="/ueber-uns" className="hover:text-white">Über uns</Link></li>
              <li><a href="#kontakt" className="hover:text-white">Kontakt</a></li>
            </ul>
          </div>
          <div className="text-sm text-zinc-400">
            <div className="font-semibold text-white">Rechtliches</div>
            <ul className="mt-3 space-y-2">
              <li><Link to="/impressum" className="hover:text-white">Impressum</Link></li>
              <li><Link to="/datenschutz" className="hover:text-white">Datenschutz</Link></li>
              <li><Link to="/agb" className="hover:text-white">AGB</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="px-4 pb-8 mx-auto max-w-7xl text-xs text-zinc-500">© {new Date().getFullYear()} Ausbildungsbasis. Alle Rechte vorbehalten.</div>
      </footer>
    </main>
  );
}