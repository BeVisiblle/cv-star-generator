import React, { useEffect, useRef, useState } from "react";

/* ----------------------- Section 1: Feature-Switcher ---------------------- */

type Feature = {
  key: string;
  label: string;
  title: string;
  body: string;
  img: string;
  ctas: { primary: { label: string; href: string }, secondary?: { label: string; href: string } };
};

const FEATURES: Feature[] = [
  {
    key: "cv",
    label: "Lebenslauf → Profil",
    title: "Erstelle deinen CV – und dein Profil entsteht automatisch",
    body:
      "In wenigen Minuten zu einem klaren, glaubwürdigen Profil. Teile es mit deinem Netzwerk oder bewirb dich damit direkt.",
    img: "/assets/feat-1.png",
    ctas: {
      primary: { label: "Lebenslauf erstellen", href: "/cv-generator" },
      secondary: { label: "Beispiel ansehen", href: "/demo" },
    },
  },
  {
    key: "community",
    label: "Vernetzen & Austausch",
    title: "Bleib mit Kolleg:innen & Freund:innen im echten Austausch",
    body:
      "Folge Menschen, die du kennst. Teile Wissen aus dem Arbeitsalltag – ohne Spam, mit echter Relevanz.",
    img: "/assets/feat-2.png",
    ctas: {
      primary: { label: "Jetzt vernetzen", href: "/auth" },
      secondary: { label: "Community entdecken", href: "/feed" },
    },
  },
  {
    key: "jobs",
    label: "Unternehmen & Jobs",
    title: "Passende Jobs entdecken – wenn es wirklich passt",
    body:
      "Sieh den Alltag in Unternehmen, bewerbe dich mit 1-Klick und behalte den Austausch als Fokus.",
    img: "/assets/feat-3.png",
    ctas: {
      primary: { label: "Jobs durchsuchen", href: "/jobs" },
      secondary: { label: "Für Unternehmen", href: "/company" },
    },
  },
];

function FeatureSwitcher() {
  const [active, setActive] = useState<Feature>(FEATURES[0]);

  return (
    <section className="mt-16">
      <div className="mx-auto max-w-5xl px-4 grid gap-8 md:grid-cols-[1fr,1.2fr] items-start">
        {/* Left: Selectable pills */}
        <div className="space-y-3">
          {FEATURES.map((f) => {
            const selected = f.key === active.key;
            return (
              <button
                key={f.key}
                onClick={() => setActive(f)}
                className={`w-full text-left rounded-2xl border px-4 py-3 transition shadow-sm
                ${selected ? "bg-[#5170ff] text-white border-transparent shadow-md" : "bg-white hover:bg-gray-50"}`}
              >
                <span className="text-sm font-medium">{f.label}</span>
              </button>
            );
          })}
          <div className="mt-3 text-sm text-gray-500">
            Klicke auf eine Karte, um Text, Bild und CTAs rechts zu ändern.
          </div>
        </div>

        {/* Right: content changes (title, copy, image, CTAs) */}
        <div className="rounded-3xl border bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-2xl font-semibold">{active.title}</h3>
          <p className="mt-2 text-gray-700">{active.body}</p>

          <div className="mt-5 overflow-hidden rounded-2xl border bg-gray-50">
            <img
              src={active.img}
              alt={active.title}
              className="w-full h-64 object-cover"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={active.ctas.primary.href}
              className="inline-flex items-center rounded-full px-5 py-3 text-sm font-medium text-white shadow-md hover:shadow-lg transition"
              style={{ background: "#5170ff" }}
            >
              {active.ctas.primary.label}
            </a>
            {active.ctas.secondary && (
              <a
                href={active.ctas.secondary.href}
                className="inline-flex items-center rounded-full border px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                {active.ctas.secondary.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Section 2: Stats ----------------------------- */

function MiniStats() {
  const items = [
    { kpi: "100k+", label: "Erstellte Lebensläufe" },
    { kpi: "5M+", label: "Community-Interaktionen" },
    { kpi: "25k+", label: "Aktive Unternehmen" },
  ];
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-5xl px-4 grid gap-4 md:grid-cols-3">
        {items.map((it, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-5 shadow-sm border transition hover:shadow-md
              ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
          >
            <div className="text-2xl font-semibold">{it.kpi}</div>
            <div className="mt-1 text-sm text-gray-600">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------- Section 3: Testimonials -------------------------- */

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aylin Demir",
    role: "ZFA",
    quote:
      "BeVisiblle fühlt sich an wie ein ehrliches Netzwerk – ich sehe echten Alltag und lerne täglich dazu.",
    avatar: "/assets/t1.jpg",
  },
  {
    name: "Jonas Keller",
    role: "Elektroniker",
    quote:
      "Mein CV war in 10 Minuten online. Seitdem kamen Kontakte über Kollegen, nicht über Zufall.",
    avatar: "/assets/t2.jpg",
  },
  {
    name: "Mira Novak",
    role: "Pflegefachkraft",
    quote:
      "Der Fokus auf Menschen statt nur Jobs macht den Unterschied. Austausch ist Gold wert.",
    avatar: "/assets/t3.jpg",
  },
  {
    name: "Leo Wagner",
    role: "Kfz-Mechatroniker",
    quote:
      "1-Klick Bewerbung mit Profil – und die Firma kann sich vorher ein Bild machen. Top.",
    avatar: "/assets/t4.jpg",
  },
  {
    name: "Svenja Roth",
    role: "Friseurin",
    quote:
      "Ich habe hier mehr Kolleginnen kennengelernt als in jedem anderen Netzwerk.",
    avatar: "/assets/t5.jpg",
  },
];

function Testimonials() {
  const [i, setI] = useState(0);
  const total = TESTIMONIALS.length;
  const next = () => setI((v) => (v + 1) % total);
  const prev = () => setI((v) => (v - 1 + total) % total);

  // Auto-play (optional)
  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="mt-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Was unsere Community sagt</h3>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={prev} className="rounded-full border px-3 py-2 hover:bg-gray-50">‹</button>
            <button onClick={next} className="rounded-full border px-3 py-2 hover:bg-gray-50">›</button>
          </div>
        </div>

        <div className="relative grid gap-6 md:grid-cols-2">
          {/* Card 1 */}
          {[0,1].map((slot) => {
            const idx = (i + slot) % total;
            const t = TESTIMONIALS[idx];
            return (
              <div
                key={idx}
                className="relative rounded-3xl border bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                {/* Overlap avatar */}
                <div className="absolute -top-5 left-5 h-10 w-10 overflow-hidden rounded-full ring-4 ring-white shadow">
                  <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" />
                </div>
                <div className="pt-6">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                  <p className="mt-3 text-gray-700">{t.quote}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile controls */}
        <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
          <button onClick={prev} className="rounded-full border px-3 py-2">‹</button>
          <button onClick={next} className="rounded-full border px-3 py-2">›</button>
        </div>

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-2">
          {TESTIMONIALS.map((_, idx) => (
            <span
              key={idx}
              onClick={() => setI(idx)}
              className={`h-2.5 w-2.5 cursor-pointer rounded-full ${idx===i ? "bg-[#5170ff]" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Export Block ------------------------------ */

export default function LandingExtras() {
  return (
    <>
      <FeatureSwitcher />
      <MiniStats />
      <Testimonials />
    </>
  );
}
