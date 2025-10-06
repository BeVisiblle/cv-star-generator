import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, ContactInfo, ProfileImage, LanguageBars, SkillTags } from './CVLayoutBase';
import { cn } from '@/lib/utils';

const ModernLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  return (
    <div className={cn("max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden", className)} data-cv-preview>
      {/* Header Section */}
      <div 
        className="p-4 md:p-8 text-white relative cv-header-mobile"
        style={{
          background: `linear-gradient(135deg, hsl(${colors.primary}), hsl(${colors.accent}))`
        }}
      >
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <ProfileImage profilbild={data.profilbild} avatar_url={data.avatar_url} size="lg" className="rounded-lg border-4 border-white/20" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white cv-text-mobile">
              {data.vorname} {data.nachname}
            </h1>
            <div className="text-lg md:text-xl mb-3 md:mb-4 text-white/90">
              {getStatusTitle(data.status)} - {getBrancheTitle(data.branche)}
            </div>
            <ContactInfo data={data} isLight />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 p-4 md:p-8 cv-grid-mobile">
        {/* Left Sidebar */}
        <div className="space-y-4 md:space-y-6 cv-section-mobile">
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
        <div className="col-span-1 md:col-span-2 space-y-4 md:space-y-6 cv-section-mobile">
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
                      <p className="text-sm text-gray-600 whitespace-pre-line">{schule.beschreibung}</p>
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
                    // Current jobs (bis heute) should appear first
                    const aIsCurrent = !a.zeitraum_bis || a.zeitraum_bis === '';
                    const bIsCurrent = !b.zeitraum_bis || b.zeitraum_bis === '';
                    
                    if (aIsCurrent && !bIsCurrent) return -1;
                    if (!aIsCurrent && bIsCurrent) return 1;
                    
                    // For non-current jobs, sort by end date (newest first)
                    const aEnd = a.zeitraum_bis ? new Date(a.zeitraum_bis) : new Date(a.zeitraum_von);
                    const bEnd = b.zeitraum_bis ? new Date(b.zeitraum_bis) : new Date(b.zeitraum_von);
                    return bEnd.getTime() - aEnd.getTime();
                  })
                  .map((arbeit, index) => (
                  <div key={index} className={`border-l-4 border-[hsl(${colors.primary})] pl-4 bg-[hsl(${colors.secondary})] p-4 rounded-r-lg break-inside-avoid`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{arbeit.titel}</h4>
                      <span className="text-sm text-muted-foreground bg-white px-2 py-1 rounded whitespace-nowrap">
                        {arbeit.zeitraum_von ? new Date(arbeit.zeitraum_von).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : ''} - {arbeit.zeitraum_bis ? new Date(arbeit.zeitraum_bis).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : 'heute'}
                      </span>
                    </div>
                    <div className={`text-[hsl(${colors.text})] font-medium mb-1`}>{arbeit.unternehmen}</div>
                    <div className="text-sm text-muted-foreground mb-2">{arbeit.ort}</div>
                    {arbeit.beschreibung && (
                      <p className="text-sm text-gray-600 whitespace-pre-line">{arbeit.beschreibung}</p>
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