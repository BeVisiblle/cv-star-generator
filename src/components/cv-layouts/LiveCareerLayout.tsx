import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, formatDate } from './CVLayoutBase';
import { Phone, Mail, MapPin, Calendar } from 'lucide-react';

const LiveCareerLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  const LanguageProgressBar: React.FC<{ niveau: string; sprache: string }> = ({ niveau, sprache }) => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentLevel = niveau === 'Muttersprache' ? 6 : levels.indexOf(niveau);
    
    return (
      <div className="mb-4">
        <div className="mb-1">
          <span className="font-medium text-gray-900" style={{ fontSize: '9pt' }}>{sprache}</span>
        </div>
        <div className="mb-2">
          <span className="text-gray-600" style={{ fontSize: '8pt' }}>{niveau}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full" style={{ height: '3px' }}>
          <div 
            className="rounded-full"
            style={{ 
              height: '3px',
              width: `${((currentLevel + 1) / 6) * 100}%`,
              background: `hsl(${colors.primary})`
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-[210mm] mx-auto bg-white min-h-[297mm] ${className}`} data-cv-preview style={{ 
      fontSize: '10pt', 
      lineHeight: '1.4',
      padding: '15mm',
      boxSizing: 'border-box'
    }}>
      {/* Header Section - PDF optimized */}
      <div className="mb-6">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          {data.profilbild && (
            <div className="w-20 h-20 flex-shrink-0">
              <img
                src={typeof data.profilbild === 'string' ? data.profilbild : URL.createObjectURL(data.profilbild)}
                alt="Profilbild"
                className="w-full h-full object-cover rounded"
                style={{ maxWidth: '20mm', maxHeight: '20mm' }}
              />
            </div>
          )}
          
          {/* Name and Title */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-1" style={{ fontSize: '18pt', lineHeight: '1.2' }}>
              {data.vorname} {data.nachname}
            </h1>
            <h2 
              className="text-base font-medium mb-3"
              style={{ 
                color: `hsl(${colors.primary})`,
                fontSize: '12pt'
              }}
            >
              {getStatusTitle(data.status)} - {getBrancheTitle(data.branche)}
            </h2>
            
            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600" style={{ fontSize: '9pt' }}>
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
            <div>
              <h3 
                className="font-bold uppercase tracking-wide mb-2"
                style={{ 
                  color: `hsl(${colors.primary})`,
                  fontSize: '11pt'
                }}
              >
                Über mich
              </h3>
              <p className="text-gray-700" style={{ fontSize: '9pt', lineHeight: '1.4' }}>
                {data.ueberMich}
              </p>
            </div>
          )}

          {/* Skills */}
          {(data.status === 'azubi' || data.status === 'ausgelernt') && data.faehigkeiten && data.faehigkeiten.length > 0 && (
            <div>
              <h3 
                className="font-bold uppercase tracking-wide mb-3"
                style={{ 
                  color: `hsl(${colors.primary})`,
                  fontSize: '11pt'
                }}
              >
                Kompetenzen
              </h3>
              <div className="space-y-2">
                {data.faehigkeiten.map((skill, index) => (
                  <div key={index} className="text-gray-700 flex items-start" style={{ fontSize: '9pt' }}>
                    <span className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: `hsl(${colors.primary})` }} />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.sprachen && data.sprachen.length > 0 && (
            <div>
              <h3 
                className="font-bold uppercase tracking-wide mb-3"
                style={{ 
                  color: `hsl(${colors.primary})`,
                  fontSize: '11pt'
                }}
              >
                Sprachen
              </h3>
              <div className="space-y-1">
                {data.sprachen.map((sprache, index) => (
                  <LanguageProgressBar 
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
            <div className="page-break-inside-avoid">
              <h3 
                className="font-bold mb-4"
                style={{ 
                  fontSize: '14pt',
                  color: '#000'
                }}
              >
                Praktische Erfahrung
              </h3>
              <div className="space-y-6">
                {data.berufserfahrung.map((job, index) => (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-black mb-1" style={{ fontSize: '12pt' }}>{job.titel}</h4>
                        <p className="font-medium text-black" style={{ fontSize: '10pt' }}>
                          {job.unternehmen}
                        </p>
                        <p className="text-gray-500" style={{ fontSize: '10pt' }}>{job.ort}</p>
                        {job.beschreibung && (
                          <div className="mt-2">
                            <p className="text-gray-600" style={{ fontSize: '10pt' }}>
                              {job.beschreibung}
                            </p>
                          </div>
                        )}
                      </div>
                      <div 
                        className="px-3 py-1 rounded-full text-white font-medium flex-shrink-0"
                        style={{ 
                          fontSize: '9pt',
                          background: `hsl(${colors.primary})`
                        }}
                      >
                        {job.zeitraum_von} - {job.zeitraum_bis}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.schulbildung && data.schulbildung.length > 0 && (
            <div className="page-break-inside-avoid">
              <h3 
                className="font-bold mb-4"
                style={{ 
                  fontSize: '14pt',
                  color: '#000'
                }}
              >
                Schulbildung
              </h3>
              <div className="space-y-6">
                {data.schulbildung.map((school, index) => (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-black mb-1" style={{ fontSize: '12pt' }}>{school.schulform}</h4>
                        <p className="font-medium text-black" style={{ fontSize: '10pt' }}>
                          {school.name}
                        </p>
                        <p className="text-gray-500" style={{ fontSize: '10pt' }}>{school.ort}</p>
                        {school.beschreibung && (
                          <div className="mt-2">
                            <p className="text-gray-600" style={{ fontSize: '10pt' }}>{school.beschreibung}</p>
                          </div>
                        )}
                      </div>
                      <div 
                        className="px-3 py-1 rounded-full text-white font-medium flex-shrink-0"
                        style={{ 
                          fontSize: '9pt',
                          background: `hsl(${colors.primary})`
                        }}
                      >
                        {school.zeitraum_von} - {school.zeitraum_bis}
                      </div>
                    </div>
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