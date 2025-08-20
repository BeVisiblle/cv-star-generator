import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, formatDate } from './CVLayoutBase';
import { Phone, Mail, MapPin, Calendar } from 'lucide-react';

const LiveCareerLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  const LanguageText: React.FC<{ niveau: string; sprache: string }> = ({ niveau, sprache }) => {
    return (
      <div className="cv-language">
        {sprache} – {niveau}
      </div>
    );
  };

  return (
    <div className={`w-full max-w-[210mm] mx-auto bg-white min-h-[297mm] ${className}`} data-cv-preview style={{ 
      fontSize: '10pt', 
      lineHeight: '1.4',
      padding: '15mm',
      boxSizing: 'border-box',
      pageBreakInside: 'avoid',
      pageBreakAfter: 'auto'
    }}>
      {/* Header Section - PDF optimized */}
      <div className="mb-6">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          {(data.profilbild || data.avatar_url) && (
            <div className="w-20 h-20 flex-shrink-0">
              <img
                src={
                  typeof data.profilbild === 'string' 
                    ? data.profilbild 
                    : (data.profilbild && data.profilbild instanceof File) 
                      ? URL.createObjectURL(data.profilbild) 
                      : data.avatar_url
                }
                alt="Profilbild"
                className="w-full h-full object-cover rounded"
                style={{ maxWidth: '20mm', maxHeight: '20mm' }}
              />
            </div>
          )}
          
          {/* Name and Title */}
          <div className="flex-1">
            <h1 className="cv-title text-gray-900 mb-1">
              {data.vorname} {data.nachname}
            </h1>
            <h2 
              className="cv-subtitle mb-3"
              style={{ 
                color: `hsl(${colors.primary})`
              }}
            >
              {getStatusTitle(data.status)} - {getBrancheTitle(data.branche)}
            </h2>
            
            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 cv-p text-gray-600">
              {(data.strasse && data.ort) && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>{data.strasse} {data.hausnummer}, {data.plz} {data.ort}</span>
                </div>
              )}
              {data.telefon && (
                <div className="flex items-start gap-1.5">
                  <Phone className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>{data.telefon}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-start gap-1.5">
                  <Mail className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>{data.email}</span>
                </div>
              )}
              {data.geburtsdatum && (
                <div className="flex items-start gap-1.5">
                  <Calendar className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>{formatDate(data.geburtsdatum)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - PDF A4 optimized grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column - 35% */}
        <div className="col-span-4 space-y-5">
          
          {/* About Me */}
          {data.ueberMich && (
            <div className="cv-section">
              <h3 
                className="cv-section-title"
                style={{ 
                  color: `hsl(${colors.primary})`
                }}
              >
                Über mich
              </h3>
              <p className="cv-p text-gray-700">
                {data.ueberMich}
              </p>
            </div>
          )}

          {/* Skills */}
          {(data.status === 'azubi' || data.status === 'ausgelernt') && data.faehigkeiten && data.faehigkeiten.length > 0 && (
            <div className="cv-section">
              <h3 
                className="cv-section-title"
                style={{ 
                  color: `hsl(${colors.primary})`
                }}
              >
                Kompetenzen
              </h3>
              <div className="space-y-1">
                {data.faehigkeiten.map((skill, index) => (
                  <div key={index} className="cv-p text-gray-700 flex items-start">
                    <span className="mr-2 mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: `hsl(${colors.primary})` }} />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.sprachen && data.sprachen.length > 0 && (
            <div className="cv-section">
              <h3 
                className="cv-section-title"
                style={{ 
                  color: `hsl(${colors.primary})`
                }}
              >
                Sprachen
              </h3>
              <div className="space-y-1">
                {data.sprachen.map((sprache, index) => (
                  <LanguageText 
                    key={index} 
                    niveau={sprache.niveau} 
                    sprache={sprache.sprache}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - 65% */}
        <div className="col-span-8 space-y-5">
          
          {/* Work Experience */}
          {data.berufserfahrung && data.berufserfahrung.length > 0 && (
            <div className="cv-section">
              <h3 
                className="cv-section-title mb-3"
                style={{ 
                  color: `hsl(${colors.primary})`
                }}
              >
                Berufserfahrung
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
                  .map((job, index) => (
                  <div key={index} className="cv-section break-inside-avoid">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <h4 className="cv-subtitle font-semibold text-gray-900">{job.titel}</h4>
                        <p className="cv-p font-medium" style={{ color: `hsl(${colors.primary})` }}>
                          {job.unternehmen} • {job.ort}
                        </p>
                      </div>
                      <div className="cv-p text-gray-500 font-medium ml-4 whitespace-nowrap">
                        {job.zeitraum_von ? new Date(job.zeitraum_von).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : ''} - {job.zeitraum_bis ? new Date(job.zeitraum_bis).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }).replace('.', '/') : 'heute'}
                      </div>
                    </div>
                    {job.beschreibung && (
                      <div className="mt-2">
                        <ul className="cv-p text-gray-700 space-y-0.5">
                          {job.beschreibung.split('\n').filter(line => line.trim()).map((line, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2 mt-1 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                              <span>{line.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.schulbildung && data.schulbildung.length > 0 && (
            <div className="cv-section">
              <h3 
                className="cv-section-title mb-3"
                style={{ 
                  color: `hsl(${colors.primary})`
                }}
              >
                Ausbildung
              </h3>
              <div className="space-y-4">
                {data.schulbildung
                  .sort((a, b) => {
                    const aEnd = parseInt(a.zeitraum_bis) || parseInt(a.zeitraum_von) || 0;
                    const bEnd = parseInt(b.zeitraum_bis) || parseInt(b.zeitraum_von) || 0;
                    return bEnd - aEnd;
                  })
                  .map((school, index) => (
                  <div key={index} className="cv-section break-inside-avoid">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <h4 className="cv-subtitle font-semibold text-gray-900">{school.schulform}</h4>
                        <p className="cv-p font-medium" style={{ color: `hsl(${colors.primary})` }}>
                          {school.name}
                        </p>
                        <p className="cv-p text-gray-600">{school.ort}</p>
                      </div>
                      <div className="cv-p text-gray-500 font-medium ml-4 whitespace-nowrap">
                        {school.zeitraum_von} - {school.zeitraum_bis || 'Heute'}
                      </div>
                    </div>
                    {school.beschreibung && (
                      <div className="mt-2">
                        <p className="cv-p text-gray-700">{school.beschreibung}</p>
                      </div>
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

export default LiveCareerLayout;