import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, MapPin, Calendar } from 'lucide-react';

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
    switch (formData.layout) {
      case 1: return 'Klassisch';
      case 2: return 'Modern';
      case 3: return 'Kreativ';
      case 4: return 'Minimalistisch';
      case 5: return 'Professionell';
      default: return 'Standard';
    }
  };

  const handleBackToLayout = () => {
    setCurrentStep(5);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('de-DE').format(new Date(date));
  };

  const getSprachNiveauBars = (niveau: string) => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Muttersprache'];
    const currentLevel = niveau === 'Muttersprache' ? 6 : levels.indexOf(niveau);
    const bars = [];
    
    for (let i = 0; i < 6; i++) {
      bars.push(
        <div
          key={i}
          className={`h-2 w-4 rounded-sm ${
            i <= currentLevel ? 'bg-primary' : 'bg-muted'
          }`}
        />
      );
    }
    return bars;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CV-Vorschau</CardTitle>
          <CardDescription>
            Hier siehst du eine Vorschau deines Lebenslaufs im {getLayoutName()}-Layout.
          </CardDescription>
          <Button
            variant="outline"
            onClick={handleBackToLayout}
            className="w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Layout-Auswahl
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Professional CV Layout */}
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-lg">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-8">
              <div className="flex items-center gap-6">
                {formData.profilbild && (
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                    <img
                      src={typeof formData.profilbild === 'string' ? formData.profilbild : URL.createObjectURL(formData.profilbild)}
                      alt="Profilbild"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {formData.vorname} {formData.nachname}
                  </h1>
                  <div className="text-lg opacity-90 mb-3">
                    {getStatusTitle()} - {getBrancheTitle()}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {formData.telefon && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {formData.telefon}
                      </div>
                    )}
                    {formData.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {formData.email}
                      </div>
                    )}
                    {(formData.strasse && formData.ort) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {formData.strasse} {formData.hausnummer}, {formData.plz} {formData.ort}
                      </div>
                    )}
                    {formData.geburtsdatum && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(formData.geburtsdatum)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-3 gap-8 p-8">
              {/* Left Column */}
              <div className="md:col-span-1 space-y-6">
                {/* Languages */}
                {formData.sprachen && formData.sprachen.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b border-primary/20 pb-1">
                      Sprachen
                    </h3>
                    <div className="space-y-3">
                      {formData.sprachen.map((sprache, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{sprache.sprache}</span>
                            <span className="text-sm text-muted-foreground">{sprache.niveau}</span>
                          </div>
                          <div className="flex gap-1">
                            {getSprachNiveauBars(sprache.niveau)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills (only for azubi/ausgelernt) */}
                {(formData.status === 'azubi' || formData.status === 'ausgelernt') && formData.faehigkeiten && formData.faehigkeiten.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b border-primary/20 pb-1">
                      Fähigkeiten
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.faehigkeiten.map((faehigkeit, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {faehigkeit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="md:col-span-2 space-y-6">
                {/* About Me */}
                {formData.ueberMich && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b border-primary/20 pb-1">
                      Über mich
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {formData.ueberMich}
                    </p>
                  </div>
                )}

                {/* Education */}
                {formData.schulbildung && formData.schulbildung.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b border-primary/20 pb-1">
                      Schulbildung
                    </h3>
                    <div className="space-y-4">
                      {formData.schulbildung.map((schule, index) => (
                        <div key={index} className="border-l-2 border-primary/30 pl-4">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold">{schule.schulform}</h4>
                            <span className="text-sm text-muted-foreground">
                              {schule.zeitraum_von} - {schule.zeitraum_bis}
                            </span>
                          </div>
                          <div className="text-primary font-medium">{schule.name}</div>
                          <div className="text-sm text-muted-foreground">{schule.ort}</div>
                          {schule.beschreibung && (
                            <p className="text-sm text-gray-600 mt-2">{schule.beschreibung}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {formData.berufserfahrung && formData.berufserfahrung.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b border-primary/20 pb-1">
                      Praktische Erfahrung
                    </h3>
                    <div className="space-y-4">
                      {formData.berufserfahrung.map((arbeit, index) => (
                        <div key={index} className="border-l-2 border-primary/30 pl-4">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold">{arbeit.titel}</h4>
                            <span className="text-sm text-muted-foreground">
                              {arbeit.zeitraum_von} - {arbeit.zeitraum_bis}
                            </span>
                          </div>
                          <div className="text-primary font-medium">{arbeit.unternehmen}</div>
                          <div className="text-sm text-muted-foreground">{arbeit.ort}</div>
                          {arbeit.beschreibung && (
                            <p className="text-sm text-gray-600 mt-2">{arbeit.beschreibung}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Hinweis:</strong> Dies ist eine vereinfachte Vorschau. Das finale Layout wird 
              optimiert und professionell formatiert.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CVStep6;