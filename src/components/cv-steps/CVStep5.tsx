import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CVStep5 = () => {
  const { formData, updateFormData } = useCVForm();

  const layouts = [
    {
      id: 1,
      name: 'Berlin',
      description: 'Elegantes Sidebar-Layout mit beige Tönen – Perfekt für kreative Berufe',
      preview: '🎨',
      color: 'bg-amber-50 border-amber-300'
    },
    {
      id: 2,
      name: 'München',
      description: 'Modernes Layout mit blauer Sidebar – Ideal für IT & Technik',
      preview: '💼',
      color: 'bg-blue-50 border-blue-300'
    },
    {
      id: 3,
      name: 'Hamburg',
      description: 'Klassisches Timeline-Layout – Übersichtlich für alle Branchen',
      preview: '📅',
      color: 'bg-gray-50 border-gray-300'
    },
    {
      id: 4,
      name: 'Köln',
      description: 'Modernes Urban-Layout mit dunkler Sidebar – Professionell für alle Branchen',
      preview: '🏙️',
      color: 'bg-slate-50 border-slate-300'
    },
    {
      id: 5,
      name: 'Frankfurt',
      description: 'Business-Layout mit hellem Design – Ideal für Verwaltung & Management',
      preview: '📊',
      color: 'bg-stone-50 border-stone-300'
    },
    {
      id: 6,
      name: 'Düsseldorf',
      description: 'Harvard Style ohne Foto – Akademisch für Finance & Consulting',
      preview: '🎓',
      color: 'bg-neutral-50 border-neutral-300'
    }
  ];

  const getRecommendedLayout = () => {
    switch (formData.branche) {
      case 'handwerk': return 3; // Hamburg - Klassisch Timeline
      case 'it': return 2; // München - Modern mit blauer Sidebar
      case 'gesundheit': return 6; // Düsseldorf - Harvard professionell
      case 'buero': return 5; // Frankfurt - Business clean
      case 'verkauf': return 1; // Berlin - Kreativ beige
      case 'gastronomie': return 4; // Köln - Urban freundlich
      case 'bau': return 3; // Hamburg - Klassisch strukturiert
      default: return 2;
    }
  };

  const recommendedLayoutId = getRecommendedLayout();

  const handleLayoutClick = (layoutId: number, layoutName: string) => {
    console.log('🟢 CVStep5 - Layout clicked:', layoutId, layoutName);
    console.log('🟢 CVStep5 - Before update, formData.layout:', formData.layout);
    
    updateFormData({ layout: layoutId });
    
    console.log('🟢 CVStep5 - After update called');
    
    // Check localStorage after a short delay
    setTimeout(() => {
      const savedData = localStorage.getItem('cvFormData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('🟢 CVStep5 - localStorage after update:', parsed.layout);
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Wählen Sie Ihr CV-Layout</h2>
        <p className="text-muted-foreground">
          Wählen Sie das Layout, das am besten zu Ihrer Branche und Ihrem Stil passt.
        </p>
        <p className="text-xs text-blue-600 mt-2">
          Aktuell gewählt: {formData.layout ? `Layout ${formData.layout}` : 'Keins'}
        </p>
      </div>

      <div className="grid gap-4">
        {layouts.map((layout) => (
          <Card
            key={layout.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              formData.layout === layout.id
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            } ${layout.color}`}
            onClick={() => handleLayoutClick(layout.id, layout.name)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{layout.preview}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{layout.name}</h3>
                    {layout.id === recommendedLayoutId && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Empfohlen
                      </span>
                    )}
                    {formData.layout === layout.id && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Ausgewählt
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{layout.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {formData.layout && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-800">
              ✓ Layout "{layouts.find(l => l.id === formData.layout)?.name}" ausgewählt (ID: {formData.layout})
            </p>
          </CardContent>
        </Card>
      )}

      {recommendedLayoutId && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tipp:</strong> Das Layout "{layouts.find(l => l.id === recommendedLayoutId)?.name}"
              ist besonders gut für den Bereich {formData.branche === 'handwerk' ? 'Handwerk' :
              formData.branche === 'it' ? 'IT' :
              formData.branche === 'gesundheit' ? 'Gesundheitswesen' :
              formData.branche === 'buero' ? 'Büro & Verwaltung' :
              formData.branche === 'verkauf' ? 'Verkauf & Handel' :
              formData.branche === 'gastronomie' ? 'Gastronomie' :
              formData.branche === 'bau' ? 'Bau & Architektur' : ''} geeignet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CVStep5;
