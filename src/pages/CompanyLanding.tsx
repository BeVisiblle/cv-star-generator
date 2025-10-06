import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SmartInteractions from '@/components/landing/SmartInteractions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check } from 'lucide-react';

type CalendlyWidget = {
  initPopupWidget: (options: { url: string }) => void;
};

declare global {
  interface Window {
    Calendly?: CalendlyWidget;
  }
}

type BillingCycle = 'monthly' | 'yearly';

const pricingTiers = [
  {
    id: 'base',
    title: 'Base',
    description: 'Ideal für Betriebe, die erstmals sichtbar werden wollen.',
    price: { monthly: 79, yearly: 790 },
    badgeMonthly: undefined,
    badgeYearly: '2 Monate gratis',
    features: [
      'Teamprofil & Kulturseite',
      'Bis zu 5 Mitarbeitende vernetzen sich',
      'Grundlegende Analytics',
      'Support per E-Mail'
    ],
    ctaLabelMonthly: 'Jetzt starten',
    ctaLabelYearly: 'Jährlich buchen',
    ctaHref: '/signup/company?plan=base'
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'Für Teams, die regelmäßig Talent-Content teilen möchten.',
    price: { monthly: 129, yearly: 1290 },
    badgeMonthly: 'Beliebt',
    badgeYearly: '3 Monate gratis',
    features: [
      'Unbegrenzte Mitarbeitende',
      'Erweiterte Analytics & Insights',
      'Talent-Pools & Direktnachrichten',
      'BeVisiblle Success Call'
    ],
    ctaLabelMonthly: 'Pro buchen',
    ctaLabelYearly: 'Pro jährlich sichern',
    ctaHref: '/signup/company?plan=pro'
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'Für größere Organisationen mit individuellen Anforderungen.',
    price: { monthly: 249, yearly: 2490 },
    badgeMonthly: undefined,
    badgeYearly: 'Beste Konditionen',
    features: [
      'Dedicated Success Manager',
      'Integration in HR-/ATS-Systeme',
      'Employer-Brand-Kampagnen',
      'Vor-Ort Workshops & Roll-out'
    ],
    ctaLabelMonthly: 'Beratung anfragen',
    ctaLabelYearly: 'Enterprise anfragen',
    ctaHref: 'https://calendly.com/todd-bevisiblle/gettoknowbeviviblle'
  }
];

const faqs = [
  {
    question: 'Wie viele Mitarbeitende können wir onboarden?',
    answer: 'Im Base-Paket bis zu fünf, in Pro und Enterprise unbegrenzt. Mitarbeitende erhalten eigene Spaces, um Inhalte zu teilen und Kontakte zu pflegen.'
  },
  {
    question: 'Können wir zwischen monatlich und jährlich wechseln?',
    answer: 'Ja, du kannst jederzeit wechseln. Beim Wechsel von jährlich auf monatlich wird der neue Plan nach Ablauf deiner Laufzeit aktiv.'
  },
  {
    question: 'Welche Zahlungsarten werden unterstützt?',
    answer: 'Wir unterstützen SEPA-Lastschrift, Kreditkarte sowie auf Anfrage Rechnung per Überweisung (ab Pro).' 
  },
  {
    question: 'Welche Inhalte sehen Talente von uns?',
    answer: 'Du entscheidest: Vom ausführlichen Teamprofil über Erfahrungsberichte bis zu Live-Events. Je aktiver ihr seid, desto sichtbarer werdet ihr.'
  },
  {
    question: 'Gibt es eine Onboarding-Unterstützung?',
    answer: 'Im Pro-Paket ist ein Success Call enthalten, bei Enterprise begleiten wir euch mit Workshops, Content-Ideen und Performance-Auswertungen.'
  }
];

