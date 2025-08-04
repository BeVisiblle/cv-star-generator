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

  const getBranchenFarben = () => {
    switch (formData.branche) {
      case 'handwerk':
        return {
          primary: 'from-orange-600 to-red-600',
          text: 'text-orange-600',
          border: 'border-orange-600/30',
          bg: 'bg-orange-600/10'
        };
      case 'it':
        return {
          primary: 'from-blue-600 to-indigo-600',
          text: 'text-blue-600',
          border: 'border-blue-600/30',
          bg: 'bg-blue-600/10'
        };
      case 'gesundheit':
        return {
          primary: 'from-green-600 to-emerald-600',
          text: 'text-green-600',
          border: 'border-green-600/30',
          bg: 'bg-green-600/10'
        };
      default:
        return {
          primary: 'from-gray-600 to-gray-700',
          text: 'text-gray-600',
          border: 'border-gray-600/30',
          bg: 'bg-gray-600/10'
        };
    }
  };

  const getSprachNiveauBars = (niveau: string) => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Muttersprache'];
    const currentLevel = niveau === 'Muttersprache' ? 6 : levels.indexOf(niveau);
    const bars = [];
    const colors = getBranchenFarben();
    
    for (let i = 0; i < 6; i++) {
      bars.push(
        <div
          key={i}
          className={`h-2 w-4 rounded-sm ${
            i <= currentLevel ? colors.bg.replace('bg-', 'bg-').replace('/10', '') : 'bg-muted'
          }`}
        />
      );
    }
    return bars;
  };

  const getLayoutStyles = () => {
    const colors = getBranchenFarben();
    
    switch (formData.layout) {
      case 1: // Klassisch
        return {
          container: 'max-w-3xl mx-auto bg-white border border-gray-300 shadow-md',
          header: `bg-gradient-to-r ${colors.primary} text-white p-6`,
          grid: 'block space-y-6 p-6',
          sectionTitle: `text-lg font-serif ${colors.text} mb-3 border-b ${colors.border} pb-1`,
          accent: colors.bg
        };
      case 2: // Modern
        return {
          container: 'max-w-4xl mx-auto bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden',
          header: `bg-gradient-to-r ${colors.primary} text-white p-8`,
          grid: 'grid md:grid-cols-3 gap-8 p-8',
          sectionTitle: `text-lg font-semibold ${colors.text} mb-3 border-b ${colors.border} pb-1`,
          accent: colors.bg
        };
      case 3: // Kreativ
        return {
          container: 'max-w-4xl mx-auto bg-white border-l-4 border-r-4 border-t border-b border-gray-200 shadow-xl',
          header: `bg-gradient-to-45deg ${colors.primary} text-white p-8 transform -skew-y-1`,
          grid: 'grid md:grid-cols-5 gap-6 p-8',
          sectionTitle: `text-xl font-bold ${colors.text} mb-4 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:${colors.bg.replace('bg-', 'bg-').replace('/10', '')}`,
          accent: colors.bg
        };
      case 4: // Minimalistisch
        return {
          container: 'max-w-3xl mx-auto bg-white border-none shadow-none',
          header: `bg-white text-gray-900 p-8 border-b-2 ${colors.border}`,
          grid: 'block space-y-8 p-8',
          sectionTitle: `text-base font-medium ${colors.text} mb-2 uppercase tracking-wide`,
          accent: 'bg-transparent'
        };
      case 5: // Professionell
        return {
          container: 'max-w-4xl mx-auto bg-white border border-gray-300 shadow-lg',
          header: `bg-gray-50 text-gray-900 p-8 border-b-2 ${colors.border}`,
          grid: 'grid md:grid-cols-4 gap-8 p-8',
          sectionTitle: `text-lg font-semibold ${colors.text} mb-3 pb-2 border-b ${colors.border}`,
          accent: colors.bg
        };
      default:
        return {
          container: 'max-w-4xl mx-auto bg-white border border-gray-200 shadow-lg',
          header: `bg-gradient-to-r ${colors.primary} text-white p-8`,
          grid: 'grid md:grid-cols-3 gap-8 p-8',
          sectionTitle: `text-lg font-semibold ${colors.text} mb-3 border-b ${colors.border} pb-1`,
          accent: colors.bg
        };
    }
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
          {(() => {
            const styles = getLayoutStyles();
            const colors = getBranchenFarben();
            
            return (
              <div className={styles.container} data-cv-preview>
                {/* Header Section */}
                <div className={styles.header}>
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
                      <h1 className={`text-3xl font-bold mb-2 ${formData.layout === 4 || formData.layout === 5 ? 'text-gray-900' : 'text-white'}`}>
                        {formData.vorname} {formData.nachname}
                      </h1>
                      <div className={`text-lg mb-3 ${formData.layout === 4 || formData.layout === 5 ? 'text-gray-700' : 'opacity-90'}`}>
                        {getStatusTitle()} - {getBrancheTitle()}
                      </div>
                      <div className={`flex flex-wrap gap-4 text-sm ${formData.layout === 4 || formData.layout === 5 ? 'text-gray-600' : ''}`}>
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
                <div className={styles.grid}>
                  {/* Left Column for Grid Layouts */}
                  {(formData.layout === 2 || formData.layout === 3 || formData.layout === 5) && (
                    <div className={`${formData.layout === 3 ? 'md:col-span-2' : formData.layout === 5 ? 'md:col-span-1' : 'md:col-span-1'} space-y-6`}>
                      {/* Languages */}
                      {formData.sprachen && formData.sprachen.length > 0 && (
                        <div>
                          <h3 className={styles.sectionTitle}>
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
                          <h3 className={styles.sectionTitle}>
                            Fähigkeiten
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {formData.faehigkeiten.map((faehigkeit, index) => (
                              <span
                                key={index}
                                className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm`}
                              >
                                {faehigkeit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Right Column or Full Width for Block Layouts */}
                  <div className={`${formData.layout === 2 ? 'md:col-span-2' : formData.layout === 3 ? 'md:col-span-3' : formData.layout === 5 ? 'md:col-span-3' : ''} space-y-6`}>
                    {/* Languages for Block Layouts */}
                    {(formData.layout === 1 || formData.layout === 4) && formData.sprachen && formData.sprachen.length > 0 && (
                      <div>
                        <h3 className={styles.sectionTitle}>
                          Sprachen
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
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

                    {/* Skills for Block Layouts */}
                    {(formData.layout === 1 || formData.layout === 4) && (formData.status === 'azubi' || formData.status === 'ausgelernt') && formData.faehigkeiten && formData.faehigkeiten.length > 0 && (
                      <div>
                        <h3 className={styles.sectionTitle}>
                          Fähigkeiten
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.faehigkeiten.map((faehigkeit, index) => (
                            <span
                              key={index}
                              className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm`}
                            >
                              {faehigkeit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* About Me */}
                    {formData.ueberMich && (
                      <div>
                        <h3 className={styles.sectionTitle}>
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
                        <h3 className={styles.sectionTitle}>
                          Schulbildung
                        </h3>
                        <div className="space-y-4">
                          {formData.schulbildung.map((schule, index) => (
                            <div key={index} className={`border-l-2 ${colors.border} pl-4`}>
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold">{schule.schulform}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {schule.zeitraum_von} - {schule.zeitraum_bis}
                                </span>
                              </div>
                              <div className={`${colors.text} font-medium`}>{schule.name}</div>
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
                        <h3 className={styles.sectionTitle}>
                          Praktische Erfahrung
                        </h3>
                        <div className="space-y-4">
                          {formData.berufserfahrung.map((arbeit, index) => (
                            <div key={index} className={`border-l-2 ${colors.border} pl-4`}>
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold">{arbeit.titel}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {arbeit.zeitraum_von} - {arbeit.zeitraum_bis}
                                </span>
                              </div>
                              <div className={`${colors.text} font-medium`}>{arbeit.unternehmen}</div>
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
            );
          })()}

          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Hinweis:</strong> Layout "{getLayoutName()}" mit {getBrancheTitle()}-Farbschema. 
              Das finale Layout wird optimiert und professionell formatiert.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CVStep6;