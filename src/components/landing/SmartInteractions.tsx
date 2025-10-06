import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type InteractionCard = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
  cta: string;
};

const CARDS: InteractionCard[] = [
  {
    title: 'Lebenslauf → Profil',
    subtitle: 'Dein Startpunkt',
    description:
      'Erstelle in wenigen Minuten einen Lebenslauf. Daraus entsteht automatisch dein digitales Profil – perfekt zum Bewerben und Teilen.',
    image: '/assets/feature-1.png',
    link: '/cv-generator',
    cta: 'Jetzt starten'
  },
  {
    title: 'Community Spaces',
    subtitle: 'Echter Austausch',
    description:
      'Bleib mit Kolleg:innen, Teams oder deiner Klasse verbunden. Teile Wissen, plane Schichten und starte Lernrunden – ohne Plattform-Stress.',
    image: '/assets/feature-2.png',
    link: '/community',
    cta: 'Community ansehen'
  },
  {
    title: 'Jobs, wenn es passt',
    subtitle: 'Direkt aus dem Profil',
    description:
      'Wenn du offen für Neues bist, findest du passende Unternehmen mit echten Einblicken. Mit deinem Profil bewirbst du dich mit einem Klick.',
    image: '/assets/feature-3.png',
    link: '/jobs',
    cta: 'Jobs entdecken'
  },
  {
    title: 'Digitale Vernetzung',
    subtitle: 'Immer verbunden',
    description:
      'Vernetze dich mit Gleichgesinnten, baue dein berufliches Netzwerk aus und bleibe mit allen wichtigen Kontakten in Verbindung.',
    image: '/assets/feature-2.png',
    link: '/community',
    cta: 'Mehr erfahren'
  }
];

export default function SmartInteractions() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeCard = CARDS[activeIndex];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
          Getting Started with BeVisiblle
        </h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          Starte deine Reise mit BeVisiblle – einfache Anmeldung, benutzerfreundliche Oberfläche und nahtlose Navigation erwarten dich!
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,auto] items-center">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map((card, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={card.title}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  'relative rounded-3xl px-6 py-6 text-left transition-all duration-300',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_18px_40px_rgba(81,112,255,0.30)]'
                    : 'bg-card text-card-foreground hover:bg-card/80 shadow-sm'
                )}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-all',
                      isActive
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn('text-lg font-semibold', isActive ? 'text-primary-foreground' : 'text-foreground')}>
                      {card.title}
                    </h3>
                    <p className={cn('mt-2 text-sm leading-relaxed', isActive ? 'text-primary-foreground/90' : 'text-muted-foreground')}>
                      {card.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Phone Mockup */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[300px]">
            <img 
              src={activeCard.image} 
              alt={activeCard.title} 
              className="w-full h-auto object-contain rounded-[32px] shadow-[0_24px_50px_rgba(81,112,255,0.20)]" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