export default function CompanyLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openCalendly = () => {
    if (typeof window !== 'undefined' && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/todd-bevisiblle/gettoknowbeviviblle'
      });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Newsletter-Anmeldung erfolgreich!');
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
                <Link to="/company" className="rounded-md px-3 py-2 text-sm font-medium text-[#5170ff] hover:bg-blue-50">
                  Unternehmen
                </Link>
                <Link to="/signup/company" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Registrieren
                </Link>
                <Link to="/about" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Über uns
                </Link>
              </nav>

              <div className="flex items-center gap-2">
                <Link to="/auth" className="hidden sm:inline-flex rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Login
                </Link>
                <button
                  onClick={openCalendly}
                  className="hidden sm:inline-flex rounded-full bg-[#5170ff] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-300 transition hover:bg-[#3f5bff]"
                >
                  Demo buchen
                </button>
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
            <Link to="/company" className="block py-2 font-semibold text-[#5170ff]">
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
              <span className="text-[#5170ff]">BeVisiblle</span>
              <span className="text-4xl md:text-5xl font-semibold text-gray-900"> – das Netzwerk, das Ihr Unternehmen ins Gespräch bringt.</span>
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-gray-800">
              Ob Azubi, Fachkraft oder Führungskraft – mit BeVisiblle vernetzen sich Ihre Mitarbeiter:innen nicht nur miteinander, sondern auch mit Talenten außerhalb Ihres Unternehmens.
            </p>
            <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
              Indem sie Einblicke teilen und gemeinsam aktiv sind, wird Ihr Unternehmen sichtbar – authentisch, menschlich, attraktiv. So werden Sie zur ersten Wahl für neue Bewerber:innen.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/signup/company?plan=free"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{
                  background: '#5170ff',
                  boxShadow: '0 8px 25px rgba(81,112,255,0.35)'
                }}
              >
                Jetzt registrieren
              </Link>
              <button
                onClick={openCalendly}
                className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/30 px-5 py-2 text-sm font-semibold text-[#5170ff] shadow-sm backdrop-blur transition hover:bg-white"
              >
                <img src="/assets/Cluster1.png" alt="Profile Cluster" className="h-10 w-auto object-contain" />
                +345 weitere Profile
              </button>
            </div>
          </div>

          <div className="relative mt-8 flex justify-center">
            <img src="/assets/company-mainhero-2.png" alt="Digitale Vernetzung zwischen Talenten und Unternehmen" className="max-w-5xl w-full h-auto object-contain" />
          </div>
        </div>
      </section>

      <section className="relative -mt-8 z-10 flex justify-center gap-6">
        <button
          onClick={openCalendly}
          className="inline-flex items-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105"
          style={{
            background: '#5170ff',
            boxShadow: '0 8px 25px rgba(81,112,255,0.35)'
          }}
        >
          Demo buchen
        </button>
        <Link
          to="/signup/company?plan=free"
          className="inline-flex items-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          style={{
            background: '#5170ff',
            boxShadow: '0 8px 25px rgba(81,112,255,0.35)'
          }}
        >
          Unternehmen registrieren
        </Link>
      </section>

      <section className="mt-8 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full border border-white/30 py-6 px-8">
            <div className="overflow-hidden relative">
              <div className="flex animate-marquee space-x-12">
                {[...Array(2)].map((_, round) => (
                  <React.Fragment key={round}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
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

      <section id="about" className="mt-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] items-start gap-6">
            <div className="flex">
              <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs font-medium text-gray-700 shadow-sm border">
                About be Visiblle
              </span>
            </div>
            <div className="flex justify-end">
              <div className="max-w-xl text-right">
                <p className="text-gray-800 text-sm leading-relaxed">
                  Mit <span className="font-semibold">Visiblle</span> kannst du easy deinen Lebenslauf erstellen – dieser wird direkt zu deinem Profil, wo du dich mit Freund:innen, Kolleg:innen oder Gleichgesinnten vernetzen, austauschen und dein Wissen teilen kannst. Außerdem wirst du auf Jobs & Unternehmen aufmerksam und kannst dich bewerben.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="mt-16">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 md:grid-cols-3">
          {[{
            title: 'Community',
            img: '/assets/feature-2.png',
            link: '/auth'
          }, {
            title: 'CV',
            img: '/assets/feature-1.png',
            link: '/cv-generator'
          }, {
            title: 'Jobs',
            img: '/assets/feature-3.png',
            link: '/jobs'
          }].map((card) => (
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

      <section className="mt-20">
        <SmartInteractions />
      </section>

      <section className="mt-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">Simple, transparente Preise</h2>
          <p className="mt-2 text-sm text-slate-500">Flexibel wechseln – keine versteckten Kosten.</p>

          <div className="mt-6 inline-flex rounded-full bg-white/80 shadow border border-slate-200 p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition ${
                billingCycle === 'monthly' ? 'bg-[#5170ff] text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition ${
                billingCycle === 'yearly' ? 'bg-[#5170ff] text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jährlich
            </button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3 items-stretch">
            {pricingTiers.map((tier) => {
              const isPopular = tier.id === 'pro';
              const price = billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly;
              const period = billingCycle === 'monthly' ? 'Monat' : 'Jahr';
              const badge = billingCycle === 'monthly' ? tier.badgeMonthly : tier.badgeYearly;
              return (
                <div
                  key={tier.id}
                  className={`relative rounded-[28px] border bg-white/90 backdrop-blur px-6 py-8 shadow-[0_18px_45px_rgba(81,112,255,0.18)] text-left transition ${
                    isPopular ? 'border-[#5170ff] ring-4 ring-[#5170ff]/15 translate-y-[-6px]' : 'border-slate-200'
                  }`}
                >
                  {badge && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold ${
                      isPopular ? 'bg-[#5170ff] text-white shadow-lg' : 'bg-white text-slate-600 border'
                    }`}>
                      {badge}
                    </div>
                  )}
                  <div className="text-3xl font-semibold text-slate-900">
                    €{price}
                    <span className="text-sm font-normal text-slate-500"> /{period}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{tier.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{tier.description}</p>

                  <ul className="mt-6 space-y-3 text-sm text-slate-600">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className={`h-4 w-4 ${isPopular ? 'text-[#5170ff]' : 'text-slate-400'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.ctaHref.startsWith('http') ? (
                    <a
                      href={tier.ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                        isPopular
                          ? 'bg-[#5170ff] text-white shadow hover:opacity-90'
                          : 'border border-slate-200 text-slate-700 hover:border-[#5170ff]/50'
                      }`}
                    >
                      {billingCycle === 'monthly' ? tier.ctaLabelMonthly : tier.ctaLabelYearly}
                    </a>
                  ) : (
                    <Link
                      to={tier.ctaHref}
                      className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                        isPopular
                          ? 'bg-[#5170ff] text-white shadow hover:opacity-90'
                          : 'border border-slate-200 text-slate-700 hover:border-[#5170ff]/50'
                      }`}
                    >
                      {billingCycle === 'monthly' ? tier.ctaLabelMonthly : tier.ctaLabelYearly}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="mx-auto max-w-4xl px-4">
          <h3 className="text-3xl font-semibold text-slate-900 text-center">Häufige Fragen</h3>
          <Accordion type="single" collapsible className="mt-8 divide-y divide-slate-200 rounded-2xl border bg-white/80 backdrop-blur">
            {faqs.map((faq, idx) => (
              <AccordionItem key={faq.question} value={`faq-${idx}`}>
                <AccordionTrigger className="px-6 text-left text-base text-slate-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 text-sm text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="mt-16 mb-8">
        <div className="mx-auto max-w-5xl px-4">
          <div
            className="rounded-2xl shadow-lg border bg-[#5170ff] text-white px-6 py-8 md:px-10 md:py-10"
            style={{ boxShadow: '0 10px 30px rgba(81,112,255,0.25)' }}
          >
            <div className="grid gap-6 md:grid-cols-[1.1fr,1fr] items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold">Abonniere unseren Newsletter</h3>
                <p className="mt-2 text-white/90">
                  Updates zu Community, neuen Funktionen & passenden Jobs – direkt in dein Postfach.
                </p>
              </div>
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

      <footer className="relative mt-16">
        <div className="border-t">
          <div className="mx-auto max-w-6xl px-4 pt-8 pb-10">
            <div className="grid gap-10 md:grid-cols-4">
              <div>
                <div className="flex items-center gap-2">
                  <img src="/assets/Logo_visiblle_1.png" alt="BeVisiblle" className="h-10 w-auto" />
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Netzwerk für Austausch & echte Arbeit – Jobs als Zusatz.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900">Company</h4>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li><Link className="hover:underline" to="/about">Über uns</Link></li>
                  <li><a className="hover:underline" href="#community">Community</a></li>
                  <li><Link className="hover:underline" to="/company/onboarding">Unternehmen</Link></li>
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

            <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
              <p>© {new Date().getFullYear()} BeVisiblle. Alle Rechte vorbehalten.</p>
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
