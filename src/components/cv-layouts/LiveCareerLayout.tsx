import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, formatDate } from './CVLayoutBase';
import { Phone, Mail, MapPin, Calendar } from 'lucide-react';

const LiveCareerLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  const LanguageProgressBar: React.FC<{ niveau: string; sprache: string }> = ({ niveau, sprache }) => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentLevel = niveau === 'Muttersprache' ? 6 : levels.indexOf(niveau);
    
    return (
      <div className="mb-3">
        <div className="mb-0.5">
          <span className="font-medium text-gray-900" style={{ fontSize: '9pt' }}>{sprache}</span>
        </div>
        <div className="mb-1">
          <span className="text-gray-600" style={{ fontSize: '8pt' }}>{niveau}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full" style={{ height: '4px' }}>
          <div 
            className="rounded-full"
            style={{ 
              height: '4px',
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
                className="font-bold uppercase tracking-wide mb-2"
                style={{ 
                  color: `hsl(${colors.primary})`,
                  fontSize: '11pt'
                }}
              >
                Kompetenzen
              </h3>
              <div className="space-y-1">
                {data.faehigkeiten.map((skill, index) => (
                  <div key={index} className="text-gray-700 flex items-start" style={{ fontSize: '9pt' }}>
                    <span className="mr-2 mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: `hsl(${colors.primary})` }} />
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
                className="font-bold uppercase tracking-wide mb-2"
                style={{ 
                  color: `hsl(${colors.primary})`,
                  fontSize: '11pt'
                }}
              >
                Sprachen
              </h3>
              <div className="space-y-3">
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
                className="font-bold uppercase tracking-wide mb-3"
                style={{ 
                  color: `hsl(${colors.primary})`,
                  fontSize: '11pt'
                }}
              >
                Berufserfahrung
              </h3>
              <div className="space-y-4">
                {data.berufserfahrung.map((job, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900" style={{ fontSize: '10pt' }}>{job.titel}</h4>
                        <p className="font-medium" style={{ color: `hsl(${colors.primary})`, fontSize: '9pt' }}>
                          {job.unternehmen}
                        </p>
                        <p className="text-gray-600" style={{ fontSize: '9pt' }}>{job.ort}</p>
                      </div>
                      <div className="text-gray-500 font-medium ml-4" style={{ fontSize: '9pt' }}>
                        {job.zeitraum_von} - {job.zeitraum_bis}
                      </div>
                    </div>
                    {job.beschreibung && (
                      <div className="mt-2">
                        <ul className="text-gray-700 space-y-0.5" style={{ fontSize: '9pt' }}>
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
            <div className="page-break-inside-avoid">
              <h3 
                className="font-bold uppercase tracking-wide mb-3"
                style={{ 
                  color: `hsl(${colors.primary})`,
                  fontSize: '11pt'
                }}
              >
                Ausbildung
              </h3>
              <div className="space-y-4">
                {data.schulbildung.map((school, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900" style={{ fontSize: '10pt' }}>{school.schulform}</h4>
                        <p className="font-medium" style={{ color: `hsl(${colors.primary})`, fontSize: '9pt' }}>
                          {school.name}
                        </p>
                        <p className="text-gray-600" style={{ fontSize: '9pt' }}>{school.ort}</p>
                      </div>
                      <div className="text-gray-500 font-medium ml-4" style={{ fontSize: '9pt' }}>
                        {school.zeitraum_von} - {school.zeitraum_bis}
                      </div>
                    </div>
                    {school.beschreibung && (
                      <div className="mt-2">
                        <p className="text-gray-700" style={{ fontSize: '9pt' }}>{school.beschreibung}</p>
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