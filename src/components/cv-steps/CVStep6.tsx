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
                <p className="text-sm text-gray-500">{formData.ort}</p>
              </div>
              
              <Badge variant="secondary" className="mt-2">
                Layout: {getLayoutName()}
              </Badge>
            </div>

            <Separator className="my-6" />

            {/* Contact Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Kontaktdaten</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Adresse:</strong> {formData.strasse} {formData.hausnummer}, {formData.plz} {formData.ort}
                </div>
                {formData.telefon && (
                  <div>
                    <strong>Telefon:</strong> {formData.telefon}
                  </div>
                )}
                {formData.email && (
                  <div>
                    <strong>E-Mail:</strong> {formData.email}
                  </div>
                )}
                <div>
                  <strong>Geburtsdatum:</strong> {formData.geburtsdatum?.toLocaleDateString('de-DE') || 'Nicht angegeben'}
                </div>
              </div>
            </div>

            {/* About Me Section */}
            {formData.ueberMich && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Über mich</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {formData.ueberMich}
                </p>
              </div>
            )}

            {/* Education */}
            {formData.schulbildung && formData.schulbildung.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Schulbildung</h2>
                 <div className="space-y-4">
                   {formData.schulbildung.map((schule, index) => (
                     <div key={index} className="border-l-2 border-gray-200 pl-4">
                       <div className="flex justify-between items-start mb-1">
                         <strong className="text-gray-900">{schule.name}</strong>
                         <span className="text-sm text-gray-500">
                           {schule.zeitraum_von} - {schule.zeitraum_bis}
                         </span>
                       </div>
                       <p className="text-gray-600 text-sm">{schule.schulform}</p>
                       {schule.ort && (
                         <p className="text-gray-500 text-xs mt-1">{schule.ort}</p>
                       )}
                       {schule.beschreibung && (
                         <p className="text-gray-700 text-sm mt-2">{schule.beschreibung}</p>
                       )}
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* Work Experience */}
            {formData.berufserfahrung && formData.berufserfahrung.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Berufserfahrung</h2>
                 <div className="space-y-4">
                   {formData.berufserfahrung.map((arbeit, index) => (
                     <div key={index} className="border-l-2 border-gray-200 pl-4">
                       <div className="flex justify-between items-start mb-1">
                         <strong className="text-gray-900">{arbeit.titel}</strong>
                         <span className="text-sm text-gray-500">
                           {arbeit.zeitraum_von} - {arbeit.zeitraum_bis}
                         </span>
                       </div>
                       <p className="text-gray-600 text-sm">{arbeit.unternehmen}</p>
                       {arbeit.ort && (
                         <p className="text-gray-500 text-xs mt-1">{arbeit.ort}</p>
                       )}
                       {arbeit.beschreibung && (
                         <p className="text-gray-700 text-sm mt-2">{arbeit.beschreibung}</p>
                       )}
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