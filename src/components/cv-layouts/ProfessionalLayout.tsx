import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, ContactInfo, ProfileImage, LanguageBars, SkillTags } from './CVLayoutBase';

const ProfessionalLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  return (
    <div className={`max-w-4xl mx-auto bg-white border border-gray-300 shadow-lg ${className}`} data-cv-preview>
      {/* Header Section */}
      <div className={`p-8 border-b-2 border-[hsl(${colors.primary})]`}>
        <div className="flex items-center gap-6">
          <ProfileImage profilbild={data.profilbild} avatar_url={data.avatar_url} size="lg" className="border-2 border-gray-300" />
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {data.vorname} {data.nachname}
            </h1>
            <div className={`text-lg mb-3 text-[hsl(${colors.text})] font-medium`}>
              {getStatusTitle(data.status)} - {getBrancheTitle(data.branche)}
            </div>
            <ContactInfo data={data} />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-4 gap-8 p-8">
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Languages */}
          {data.sprachen && data.sprachen.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold text-[hsl(${colors.text})] mb-3 pb-2 border-b border-[hsl(${colors.primary})]`}>
                Sprachen
              </h3>
              <div className="space-y-3">
                {data.sprachen.map((sprache, index) => (
                  <div key={index} className="p-3 rounded">
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
              <h3 className={`text-lg font-semibold text-[hsl(${colors.text})] mb-3 pb-2 border-b border-[hsl(${colors.primary})]`}>
                Fähigkeiten
              </h3>
              <SkillTags skills={data.faehigkeiten} branche={data.branche} />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* About Me */}
          {data.ueberMich && (
            <div>
              <h3 className={`text-lg font-semibold text-[hsl(${colors.text})] mb-3 pb-2 border-b border-[hsl(${colors.primary})]`}>
                Über mich
              </h3>
              <p className="text-gray-700 leading-relaxed p-4 rounded">
                {data.ueberMich}
              </p>
            </div>
          )}

          {/* Education */}
          {data.schulbildung && data.schulbildung.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold text-[hsl(${colors.text})] mb-3 pb-2 border-b border-[hsl(${colors.primary})]`}>
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
                  <div key={index} className={`border border-gray-200 p-4 rounded break-inside-avoid`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{schule.schulform}</h4>
                      <span 
                        className="text-sm text-white px-3 py-1 rounded font-medium whitespace-nowrap"
                        style={{ background: `hsl(${colors.primary})` }}
                      >
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
              <h3 className={`text-lg font-semibold text-[hsl(${colors.text})] mb-3 pb-2 border-b border-[hsl(${colors.primary})]`}>
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
                  <div key={index} className={`border border-gray-200 p-4 rounded break-inside-avoid`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{arbeit.titel}</h4>
                      <span 
                        className="text-sm text-white px-3 py-1 rounded font-medium whitespace-nowrap"
                        style={{ background: `hsl(${colors.primary})` }}
                      >
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

export default ProfessionalLayout;