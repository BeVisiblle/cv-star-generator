import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, ContactInfo, ProfileImage, LanguageBars, SkillTags } from './CVLayoutBase';

const MinimalLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  return (
    <div className={`max-w-3xl mx-auto bg-white ${className}`} data-cv-preview>
      {/* Header Section */}
      <div className={`p-8 border-b-2 border-[hsl(${colors.primary})]`}>
        <div className="flex items-center gap-6">
          <ProfileImage profilbild={data.profilbild} avatar_url={data.avatar_url} size="md" className="border border-gray-200" />
          <div className="flex-1">
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-wide">
              {data.vorname} <span className="font-medium">{data.nachname}</span>
            </h1>
            <div className={`text-lg mb-3 text-[hsl(${colors.text})] font-light tracking-wide`}>
              {getStatusTitle(data.status)} • {getBrancheTitle(data.branche)}
            </div>
            <ContactInfo data={data} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* About Me */}
        {data.ueberMich && (
          <div>
            <h3 className={`text-base font-medium text-[hsl(${colors.text})] mb-2 uppercase tracking-wide`}>
              Über mich
            </h3>
            <div className={`w-12 h-px bg-[hsl(${colors.primary})] mb-4`} />
            <p className="text-gray-700 leading-relaxed font-light">
              {data.ueberMich}
            </p>
          </div>
        )}

        {/* Languages and Skills */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Languages */}
          {data.sprachen && data.sprachen.length > 0 && (
            <div>
              <h3 className={`text-base font-medium text-[hsl(${colors.text})] mb-2 uppercase tracking-wide`}>
                Sprachen
              </h3>
              <div className={`w-12 h-px bg-[hsl(${colors.primary})] mb-4`} />
              <div className="space-y-4">
                {data.sprachen.map((sprache, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-light">{sprache.sprache}</span>
                      <span className="text-sm text-muted-foreground font-light">{sprache.niveau}</span>
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
              <h3 className={`text-base font-medium text-[hsl(${colors.text})] mb-2 uppercase tracking-wide`}>
                Fähigkeiten
              </h3>
              <div className={`w-12 h-px bg-[hsl(${colors.primary})] mb-4`} />
              <div className="space-y-2">
                {data.faehigkeiten.map((skill, index) => (
                  <div 
                    key={index}
                    className="text-gray-700 font-light py-1 border-b border-gray-100 last:border-b-0"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Education */}
        {data.schulbildung && data.schulbildung.length > 0 && (
          <div>
            <h3 className={`text-base font-medium text-[hsl(${colors.text})] mb-2 uppercase tracking-wide`}>
              Schulbildung
            </h3>
            <div className={`w-12 h-px bg-[hsl(${colors.primary})] mb-4`} />
            <div className="space-y-6">
              {data.schulbildung
                .sort((a, b) => {
                  const aEnd = parseInt(a.zeitraum_bis) || parseInt(a.zeitraum_von) || 0;
                  const bEnd = parseInt(b.zeitraum_bis) || parseInt(b.zeitraum_von) || 0;
                  return bEnd - aEnd;
                })
                .map((schule, index) => (
                <div key={index} className="pb-4 border-b border-gray-100 last:border-b-0 break-inside-avoid">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{schule.schulform}</h4>
                    <span className="text-sm text-muted-foreground font-light whitespace-nowrap">
                      {schule.zeitraum_von} - {schule.zeitraum_bis || 'Heute'}
                    </span>
                  </div>
                  <div className={`text-[hsl(${colors.text})] font-light mb-1`}>{schule.name}</div>
                  <div className="text-sm text-muted-foreground font-light">{schule.ort}</div>
                  {schule.beschreibung && (
                    <p className="text-sm text-gray-600 mt-2 font-light">{schule.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {data.berufserfahrung && data.berufserfahrung.length > 0 && (
          <div>
            <h3 className={`text-base font-medium text-[hsl(${colors.text})] mb-2 uppercase tracking-wide`}>
              Praktische Erfahrung
            </h3>
            <div className={`w-12 h-px bg-[hsl(${colors.primary})] mb-4`} />
            <div className="space-y-6">
              {data.berufserfahrung
                .sort((a, b) => {
                  const aEnd = a.zeitraum_bis ? new Date(a.zeitraum_bis) : new Date(a.zeitraum_von);
                  const bEnd = b.zeitraum_bis ? new Date(b.zeitraum_bis) : new Date(b.zeitraum_von);
                  return bEnd.getTime() - aEnd.getTime();
                })
                .map((arbeit, index) => (
                <div key={index} className="pb-4 border-b border-gray-100 last:border-b-0 break-inside-avoid">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{arbeit.titel}</h4>
                    <span className="text-sm text-muted-foreground font-light whitespace-nowrap">
                      {arbeit.zeitraum_von ? new Date(arbeit.zeitraum_von).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : ''} - {arbeit.zeitraum_bis ? new Date(arbeit.zeitraum_bis).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : 'heute'}
                    </span>
                  </div>
                  <div className={`text-[hsl(${colors.text})] font-light mb-1`}>{arbeit.unternehmen}</div>
                  <div className="text-sm text-muted-foreground font-light">{arbeit.ort}</div>
                  {arbeit.beschreibung && (
                    <p className="text-sm text-gray-600 mt-2 font-light">{arbeit.beschreibung}</p>
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

export default MinimalLayout;