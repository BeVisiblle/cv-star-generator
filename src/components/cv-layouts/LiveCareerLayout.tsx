import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle, formatDate } from './CVLayoutBase';
import { Phone, Mail, MapPin, Calendar, Globe } from 'lucide-react';

const LiveCareerLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  const LanguageProgressBar: React.FC<{ niveau: string }> = ({ niveau }) => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentLevel = niveau === 'Muttersprache' ? 6 : levels.indexOf(niveau);
    
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{niveau}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all"
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
    <div className={`max-w-5xl mx-auto bg-white min-h-[297mm] ${className}`} data-cv-preview>
      {/* Header Section - Full Width */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            {data.profilbild && (
              <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
                <img
                  src={typeof data.profilbild === 'string' ? data.profilbild : URL.createObjectURL(data.profilbild)}
                  alt="Profilbild"
                  className="w-full h-full object-cover rounded-lg shadow-md"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
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

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Sidebar (35%) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* About Me */}
            {data.ueberMich && (
              <div>
                <h3 
                  className="text-lg font-bold uppercase tracking-wide mb-4 pb-2 border-b-2"
                  style={{ 
                    color: `hsl(${colors.primary})`,
                    borderColor: `hsl(${colors.primary})`
                  }}
                >
                  Über mich
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {data.ueberMich}
                </p>
              </div>
            )}

            {/* Skills */}
            {(data.status === 'azubi' || data.status === 'ausgelernt') && data.faehigkeiten && data.faehigkeiten.length > 0 && (
              <div>
                <h3 
                  className="text-lg font-bold uppercase tracking-wide mb-4 pb-2 border-b-2"
                  style={{ 
                    color: `hsl(${colors.primary})`,
                    borderColor: `hsl(${colors.primary})`
                  }}
                >
                  Kompetenzen
                </h3>
                <ul className="space-y-2">
                  {data.faehigkeiten.map((skill, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: `hsl(${colors.primary})` }} />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {data.sprachen && data.sprachen.length > 0 && (
              <div>
                <h3 
                  className="text-lg font-bold uppercase tracking-wide mb-4 pb-2 border-b-2"
                  style={{ 
                    color: `hsl(${colors.primary})`,
                    borderColor: `hsl(${colors.primary})`
                  }}
                >
                  Sprachen
                </h3>
                <div className="space-y-4">
                  {data.sprachen.map((sprache, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">{sprache.sprache}</span>
                      </div>
                      <LanguageProgressBar niveau={sprache.niveau} />
                    </div>
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
                  className="text-xl font-bold uppercase tracking-wide mb-6 pb-2 border-b-2"
                  style={{ 
                    color: `hsl(${colors.primary})`,
                    borderColor: `hsl(${colors.primary})`
                  }}
                >
                  Berufserfahrung
                </h3>
                <div className="space-y-6">
                  {data.berufserfahrung.map((job, index) => (
                    <div key={index} className="relative">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{job.titel}</h4>
                          <p className="text-base font-medium" style={{ color: `hsl(${colors.primary})` }}>
                            {job.unternehmen}
                          </p>
                          <p className="text-sm text-gray-600">{job.ort}</p>
                        </div>
                        <div className="text-sm text-gray-500 font-medium mt-1 sm:mt-0">
                          {job.zeitraum_von} - {job.zeitraum_bis}
                        </div>
                      </div>
                      {job.beschreibung && (
                        <div className="mt-3">
                          <ul className="text-sm text-gray-700 space-y-1">
                            {job.beschreibung.split('\n').filter(line => line.trim()).map((line, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2 mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
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
                  className="text-xl font-bold uppercase tracking-wide mb-6 pb-2 border-b-2"
                  style={{ 
                    color: `hsl(${colors.primary})`,
                    borderColor: `hsl(${colors.primary})`
                  }}
                >
                  Ausbildung
                </h3>
                <div className="space-y-6">
                  {data.schulbildung.map((school, index) => (
                    <div key={index} className="relative">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{school.schulform}</h4>
                          <p className="text-base font-medium" style={{ color: `hsl(${colors.primary})` }}>
                            {school.name}
                          </p>
                          <p className="text-sm text-gray-600">{school.ort}</p>
                        </div>
                        <div className="text-sm text-gray-500 font-medium mt-1 sm:mt-0">
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
  );
};

export default LiveCareerLayout;