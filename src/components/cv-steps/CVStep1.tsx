import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CVStep1 = () => {
  const { formData, updateFormData } = useCVForm();

  const branches = [
    { key: 'handwerk', emoji: '👷', title: 'Handwerk', desc: 'Bau, Elektro, Sanitär, KFZ und mehr' },
    { key: 'it', emoji: '💻', title: 'IT', desc: 'Programmierung, Support, Systemadmin' },
    { key: 'gesundheit', emoji: '🩺', title: 'Gesundheit', desc: 'Pflege, Therapie, medizinische Assistenz' },
    { key: 'buero', emoji: '📊', title: 'Büro & Verwaltung', desc: 'Organisation, Kommunikation, Administration' },
    { key: 'verkauf', emoji: '🛍️', title: 'Verkauf & Handel', desc: 'Beratung, Kundenservice, Einzelhandel' },
    { key: 'gastronomie', emoji: '🍽️', title: 'Gastronomie', desc: 'Service, Küche, Hotellerie' },
    { key: 'bau', emoji: '🏗️', title: 'Bau & Architektur', desc: 'Konstruktion, Planung, Ausführung' }
  ] as const;

  const statuses = [
    { key: 'schueler', emoji: '🧑‍🎓', title: 'Schüler:in', desc: 'Ich gehe noch zur Schule' },
    { key: 'azubi', emoji: '🧑‍🔧', title: 'Azubi', desc: 'Ich mache eine Ausbildung' },
    { key: 'ausgelernt', emoji: '✅', title: 'Ausgelernt', desc: 'Ich habe eine Ausbildung abgeschlossen' }
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Wähle deine Branche</h2>
        <p className="text-muted-foreground mb-6">
          In welchem Bereich möchtest du arbeiten?
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {branches.map((branch) => (
            <Card 
              key={branch.key}
              className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                formData.branche === branch.key 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => updateFormData({ branche: branch.key })}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{branch.emoji}</div>
                <h3 className="font-semibold mb-1">{branch.title}</h3>
                <p className="text-sm text-muted-foreground">{branch.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Deine aktuelle Situation</h2>
        <p className="text-muted-foreground mb-6">
          Was beschreibt dich am besten?
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          {statuses.map((status) => (
            <Card 
              key={status.key}
              className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                formData.status === status.key 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => updateFormData({ status: status.key })}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{status.emoji}</div>
                <h3 className="font-semibold mb-1">{status.title}</h3>
                <p className="text-sm text-muted-foreground">{status.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {formData.branche && formData.status && (
        <div className="p-4 bg-primary/5 rounded-lg border">
          <p className="text-sm text-foreground">
            ✅ Perfekt! Du hast <strong>{branches.find(b => b.key === formData.branche)?.title}</strong> und 
            <strong> {statuses.find(s => s.key === formData.status)?.title}</strong> gewählt.
          </p>
        </div>
      )}
    </div>
  );
};

export default CVStep1;