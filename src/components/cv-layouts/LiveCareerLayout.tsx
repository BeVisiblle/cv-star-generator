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
          <span className="text-sm font-medium text-gray-900">{sprache}</span>
        </div>
        <div className="mb-1">
          <span className="text-xs text-gray-600">{niveau}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full"
            style={{ 
              width: `${((currentLevel + 1) / 6) * 100}%`,
              background: `hsl(${colors.primary})`
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full bg-white ${className}`} data-cv-preview>
      {/* Header Section - Clean flat design */}
      <div className="w-full py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            {data.profilbild && (
              <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
                <img
                  src={typeof data.profilbild === 'string' ? data.profilbild : URL.createObjectURL(data.profilbild)}
                  alt="Profilbild"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            
            {/* Name and Title */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {data.vorname} {data.nachname}
              </h1>
              <h2 
                className="text-lg md:text-xl font-medium mb-4"
                style={{ color: `hsl(${colors.primary})` }}
              >
                {getStatusTitle(data.status)} - {getBrancheTitle(data.branche)}
              </h2>
              
              {/* Contact Information */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                {(data.strasse && data.ort) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{data.strasse} {data.hausnummer}, {data.plz} {data.ort}</span>
                  </div>
                )}
                {data.telefon && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{data.telefon}</span>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span>{data.email}</span>
                  </div>
                )}
                {data.geburtsdatum && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{formatDate(data.geburtsdatum)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Clean flat layout */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column - Sidebar (35%) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* About Me */}
              {data.ueberMich && (
                <div>
                  <h3 
                    className="text-lg font-bold uppercase tracking-wide mb-4"
                    style={{ color: `hsl(${colors.primary})` }}
                  >
                    Über mich
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {data.ueberMich}
                  </p>
                </div>
              )}

              {/* Skills - Simple clean list */}
              {(data.status === 'azubi' || data.status === 'ausgelernt') && data.faehigkeiten && data.faehigkeiten.length > 0 && (
                <div>
                  <h3 
                    className="text-lg font-bold uppercase tracking-wide mb-4"
                    style={{ color: `hsl(${colors.primary})` }}
                  >
                    Kompetenzen
                  </h3>
                  <div className="space-y-2">
                    {data.faehigkeiten.map((skill, index) => (
                      <div key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: `hsl(${colors.primary})` }} />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages - Proper spacing, no overlap */}
              {data.sprachen && data.sprachen.length > 0 && (
                <div>
                  <h3 
                    className="text-lg font-bold uppercase tracking-wide mb-4"
                    style={{ color: `hsl(${colors.primary})` }}
                  >
                    Sprachen
                  </h3>
                  <div className="space-y-4">
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

            {/* Right Column - Main Content (65%) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Work Experience */}
              {data.berufserfahrung && data.berufserfahrung.length > 0 && (
                <div>
                  <h3 
                    className="text-lg font-bold uppercase tracking-wide mb-6"
                    style={{ color: `hsl(${colors.primary})` }}
                  >
                    Berufserfahrung
                  </h3>
                  <div className="space-y-6">
                    {data.berufserfahrung.map((job, index) => (
                      <div key={index}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                          <div>
                            <h4 className="text-base font-semibold text-gray-900">{job.titel}</h4>
                            <p className="text-sm font-medium" style={{ color: `hsl(${colors.primary})` }}>
                              {job.unternehmen}
                            </p>
                            <p className="text-sm text-gray-600">{job.ort}</p>
                          </div>
                          <div className="text-sm text-gray-500 font-medium mt-2 sm:mt-0">
                            {job.zeitraum_von} - {job.zeitraum_bis}
                          </div>
                        </div>
                        {job.beschreibung && (
                          <div className="mt-3">
                            <ul className="text-sm text-gray-700 space-y-1">
                              {job.beschreibung.split('\n').filter(line => line.trim()).map((line, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
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
                <div>
                  <h3 
                    className="text-lg font-bold uppercase tracking-wide mb-6"
                    style={{ color: `hsl(${colors.primary})` }}
                  >
                    Ausbildung
                  </h3>
                  <div className="space-y-6">
                    {data.schulbildung.map((school, index) => (
                      <div key={index}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                          <div>
                            <h4 className="text-base font-semibold text-gray-900">{school.schulform}</h4>
                            <p className="text-sm font-medium" style={{ color: `hsl(${colors.primary})` }}>
                              {school.name}
                            </p>
                            <p className="text-sm text-gray-600">{school.ort}</p>
                          </div>
                          <div className="text-sm text-gray-500 font-medium mt-2 sm:mt-0">
                            {school.zeitraum_von} - {school.zeitraum_bis}
                          </div>
                        </div>
                        {school.beschreibung && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-700">{school.beschreibung}</p>
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
      </div>
    </div>
  );
};

export default LiveCareerLayout;