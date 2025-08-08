import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, ContactInfo, ProfileImage, LanguageBars, SkillTags } from './CVLayoutBase';

const CreativeLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  return (
    <div className={`max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden relative ${className}`} data-cv-preview>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform rotate-12">
        <div 
          className="w-full h-full rounded-full"
          style={{ background: `hsl(${colors.primary})` }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 transform -rotate-12">
        <div 
          className="w-full h-full rounded-full"
          style={{ background: `hsl(${colors.accent})` }}
        />
      </div>

      {/* Header Section */}
      <div className="relative p-8 overflow-hidden">
        <div 
          className="absolute inset-0 transform -skew-y-1"
          style={{
            background: `linear-gradient(135deg, hsl(${colors.primary}), hsl(${colors.accent}))`
          }}
        />
        <div className="relative z-10 flex items-center gap-6 text-white">
          <ProfileImage profilbild={data.profilbild} avatar_url={data.avatar_url} size="lg" className="border-4 border-white shadow-lg" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-white transform -skew-x-3">
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
      <div className="grid md:grid-cols-5 gap-6 p-8">
        {/* Left Sidebar */}
        <div className="md:col-span-2 space-y-6">
          {/* Languages */}
          {data.sprachen && data.sprachen.length > 0 && (
            <div>
              <h3 className={`text-xl font-bold text-[hsl(${colors.text})] mb-4 relative`}>
                Sprachen
                <div 
                  className="absolute bottom-0 left-0 w-12 h-1 rounded-full"
                  style={{ background: `hsl(${colors.primary})` }}
                />
              </h3>
              <div className="space-y-4">
                {data.sprachen.map((sprache, index) => (
                  <div key={index} className={`bg-[hsl(${colors.secondary})] p-3 rounded-lg transform hover:scale-105 transition-transform`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">{sprache.sprache}</span>
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
              <h3 className={`text-xl font-bold text-[hsl(${colors.text})] mb-4 relative`}>
                Fähigkeiten
                <div 
                  className="absolute bottom-0 left-0 w-12 h-1 rounded-full"
                  style={{ background: `hsl(${colors.primary})` }}
                />
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
              <h3 className={`text-xl font-bold text-[hsl(${colors.text})] mb-4 relative`}>
                Über mich
                <div 
                  className="absolute bottom-0 left-0 w-12 h-1 rounded-full"
                  style={{ background: `hsl(${colors.primary})` }}
                />
              </h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-[hsl(${colors.primary})]">
                {data.ueberMich}
              </p>
            </div>
          )}

          {/* Education */}
          {data.schulbildung && data.schulbildung.length > 0 && (
            <div>
              <h3 className={`text-xl font-bold text-[hsl(${colors.text})] mb-4 relative`}>
                Schulbildung
                <div 
                  className="absolute bottom-0 left-0 w-12 h-1 rounded-full"
                  style={{ background: `hsl(${colors.primary})` }}
                />
              </h3>
              <div className="space-y-4">
                {data.schulbildung
                  .sort((a, b) => {
                    const aEnd = parseInt(a.zeitraum_bis) || parseInt(a.zeitraum_von) || 0;
                    const bEnd = parseInt(b.zeitraum_bis) || parseInt(b.zeitraum_von) || 0;
                    return bEnd - aEnd;
                  })
                  .map((schule, index) => (
                  <div 
                    key={index} 
                    className={`bg-gradient-to-r from-[hsl(${colors.secondary})] to-white p-4 rounded-lg border-l-4 border-[hsl(${colors.primary})] transform hover:scale-105 transition-transform break-inside-avoid`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{schule.schulform}</h4>
                      <span 
                        className="text-sm text-white px-3 py-1 rounded-full font-medium whitespace-nowrap"
                        style={{ background: `hsl(${colors.primary})` }}
                      >
                        {schule.zeitraum_von} - {schule.zeitraum_bis || 'Heute'}
                      </span>
                    </div>
                    <div className={`text-[hsl(${colors.text})] font-semibold mb-1`}>{schule.name}</div>
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
              <h3 className={`text-xl font-bold text-[hsl(${colors.text})] mb-4 relative`}>
                Praktische Erfahrung
                <div 
                  className="absolute bottom-0 left-0 w-12 h-1 rounded-full"
                  style={{ background: `hsl(${colors.primary})` }}
                />
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
                  <div 
                    key={index} 
                    className={`bg-gradient-to-r from-[hsl(${colors.secondary})] to-white p-4 rounded-lg border-l-4 border-[hsl(${colors.primary})] transform hover:scale-105 transition-transform break-inside-avoid`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{arbeit.titel}</h4>
                      <span 
                        className="text-sm text-white px-3 py-1 rounded-full font-medium whitespace-nowrap"
                        style={{ background: `hsl(${colors.primary})` }}
                      >
                        {arbeit.zeitraum_von ? new Date(arbeit.zeitraum_von).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : ''} - {arbeit.zeitraum_bis ? new Date(arbeit.zeitraum_bis).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : 'heute'}
                      </span>
                    </div>
                    <div className={`text-[hsl(${colors.text})] font-semibold mb-1`}>{arbeit.unternehmen}</div>
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

export default CreativeLayout;