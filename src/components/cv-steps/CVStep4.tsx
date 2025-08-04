import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CVStep4 = () => {
  const { formData, updateFormData } = useCVForm();

  const layouts = [
    {
      id: 1,
      name: 'Klassisch',
      description: 'Traditionelles Design, seriös und übersichtlich',
      preview: '📄',
      color: 'bg-slate-100'
    },
    {
      id: 2,
      name: 'Modern',
      description: 'Frisches Design mit Akzentfarben',
      preview: '🎨',
      color: 'bg-blue-100'
    },
    {
      id: 3,
      name: 'Kreativ',
      description: 'Auffällig und individuell, perfekt für kreative Berufe',
      preview: '✨',
      color: 'bg-purple-100'
    },
    {
      id: 4,
      name: 'Technisch',
      description: 'Clean und strukturiert, ideal für IT-Berufe',
      preview: '⚙️',
      color: 'bg-green-100'
    },
    {
      id: 5,
      name: 'Handwerk',
      description: 'Robust und praktisch, perfekt für handwerkliche Berufe',
      preview: '🔧',
      color: 'bg-orange-100'
    }
  ];

  const getRecommendedLayout = () => {
    switch (formData.branche) {
      case 'handwerk': return 5;
      case 'it': return 4;
      case 'gesundheit': return 1;
      default: return 2;
    }
  };

  const recommendedLayoutId = getRecommendedLayout();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Wähle dein CV-Layout</h2>
        <p className="text-muted-foreground mb-6">
          Welcher Stil gefällt dir am besten? Du kannst ihn später noch anpassen.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {layouts.map((layout) => (
          <Card
            key={layout.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-md relative ${
              formData.layout === layout.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-accent/50'
            }`}
            onClick={() => updateFormData({ layout: layout.id })}
          >
            {layout.id === recommendedLayoutId && (
              <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                Empfohlen
              </Badge>
            )}
            
            <div className="text-center">
              {/* Preview Mockup */}
              <div className={`w-full h-32 rounded-lg ${layout.color} flex items-center justify-center mb-4`}>
                <div className="text-4xl">{layout.preview}</div>
              </div>
              
              <h3 className="font-semibold mb-2">{layout.name}</h3>
              <p className="text-sm text-muted-foreground">{layout.description}</p>
              
              {layout.id === recommendedLayoutId && (
                <p className="text-xs text-primary mt-2 font-medium">
                  🎯 Passt perfekt zu {formData.branche === 'handwerk' ? 'Handwerk' : 
                                       formData.branche === 'it' ? 'IT' : 'Gesundheit'}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {formData.layout && (
        <div className="p-4 bg-primary/5 rounded-lg border">
          <p className="text-sm text-foreground">
            ✅ Super! Du hast das <strong>{layouts.find(l => l.id === formData.layout)?.name}</strong>-Layout gewählt.
          </p>
        </div>
      )}

      <div className="p-4 bg-accent/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tipp:</strong> Das empfohlene Layout wurde speziell für deine Branche ausgewählt und 
          macht bei Arbeitgebern einen besonders guten Eindruck.
        </p>
      </div>
    </div>
  );
};

export default CVStep4;