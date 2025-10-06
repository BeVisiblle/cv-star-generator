import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnboardingPopup } from './OnboardingPopup';

interface BrancheSelectorProps {
  onNext: (industry: string) => void;
}

const branches = [
  { key: 'handwerk', emoji: '👷', title: 'Handwerk', desc: 'Bau, Elektro, Sanitär, KFZ und mehr' },
  { key: 'it', emoji: '💻', title: 'IT', desc: 'Programmierung, Support, Systemadmin' },
  { key: 'gesundheit', emoji: '🩺', title: 'Gesundheit', desc: 'Pflege, Therapie, medizinische Assistenz' },
  { key: 'buero', emoji: '📊', title: 'Büro & Verwaltung', desc: 'Organisation, Kommunikation, Administration' },
  { key: 'verkauf', emoji: '🛍️', title: 'Verkauf & Handel', desc: 'Beratung, Kundenservice, Einzelhandel' },
  { key: 'gastronomie', emoji: '🍽️', title: 'Gastronomie', desc: 'Service, Küche, Hotellerie' },
  { key: 'bau', emoji: '🏗️', title: 'Bau & Architektur', desc: 'Konstruktion, Planung, Ausführung' }
];

export function BrancheSelector({ onNext }: BrancheSelectorProps) {
  const [selected, setSelected] = useState<string>('');

  return (
    <OnboardingPopup>
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-2">Willkommen bei Norothy! 👋</h2>
        <p className="text-muted-foreground mb-6">
          In welcher Branche ist Ihr Unternehmen tätig?
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {branches.map(branch => (
            <Card
              key={branch.key}
              className={`p-4 cursor-pointer transition-all hover:border-primary ${
                selected === branch.key ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelected(branch.key)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{branch.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{branch.title}</h3>
                  <p className="text-sm text-muted-foreground">{branch.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="w-full"
          size="lg"
        >
          Weiter
        </Button>
      </div>
    </OnboardingPopup>
  );
}
