import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, ContactInfo, ProfileImage, LanguageBars, SkillTags } from './CVLayoutBase';

const ModernLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  return (
    <div className={`max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden ${className}`} data-cv-preview>
      {/* Header Section */}
      <div 
        className="p-8 text-white relative"
        style={{
          background: `linear-gradient(135deg, hsl(${colors.primary}), hsl(${colors.accent}))`
        }}
      >
        <div className="flex items-center gap-6">
          <ProfileImage profilbild={data.profilbild} avatar_url={data.avatar_url} size="lg" className="border-4 border-white/20" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-white">
              {data.vorname} {data.nachname}
            </h1>
            <div className="text-xl mb-4 text-white/90">
              {getStatusTitle(data.status)} - {getBrancheTitle(data.branche)}
            </div>
            <ContactInfo data={data} isLight />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-3 gap-8 p-8">
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Languages */}
          {data.sprachen && data.sprachen.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 text-[hsl(${colors.text})] border-b-2 border-[hsl(${colors.primary})] pb-2`}>
                Sprachen
              </h3>
              <div className="space-y-3">
                {data.sprachen.map((sprache, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{sprache.sprache}</span>
                      <span className="text-sm text-muted-foreground">{sprache.niveau}</span>
                    </div>
                    <LanguageBars niveau={sprache.niveau} branche={data.branche} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {(data.status === 'azubi' || data.status === 'ausgelernt') && data.faehigkeiten && data.faehigkeiten.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 text-[hsl(${colors.text})] border-b-2 border-[hsl(${colors.primary})] pb-2`}>
                Fähigkeiten
              </h3>
              <SkillTags skills={data.faehigkeiten} branche={data.branche} />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* About Me */}
          {data.ueberMich && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 text-[hsl(${colors.text})] border-b-2 border-[hsl(${colors.primary})] pb-2`}>
                Über mich
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {data.ueberMich}
              </p>
            </div>
          )}

          {/* Education */}
          {data.schulbildung && data.schulbildung.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 text-[hsl(${colors.text})] border-b-2 border-[hsl(${colors.primary})] pb-2`}>
                Schulbildung
              </h3>
              <div className="space-y-4">
                {data.schulbildung
                  .sort((a, b) => {
                    const aEnd = parseInt(a.zeitraum_bis) || parseInt(a.zeitraum_von) || 0;
                    const bEnd = parseInt(b.zeitraum_bis) || parseInt(b.zeitraum_von) || 0;
                    return bEnd - aEnd;
                  })
                  .map((schule, index) => (
                  <div key={index} className={`border-l-4 border-[hsl(${colors.primary})] pl-4 bg-[hsl(${colors.secondary})] p-4 rounded-r-lg break-inside-avoid`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{schule.schulform}</h4>
                      <span className="text-sm text-muted-foreground bg-white px-2 py-1 rounded whitespace-nowrap">
                        {schule.zeitraum_von} - {schule.zeitraum_bis || 'Heute'}
                      </span>
                    </div>
                    <div className={`text-[hsl(${colors.text})] font-medium mb-1`}>{schule.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">{schule.ort}</div>
                    {schule.beschreibung && (
                      <p className="text-sm text-gray-600">{schule.beschreibung}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {data.berufserfahrung && data.berufserfahrung.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 text-[hsl(${colors.text})] border-b-2 border-[hsl(${colors.primary})] pb-2`}>
                Praktische Erfahrung
              </h3>
              <div className="space-y-4">
                {data.berufserfahrung
                  .sort((a, b) => {
                    const aEnd = a.zeitraum_bis ? new Date(a.zeitraum_bis) : new Date(a.zeitraum_von);
                    const bEnd = b.zeitraum_bis ? new Date(b.zeitraum_bis) : new Date(b.zeitraum_von);
                    return bEnd.getTime() - aEnd.getTime();
                  })
                  .map((arbeit, index) => (
                  <div key={index} className={`border-l-4 border-[hsl(${colors.primary})] pl-4 bg-[hsl(${colors.secondary})] p-4 rounded-r-lg break-inside-avoid`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{arbeit.titel}</h4>
                      <span className="text-sm text-muted-foreground bg-white px-2 py-1 rounded whitespace-nowrap">
                        {arbeit.zeitraum_von ? new Date(arbeit.zeitraum_von).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }) : ''} - {arbeit.zeitraum_bis ? new Date(arbeit.zeitraum_bis).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }) : 'Heute'}
                      </span>
                    </div>
                    <div className={`text-[hsl(${colors.text})] font-medium mb-1`}>{arbeit.unternehmen}</div>
                    <div className="text-sm text-muted-foreground mb-2">{arbeit.ort}</div>
                    {arbeit.beschreibung && (
                      <p className="text-sm text-gray-600">{arbeit.beschreibung}</p>
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
};

export default ModernLayout;