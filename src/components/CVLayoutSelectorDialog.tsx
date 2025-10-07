import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BerlinLayout from '@/components/cv-layouts/BerlinLayout';
import MuenchenLayout from '@/components/cv-layouts/MuenchenLayout';
import HamburgLayout from '@/components/cv-layouts/HamburgLayout';
import KoelnLayout from '@/components/cv-layouts/KoelnLayout';
import FrankfurtLayout from '@/components/cv-layouts/FrankfurtLayout';
import DuesseldorfLayout from '@/components/cv-layouts/DuesseldorfLayout';

interface CVLayoutSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLayout: number;
  profile: any;
  onLayoutUpdated: () => void;
}

export const CVLayoutSelectorDialog: React.FC<CVLayoutSelectorDialogProps> = ({
  open,
  onOpenChange,
  currentLayout,
  profile,
  onLayoutUpdated
}) => {
  const [selectedLayout, setSelectedLayout] = useState(currentLayout);
  const [isUpdating, setIsUpdating] = useState(false);

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
    switch (profile?.branche) {
      case 'handwerk': return 3;
      case 'it': return 2;
      case 'gesundheit': return 6;
      case 'buero': return 5;
      case 'verkauf': return 1;
      case 'gastronomie': return 4;
      case 'bau': return 3;
      default: return 2;
    }
  };

  const recommendedLayoutId = getRecommendedLayout();

  const cvData = {
    vorname: profile?.vorname,
    nachname: profile?.nachname,
    telefon: profile?.telefon,
    email: profile?.email,
    strasse: profile?.strasse,
    hausnummer: profile?.hausnummer,
    plz: profile?.plz,
    ort: profile?.ort,
    geburtsdatum: profile?.geburtsdatum ? new Date(profile.geburtsdatum) : undefined,
    profilbild: profile?.avatar_url,
    status: profile?.status,
    branche: profile?.branche,
    ueberMich: profile?.uebermich || profile?.bio,
    schulbildung: profile?.schulbildung || [],
    berufserfahrung: profile?.berufserfahrung || [],
    sprachen: profile?.sprachen || [],
    faehigkeiten: profile?.faehigkeiten || []
  };

  const renderPreview = () => {
    const commonProps = { data: cvData, className: "scale-[0.3] origin-top-left w-[333%]" };

    switch (selectedLayout) {
      case 1:
        return <BerlinLayout {...commonProps} />;
      case 2:
        return <MuenchenLayout {...commonProps} />;
      case 3:
        return <HamburgLayout {...commonProps} />;
      case 4:
        return <KoelnLayout {...commonProps} />;
      case 5:
        return <FrankfurtLayout {...commonProps} />;
      case 6:
        return <DuesseldorfLayout {...commonProps} />;
      default:
        return <BerlinLayout {...commonProps} />;
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ layout: selectedLayout })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Layout erfolgreich aktualisiert');
      onLayoutUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Layout update error:', error);
      toast.error('Fehler beim Aktualisieren des Layouts');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CV-Layout auswählen</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Layout Options */}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {layouts.map((layout) => (
              <Card
                key={layout.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedLayout === layout.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                } ${layout.color}`}
                onClick={() => setSelectedLayout(layout.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{layout.preview}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{layout.name}</h3>
                        {layout.id === recommendedLayoutId && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Empfohlen
                          </span>
                        )}
                        {selectedLayout === layout.id && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Ausgewählt
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{layout.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right: Preview */}
          <div className="bg-muted/30 rounded-lg p-4 overflow-hidden">
            <h3 className="text-sm font-semibold mb-3">Vorschau</h3>
            <div className="bg-white rounded shadow-sm overflow-hidden h-[600px] relative">
              <div className="absolute inset-0 overflow-hidden">
                {renderPreview()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Aktualisiere...
              </>
            ) : (
              'Aktualisieren'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
