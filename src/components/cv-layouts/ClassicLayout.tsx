import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, ContactInfo, ProfileImage, LanguageBars, SkillTags } from './CVLayoutBase';

const ClassicLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  return (
    <div className={`max-w-3xl mx-auto bg-white border-2 border-gray-300 shadow-lg ${className}`} data-cv-preview>
      {/* Header Section */}
      <div 
        className="p-6 text-white"
        style={{
          background: `linear-gradient(135deg, hsl(${colors.primary}), hsl(${colors.accent}))`
        }}
      >
        <div className="flex items-center gap-6">
          <ProfileImage profilbild={data.profilbild} avatar_url={data.avatar_url} size="md" className="border-2 border-white" />
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold mb-2 text-white">
              {data.vorname} {data.nachname}
            </h1>
            <div className="text-lg mb-3 text-white/90 font-serif">
              {getStatusTitle(data.status)} - {getBrancheTitle(data.branche)}
            </div>
            <ContactInfo data={data} isLight />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
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
        <div className="grid md:grid-cols-2 gap-6">
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
              {data.schulbildung.map((schule, index) => (
                <div key={index} className={`border-l-4 border-[hsl(${colors.primary})] pl-4`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold font-serif">{schule.schulform}</h4>
                    <span className="text-sm text-muted-foreground">
                      {schule.zeitraum_von} - {schule.zeitraum_bis}
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
              {data.berufserfahrung.map((arbeit, index) => (
                <div key={index} className={`border-l-4 border-[hsl(${colors.primary})] pl-4`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold font-serif">{arbeit.titel}</h4>
                    <span className="text-sm text-muted-foreground">
                      {arbeit.zeitraum_von} - {arbeit.zeitraum_bis}
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