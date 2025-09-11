import React from 'react';
import { CVLayoutProps } from './CVLayoutBase';
import { cn } from '@/lib/utils';

const ATSCompactLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' });
  };

  const getFullAddress = () => {
    const parts = [data.strasse, data.hausnummer, data.plz, data.ort].filter(Boolean);
    return parts.join(' ');
  };

  return (
    <div className={cn("max-w-3xl mx-auto bg-white shadow-lg", className)} data-cv-preview>
      {/* Header - Minimal */}
      <div className="bg-gray-800 text-white p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            {data.vorname} {data.nachname}
          </h1>
          <div className="text-lg font-semibold mb-4">
            {data.status === 'azubi' ? 'Auszubildender' : 
             data.status === 'schueler' ? 'Schüler' : 
             data.status === 'ausgelernt' ? 'Fachkraft' : 'Bewerber'}
            {data.branche && ` - ${data.branche.charAt(0).toUpperCase() + data.branche.slice(1)}`}
          </div>
          
          {/* Contact Info - Simple List */}
          <div className="text-sm space-y-1">
            {data.telefon && <div>{data.telefon}</div>}
            {data.email && <div>{data.email}</div>}
            {getFullAddress() && <div>{getFullAddress()}</div>}
            {data.geburtsdatum && <div>Geboren: {formatDate(data.geburtsdatum)}</div>}
          </div>
        </div>
      </div>

      {/* Main Content - Single Column */}
      <div className="p-6 space-y-6">
        {/* About Me */}
        {data.ueberMich && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
              ÜBER MICH
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {data.ueberMich}
            </p>
          </section>
        )}

        {/* Professional Experience */}
        {data.berufserfahrung && data.berufserfahrung.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
              BERUFSERFAHRUNG
            </h2>
            <div className="space-y-4">
              {data.berufserfahrung.map((job, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800">{job.titel}</h3>
                    <span className="text-sm text-gray-600">
                      {formatDate(job.zeitraum_von)} - {formatDate(job.zeitraum_bis)}
                    </span>
                  </div>
                  <div className="text-gray-600 font-medium mb-1">{job.unternehmen}, {job.ort}</div>
                  {job.beschreibung && (
                    <p className="text-gray-700 text-sm">{job.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.schulbildung && data.schulbildung.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
              AUSBILDUNG
            </h2>
            <div className="space-y-4">
              {data.schulbildung.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800">{edu.schulform}</h3>
                    <span className="text-sm text-gray-600">
                      {formatDate(edu.zeitraum_von)} - {formatDate(edu.zeitraum_bis)}
                    </span>
                  </div>
                  <div className="text-gray-600 font-medium mb-1">{edu.name}, {edu.ort}</div>
                  {edu.beschreibung && (
                    <p className="text-gray-700 text-sm">{edu.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.faehigkeiten && data.faehigkeiten.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
              FÄHIGKEITEN
            </h2>
            <div className="text-gray-700">
              {data.faehigkeiten.join(' • ')}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.sprachen && data.sprachen.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
              SPRACHEN
            </h2>
            <div className="space-y-2">
              {data.sprachen.map((lang, index) => (
                <div key={index} className="flex justify-between">
                  <span className="font-medium text-gray-800">{lang.sprache}</span>
                  <span className="text-gray-600">{lang.niveau}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Additional Information */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
            ZUSÄTZLICHE INFORMATIONEN
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div>Verfügbarkeit: Sofort verfügbar</div>
            <div>Arbeitszeit: Vollzeit / Teilzeit</div>
            {data.has_drivers_license && (
              <div>Führerschein: Klasse {data.driver_license_class || 'B'}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ATSCompactLayout;