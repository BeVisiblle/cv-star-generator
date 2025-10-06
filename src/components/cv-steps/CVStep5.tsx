import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CVStep5 = () => {
  const { formData, updateFormData } = useCVForm();

  const layouts = [
    {
      id: 1,
      name: 'Modern',
      description: 'Klares Design mit Farbakzenten für IT und moderne Branchen',
      preview: '📱',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 2,
      name: 'Klassisch',
      description: 'Traditionelles Layout, perfekt für Handwerk und etablierte Unternehmen',
      preview: '📄',
      color: 'bg-gray-50 border-gray-200'
    },
    {
      id: 3,
      name: 'Kreativ',
      description: 'Auffälliges Design für kreative Bereiche und junge Unternehmen',
      preview: '🎨',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 4,
      name: 'Minimalistisch',
      description: 'Reduziertes Design mit Fokus auf Inhalt',
      preview: '⚪',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 5,
      name: 'Professionell',
      description: 'Seriöses Layout für Gesundheitswesen und Behörden',
      preview: '🏢',
      color: 'bg-slate-50 border-slate-200'
    },
    {
      id: 6,
      name: 'LiveCareer',
      description: 'A4-optimiertes, kompaktes Layout – ideal für PDF',
      preview: '🧩',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 7,
      name: 'Klassisch V2',
      description: 'Elegantes 2-Spalten Layout mit Sidebar – Premium-Design für alle Branchen',
      preview: '📋',
      color: 'bg-amber-50 border-amber-200'
    },
    {
      id: 8,
      name: 'Olivia',
      description: 'Elegantes Sidebar-Layout mit Beige-Tönen – Perfekt für kreative Berufe',
      preview: '🎨',
      color: 'bg-amber-50 border-amber-300'
    },
    {
      id: 9,
      name: 'Johanna',
      description: 'Modernes Layout mit blauer Sidebar – Ideal für IT & Technik',
      preview: '💼',
      color: 'bg-blue-50 border-blue-300'
    },
    {
      id: 10,
      name: 'Katharina',
      description: 'Klassisches Timeline-Layout – Übersichtlich für alle Branchen',
      preview: '📅',
      color: 'bg-gray-50 border-gray-300'
    }
  ];

  const getRecommendedLayout = () => {
    switch (formData.branche) {
      case 'handwerk': return 2; // Klassisch
      case 'it': return 1; // Modern
      case 'gesundheit': return 5; // Professionell
      case 'buero': return 7; // Klassisch V2 - NEU!
      case 'verkauf': return 3; // Kreativ
      case 'gastronomie': return 3; // Kreativ
      case 'bau': return 2; // Klassisch
      default: return 1;
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
