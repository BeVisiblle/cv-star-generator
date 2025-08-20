import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, ContactInfo, ProfileImage, LanguageBars, SkillTags } from './CVLayoutBase';
import { cn } from '@/lib/utils';

const ClassicLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  return (
    <div className={cn("max-w-3xl mx-auto bg-white border-2 border-gray-300 shadow-lg", className)} data-cv-preview>
      {/* Header Section */}
      <div 
        className="p-4 md:p-6 text-white cv-header-mobile"
        style={{
          background: `linear-gradient(135deg, hsl(${colors.primary}), hsl(${colors.accent}))`
        }}
      >
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <ProfileImage profilbild={data.profilbild} avatar_url={data.avatar_url} size="md" className="border-2 border-white" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2 text-white cv-text-mobile">
              {data.vorname} {data.nachname}
            </h1>
            <div className="text-base md:text-lg mb-3 text-white/90 font-serif">
              {getStatusTitle(data.status)} - {getBrancheTitle(data.branche)}
            </div>
            <div className="cv-contact">
              <ContactInfo data={data} isLight />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 cv-section-mobile">
        {/* About Me */}
        {data.ueberMich && (
          <div>
            <h3 className={`text-lg font-serif font-bold text-[hsl(${colors.text})] mb-3 border-b border-[hsl(${colors.primary})] pb-1`}>
              Über mich
            </h3>
            <p className="text-gray-700 leading-relaxed font-serif">
              {data.ueberMich}
            </p>
          </div>
        )}

        {/* Languages and Skills in two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 cv-grid-mobile">
          {/* Languages */}
          {data.sprachen && data.sprachen.length > 0 && (
            <div>
              <h3 className={`text-lg font-serif font-bold text-[hsl(${colors.text})] mb-3 border-b border-[hsl(${colors.primary})] pb-1`}>
                Sprachen
              </h3>
              <div className="space-y-3">
                {data.sprachen.map((sprache, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium font-serif">{sprache.sprache}</span>
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
              <h3 className={`text-lg font-serif font-bold text-[hsl(${colors.text})] mb-3 border-b border-[hsl(${colors.primary})] pb-1`}>
                Fähigkeiten
              </h3>
              <SkillTags skills={data.faehigkeiten} branche={data.branche} />
            </div>
          )}
        </div>

        {/* Education */}
        {data.schulbildung && data.schulbildung.length > 0 && (
          <div>
            <h3 className={`text-lg font-serif font-bold text-[hsl(${colors.text})] mb-3 border-b border-[hsl(${colors.primary})] pb-1`}>
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
                <div key={index} className={`border-l-4 border-[hsl(${colors.primary})] pl-4 break-inside-avoid`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold font-serif">{schule.schulform}</h4>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {schule.zeitraum_von} - {schule.zeitraum_bis || 'Heute'}
                    </span>
                  </div>
                  <div className={`text-[hsl(${colors.text})] font-medium font-serif`}>{schule.name}</div>
                  <div className="text-sm text-muted-foreground">{schule.ort}</div>
                  {schule.beschreibung && (
                    <p className="text-sm text-gray-600 mt-2 font-serif">{schule.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {data.berufserfahrung && data.berufserfahrung.length > 0 && (
          <div>
            <h3 className={`text-lg font-serif font-bold text-[hsl(${colors.text})] mb-3 border-b border-[hsl(${colors.primary})] pb-1`}>
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
                <div key={index} className={`border-l-4 border-[hsl(${colors.primary})] pl-4 break-inside-avoid`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold font-serif">{arbeit.titel}</h4>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {arbeit.zeitraum_von ? new Date(arbeit.zeitraum_von).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : ''} - {arbeit.zeitraum_bis ? new Date(arbeit.zeitraum_bis).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : 'heute'}
                    </span>
                  </div>
                  <div className={`text-[hsl(${colors.text})] font-medium font-serif`}>{arbeit.unternehmen}</div>
                  <div className="text-sm text-muted-foreground">{arbeit.ort}</div>
                  {arbeit.beschreibung && (
                    <p className="text-sm text-gray-600 mt-2 font-serif">{arbeit.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicLayout;