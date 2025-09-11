export interface LayoutInfo {
  id: number;
  key: string;
  name: string;
  description: string;
  targetAudience: string[];
  features: string[];
  layout: 'single' | 'two-column' | 'timeline';
  atsCompatible: boolean;
  preview: string;
}

export const CV_LAYOUTS: LayoutInfo[] = [
  {
    id: 1,
    key: 'handwerk-classic',
    name: 'Klassisch Handwerk',
    description: 'Robustes 2-Spalten-Layout (65/35) - hebt Fähigkeiten/Tools, Scheine/Zertifikate und Führerscheine hervor',
    targetAudience: ['Handwerk', 'Technik', 'Produktion'],
    features: ['Fähigkeiten & Tools', 'Scheine & Zertifikate', 'Führerscheine', 'Maschinenkenntnisse'],
    layout: 'two-column',
    atsCompatible: true,
    preview: 'Robust, strukturiert, handwerksfokussiert'
  },
  {
    id: 2,
    key: 'pflege-clear',
    name: 'Pflege Klar',
    description: '1-spaltig, maximal lesbar - Qualifikationen, Stationen, Schichtbereitschaft, Sprachen im Fokus',
    targetAudience: ['Pflege', 'Gesundheit', 'Medizin'],
    features: ['Qualifikationen', 'Stationen', 'Schichtbereitschaft', 'Sprachen'],
    layout: 'single',
    atsCompatible: true,
    preview: 'Klar, lesbar, pflegefokussiert'
  },
  {
    id: 3,
    key: 'azubi-start',
    name: 'Azubi Start',
    description: 'Kompakt & parser-sicher - Schule/Abschluss, Praktika/Projekte, Skills, Motivation',
    targetAudience: ['Azubis', 'Schüler', 'Einsteiger'],
    features: ['Schule & Abschluss', 'Praktika & Projekte', 'Skills', 'Motivation'],
    layout: 'single',
    atsCompatible: true,
    preview: 'Kompakt, einsteigerfreundlich, motivierend'
  },
  {
    id: 4,
    key: 'service-sales',
    name: 'Service & Verkauf',
    description: 'Modern, 2-Spalten - Kundenkontakt, Erfolge in Zahlen (Umsatz/NPS), Verfügbarkeit',
    targetAudience: ['Service', 'Verkauf', 'Kundenbetreuung'],
    features: ['Kundenkontakt', 'Erfolge in Zahlen', 'Verfügbarkeit', 'Soft Skills'],
    layout: 'two-column',
    atsCompatible: true,
    preview: 'Modern, erfolgsorientiert, kundenfokussiert'
  },
  {
    id: 5,
    key: 'logistik-production',
    name: 'Logistik & Produktion',
    description: 'Timeline-betont - Maschinen/Anlagen, Sicherheits-Scheine, Schichtmodelle',
    targetAudience: ['Logistik', 'Produktion', 'Lager'],
    features: ['Maschinen & Anlagen', 'Sicherheits-Scheine', 'Schichtmodelle', 'Prozesse'],
    layout: 'timeline',
    atsCompatible: true,
    preview: 'Timeline, prozessorientiert, sicherheitsfokussiert'
  },
  {
    id: 6,
    key: 'ats-compact',
    name: 'ATS Kompakt',
    description: 'Universell & schlicht - Einspaltig, minimale Deko, volle ATS-Tauglichkeit',
    targetAudience: ['Universell', 'ATS-Systeme', 'Großunternehmen'],
    features: ['ATS-optimiert', 'Universell', 'Schlicht', 'Parser-sicher'],
    layout: 'single',
    atsCompatible: true,
    preview: 'Schlicht, universell, ATS-optimiert'
  }
];

export const getLayoutById = (id: number): LayoutInfo | undefined => {
  return CV_LAYOUTS.find(layout => layout.id === id);
};

export const getLayoutByKey = (key: string): LayoutInfo | undefined => {
  return CV_LAYOUTS.find(layout => layout.key === key);
};

export const getLayoutsByAudience = (audience: string): LayoutInfo[] => {
  return CV_LAYOUTS.filter(layout => 
    layout.targetAudience.some(target => 
      target.toLowerCase().includes(audience.toLowerCase())
    )
  );
};

export const getATSSafeLayouts = (): LayoutInfo[] => {
  return CV_LAYOUTS.filter(layout => layout.atsCompatible);
};
