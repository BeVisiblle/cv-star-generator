import React from 'react';
import { CVData, CVLayoutProps, formatDate, ProfileImage } from './CVLayoutBase';

const LeipzigLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const fullName = `${data.vorname || ''} ${data.nachname || ''}`.trim();
  
  return (
    <div className={`cv-a4-page ${className}`} style={{ fontFamily: "'Inter', 'Helvetica', sans-serif" }}>
      <div className="p-8 bg-white">
        {/* Header Section */}
        <div className="flex gap-8 mb-8 pb-6 border-b-2" style={{ borderColor: 'hsl(0, 0%, 15%)' }}>
          {/* Left - Profile & About */}
          <div className="w-[40%]">
            {/* Profile Image - Large Circle */}
            {(data.profilbild || data.avatar_url) && (
              <div className="mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4" style={{ borderColor: 'hsl(0, 0%, 15%)' }}>
                  <ProfileImage
                    profilbild={data.profilbild}
                    avatar_url={data.avatar_url}
                    size="full"
                    className="rounded-full"
                  />
                </div>
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'hsl(0, 0%, 10%)' }}>
              {fullName}
            </h1>

            {/* About Me */}
            {data.ueberMich && (
              <div className="mt-4">
                <h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'hsl(0, 0%, 25%)' }}>
                  About Me
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'hsl(0, 0%, 35%)' }}>
                  {data.ueberMich}
                </p>
              </div>
            )}
          </div>

          {/* Right - Contact */}
          <div className="flex-1">
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'hsl(0, 0%, 25%)' }}>
              Contact
            </h3>
            <div className="space-y-2 text-xs" style={{ color: 'hsl(0, 0%, 35%)' }}>
              {data.telefon && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[60px]">Phone:</span>
                  <span>{data.telefon}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[60px]">Email:</span>
                  <span className="break-all">{data.email}</span>
                </div>
              )}
              {(data.strasse || data.ort) && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[60px]">Address:</span>
                  <div>
                    {data.strasse && data.hausnummer && `${data.strasse} ${data.hausnummer}`}
                    {data.strasse && data.hausnummer && <br />}
                    {data.plz && data.ort && `${data.plz} ${data.ort}`}
                  </div>
                </div>
              )}
              {data.geburtsdatum && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[60px]">Born:</span>
                  <span>{formatDate(data.geburtsdatum)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Column - 60% Timeline */}
          <div className="w-[60%] space-y-6">
            {/* Education Timeline */}
            {data.schulbildung && data.schulbildung.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 uppercase tracking-wide" style={{ color: 'hsl(0, 0%, 15%)' }}>
                  Education
                </h2>
                <div className="space-y-4">
                  {data.schulbildung.map((schule, idx) => (
                    <div key={idx} className="avoid-break relative pl-6 border-l-2" style={{ borderColor: 'hsl(0, 0%, 20%)' }}>
                      <div 
                        className="absolute -left-[7px] top-0 w-3 h-3 rounded-full"
                        style={{ backgroundColor: 'hsl(0, 0%, 15%)' }}
                      />
                      <div className="text-xs font-bold mb-1" style={{ color: 'hsl(0, 0%, 45%)' }}>
                        {schule.zeitraum_von} - {schule.zeitraum_bis}
                      </div>
                      <h3 className="font-bold text-sm mb-0.5" style={{ color: 'hsl(0, 0%, 15%)' }}>
                        {schule.schulform}
                      </h3>
                      <p className="text-xs mb-1" style={{ color: 'hsl(0, 0%, 35%)' }}>
                        {schule.name}
                        {schule.ort && ` • ${schule.ort}`}
                      </p>
                      {schule.beschreibung && (
                        <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'hsl(0, 0%, 40%)' }}>
                          {schule.beschreibung}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience Timeline */}
            {data.berufserfahrung && data.berufserfahrung.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 uppercase tracking-wide" style={{ color: 'hsl(0, 0%, 15%)' }}>
                  Experience
                </h2>
                <div className="space-y-4">
                  {data.berufserfahrung.map((arbeit, idx) => (
                    <div key={idx} className="avoid-break relative pl-6 border-l-2" style={{ borderColor: 'hsl(0, 0%, 20%)' }}>
                      <div 
                        className="absolute -left-[7px] top-0 w-3 h-3 rounded-full"
                        style={{ backgroundColor: 'hsl(0, 0%, 15%)' }}
                      />
                      <div className="text-xs font-bold mb-1" style={{ color: 'hsl(0, 0%, 45%)' }}>
                        {arbeit.zeitraum_von} - {arbeit.zeitraum_bis || 'heute'}
                      </div>
                      <h3 className="font-bold text-sm mb-0.5" style={{ color: 'hsl(0, 0%, 15%)' }}>
                        {arbeit.titel}
                      </h3>
                      <p className="text-xs mb-1" style={{ color: 'hsl(0, 0%, 35%)' }}>
                        {arbeit.unternehmen}
                        {arbeit.ort && ` • ${arbeit.ort}`}
                      </p>
                      {arbeit.beschreibung && (
                        <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'hsl(0, 0%, 40%)' }}>
                          {arbeit.beschreibung}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Further Education */}
            {data.weiterbildung && data.weiterbildung.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 uppercase tracking-wide" style={{ color: 'hsl(0, 0%, 15%)' }}>
                  Certifications
                </h2>
                <div className="space-y-3">
                  {data.weiterbildung.map((wb, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="font-semibold" style={{ color: 'hsl(0, 0%, 20%)' }}>
                        {wb.titel}
                      </div>
                      <div style={{ color: 'hsl(0, 0%, 40%)' }}>
                        {wb.anbieter}
                        {wb.zeitraum_von && ` • ${wb.zeitraum_von}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 40% Skills */}
          <div className="flex-1 space-y-6">
            {/* Skills */}
            {data.faehigkeiten && data.faehigkeiten.length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'hsl(0, 0%, 25%)' }}>
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.faehigkeiten.map((skill, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: 'hsl(0, 0%, 15%)',
                        color: 'hsl(0, 0%, 95%)'
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'hsl(0, 0%, 95%)' }} />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.sprachen && data.sprachen.length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'hsl(0, 0%, 25%)' }}>
                  Languages
                </h3>
                <div className="space-y-2.5 text-xs">
                  {data.sprachen.map((sprache, idx) => (
                    <div key={idx}>
                      <div className="font-semibold" style={{ color: 'hsl(0, 0%, 20%)' }}>
                        {sprache.sprache}
                      </div>
                      <div style={{ color: 'hsl(0, 0%, 45%)' }}>{sprache.niveau}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Qualifications */}
            {data.qualifikationen && data.qualifikationen.length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'hsl(0, 0%, 25%)' }}>
                  Qualifications
                </h3>
                <div className="space-y-2 text-xs">
                  {data.qualifikationen.map((qual, idx) => (
                    <div key={idx}>
                      <div className="font-semibold" style={{ color: 'hsl(0, 0%, 20%)' }}>
                        {qual.name}
                      </div>
                      {qual.beschreibung && (
                        <div className="text-[10px]" style={{ color: 'hsl(0, 0%, 45%)' }}>
                          {qual.beschreibung}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {data.interessen && data.interessen.length > 0 && (
              <div>
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'hsl(0, 0%, 25%)' }}>
                  Interests
                </h3>
                <div className="text-xs space-y-1" style={{ color: 'hsl(0, 0%, 35%)' }}>
                  {data.interessen.map((interesse, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'hsl(0, 0%, 25%)' }} />
                      {interesse}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeipzigLayout;
