import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type MatchingStep = {
  title: string;
  caption: string;
  description: string;
  metric: string;
  metricLabel: string;
  image: string;
};

const STEPS: MatchingStep[] = [
  {
    title: 'Talent-Signale',
    caption: 'Schritt 1',
    description:
      'Profile, Aktivität und geteilte Inhalte zeigen, welche Talente wirklich offen für Unternehmen sind – alles DSGVO-konform.',
    metric: '70+',
    metricLabel: 'Matching Signale pro Talent',
    image: '/assets/feature-1.png'
  },
  {
    title: 'Matching Layer',
    caption: 'Schritt 2',
    description:
      'BeVisiblle gleicht eure Bedarfe mit Skills, Interessen und Team-DNA ab. So landen nur passende Talente in eurer Pipeline.',
    metric: '92%',
    metricLabel: 'Trefferquote bei passenden Profilen',
    image: '/assets/feature-2.png'
  },
  {
    title: 'Team-Fit Insights',
    caption: 'Schritt 3',
    description:
      'Gemeinsame Werte, Lernziele und Arbeitsstile werden sichtbar. Mitarbeitende können Talente direkt empfehlen oder einladen.',
    metric: 'Realtime',
    metricLabel: 'Feedback aus eurem Team',
    image: '/assets/feature-3.png'
  },
  {
    title: 'Pipeline & Dialog',
    caption: 'Schritt 4',
    description:
      'Per Drag & Drop organisiert ihr Kandidat:innen, startet Chats oder Demo-Calls und messt, welche Inhalte am besten funktionieren.',
    metric: '1 Klick',
    metricLabel: 'Von Match zu Kontakt',
    image: '/assets/company-mainhero.png'
  }
];

export default function MatchingFlow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STEPS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const activeStep = STEPS[activeIndex];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center rounded-full bg-white/80 border border-[#d7ddff] px-4 py-1 text-xs font-medium tracking-[0.35em] text-[#5170ff] shadow-sm">
          Matching Flow
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
          Wie BeVisiblle euer Recruiting smart macht
        </h2>
        <p className="mt-3 text-sm md:text-base text-slate-600">
          Von Talent-Signalen bis zum persönlichen Gespräch – vier Schritte, die ihr automatisiert steuert.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.9fr)] items-center">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={step.title}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'relative flex h-full min-h-[260px] flex-col gap-4 rounded-[32px] border px-7 py-7 text-left transition duration-300 backdrop-blur',
                    isActive
                      ? 'bg-gradient-to-br from-[#5170ff] via-[#6c84ff] to-[#9fb3ff] text-white shadow-[0_20px_45px_rgba(81,112,255,0.35)]'
                      : 'bg-white/90 text-slate-500 border-white/60 hover:bg-white hover:text-slate-700 opacity-80 hover:opacity-100'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition',
                      isActive ? 'border-white/80 bg-white/20 text-white' : 'border-[#5170ff33] text-[#5170ff]'
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <span className={cn('text-xs uppercase tracking-[0.35em]', isActive ? 'text-white/70' : 'text-[#5170ff]')}>{step.caption}</span>
                    <h3 className={cn('mt-2 text-lg font-semibold', isActive ? 'text-white' : 'text-slate-900')}>{step.title}</h3>
                  </div>
                  <p className={cn('text-sm leading-relaxed', isActive ? 'text-white/90' : 'text-slate-500')}>{step.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[40px] border border-white/60 bg-white/95 shadow-[0_28px_70px_rgba(81,112,255,0.28)]">
            <div className="relative aspect-[16/9] w-full">
              <img src={activeStep.image} alt={activeStep.title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/30 via-transparent to-transparent" />
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-white/90 px-6 py-5 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{activeStep.caption}</p>
                  <h4 className="mt-1 text-lg font-semibold text-slate-900">{activeStep.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-semibold text-[#5170ff]">{activeStep.metric}</span>
                  <p className="text-xs text-slate-500 tracking-wide">{activeStep.metricLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

