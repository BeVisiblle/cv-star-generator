import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const CVStep6 = () => {
  const { formData, setCurrentStep } = useCVForm();

  const getBrancheTitle = () => {
    switch (formData.branche) {
      case 'handwerk': return 'Handwerk';
      case 'it': return 'IT';
      case 'gesundheit': return 'Gesundheit';
      default: return '';
    }
  };

  const getStatusTitle = () => {
    switch (formData.status) {
      case 'schueler': return 'Schüler/in';
      case 'azubi': return 'Auszubildende/r';
      case 'ausgelernt': return 'Ausgelernte/r';
      default: return '';
    }
  };

  const getLayoutName = () => {
    const layouts = ['Modern', 'Klassisch', 'Kreativ', 'Minimalistisch', 'Professionell'];
    return layouts[formData.layout! - 1] || 'Unbekannt';
  };

  const handleBackToLayout = () => {
    setCurrentStep(5);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Live-Vorschau Ihres Lebenslaufs</CardTitle>
          <CardDescription>
            So wird Ihr Lebenslauf aussehen. Prüfen Sie alle Angaben und gehen Sie zurück, 
            wenn Sie Änderungen vornehmen möchten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleBackToLayout}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Layout-Auswahl
          </Button>

          {/* CV Preview Layout */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
            {/* Header with Profile Picture */}
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {formData.profilbild ? (
                  <img 
                    src={typeof formData.profilbild === 'string' ? formData.profilbild : URL.createObjectURL(formData.profilbild)}
                    alt="Profilbild" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Foto</span>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {formData.vorname} {formData.nachname}
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  {getBrancheTitle()} • {getStatusTitle()}
                </p>
                <p className="text-sm text-gray-500">{formData.wohnort}</p>
              </div>
              
              <Badge variant="secondary" className="mt-2">
                Layout: {getLayoutName()}
              </Badge>
            </div>

            <Separator className="my-6" />

            {/* Personal Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Persönliche Daten</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Geburtsdatum:</strong> {formData.geburtsdatum?.toLocaleDateString('de-DE') || 'Nicht angegeben'}
                </div>
                <div>
                  <strong>Wohnort:</strong> {formData.wohnort || 'Nicht angegeben'}
                </div>
              </div>
            </div>

            {/* Education */}
            {formData.schulbildung && formData.schulbildung.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Schulbildung</h2>
                <div className="space-y-2">
                  {formData.schulbildung.map((schule, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <strong>{schule.schule}</strong>
                        <p className="text-gray-600">{schule.abschluss}</p>
                      </div>
                      <div className="text-right text-gray-500">
                        {schule.zeitraum_von} - {schule.zeitraum_bis}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {formData.berufserfahrung && formData.berufserfahrung.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Berufserfahrung</h2>
                <div className="space-y-2">
                  {formData.berufserfahrung.map((arbeit, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <strong>{arbeit.firma}</strong>
                        <p className="text-gray-600">{arbeit.taetigkeiten}</p>
                      </div>
                      <div className="text-right text-gray-500">
                        {arbeit.zeitraum_von} - {arbeit.zeitraum_bis}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Motivation */}
            {formData.motivation && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Motivation</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {formData.motivation}
                </p>
              </div>
            )}

            {formData.kenntnisse && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Kenntnisse & Fähigkeiten</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {formData.kenntnisse}
                </p>
              </div>
            )}

            {formData.praktische_erfahrung && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Praktische Erfahrung</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {formData.praktische_erfahrung}
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Dies ist eine vereinfachte Vorschau. Das finale PDF wird noch professioneller formatiert.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CVStep6;