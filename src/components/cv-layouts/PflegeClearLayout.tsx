import React from 'react';
import { CVLayoutProps } from './CVLayoutBase';
import { cn } from '@/lib/utils';
import { Heart, Stethoscope, Clock, Globe, Award, Users, Phone, Mail, MapPin, Calendar } from 'lucide-react';

const PflegeClearLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
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
      {/* Header - Medical Green */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-8">
        <div className="text-center">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 mx-auto mb-4">
            {data.profilbild || data.avatar_url ? (
              <img 
                src={typeof data.profilbild === 'string' ? data.profilbild : data.avatar_url} 
                alt="Profilbild" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-600">
                {data.vorname?.[0]}{data.nachname?.[0]}
              </div>
            )}
          </div>
          
          {/* Name and Title */}
          <h1 className="text-4xl font-bold mb-3">
            {data.vorname} {data.nachname}
          </h1>
          <div className="text-2xl font-semibold mb-6">
            {data.status === 'azubi' ? 'Auszubildende/r Pflege' : 
             data.status === 'schueler' ? 'Schüler/in' : 
             data.status === 'ausgelernt' ? 'Pflegefachkraft' : 'Pflegebewerber/in'}
          </div>
          
          {/* Contact Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm max-w-md mx-auto">
            {data.telefon && (
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                {data.telefon}
              </div>
            )}
            {data.email && (
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                {data.email}
              </div>
            )}
            {getFullAddress() && (
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                {getFullAddress()}
              </div>
            )}
            {data.geburtsdatum && (
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(data.geburtsdatum)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single Column Content - Max Readability */}
      <div className="p-8 space-y-8">
        {/* About Me */}
        {data.ueberMich && (
          <section>
            <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-3 border-b-3 border-green-200 pb-3">
              <Heart className="h-6 w-6" />
              Über mich
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {data.ueberMich}
            </p>
          </section>
        )}

        {/* Qualifications */}
        <section>
          <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-3 border-b-3 border-green-200 pb-3">
            <Award className="h-6 w-6" />
            Qualifikationen & Ausbildung
          </h2>
          
          {/* Education */}
          {data.schulbildung && data.schulbildung.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Schulbildung</h3>
              <div className="space-y-4">
                {data.schulbildung.map((edu, index) => (
                  <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{edu.schulform}</h4>
                      <span className="text-sm text-gray-600">
                        {formatDate(edu.zeitraum_von)} - {formatDate(edu.zeitraum_bis)}
                      </span>
                    </div>
                    <div className="text-green-600 font-medium mb-2">{edu.name}, {edu.ort}</div>
                    {edu.beschreibung && (
                      <p className="text-gray-700 text-sm">{edu.beschreibung}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Experience */}
          {data.berufserfahrung && data.berufserfahrung.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Berufserfahrung</h3>
              <div className="space-y-4">
                {data.berufserfahrung.map((job, index) => (
                  <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{job.titel}</h4>
                      <span className="text-sm text-gray-600">
                        {formatDate(job.zeitraum_von)} - {formatDate(job.zeitraum_bis)}
                      </span>
                    </div>
                    <div className="text-green-600 font-medium mb-2">{job.unternehmen}, {job.ort}</div>
                    {job.beschreibung && (
                      <p className="text-gray-700 text-sm">{job.beschreibung}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Skills & Competencies */}
        {data.faehigkeiten && data.faehigkeiten.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-3 border-b-3 border-green-200 pb-3">
              <Stethoscope className="h-6 w-6" />
              Fähigkeiten & Kompetenzen
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {data.faehigkeiten.map((skill, index) => (
                <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                  <span className="text-sm font-medium text-gray-800">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.sprachen && data.sprachen.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-3 border-b-3 border-green-200 pb-3">
              <Globe className="h-6 w-6" />
              Sprachen
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {data.sprachen.map((lang, index) => (
                <div key={index} className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{lang.sprache}</span>
                    <span className="text-sm text-green-600 font-medium">{lang.niveau}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Availability & Preferences */}
        <section>
          <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-3 border-b-3 border-green-200 pb-3">
            <Clock className="h-6 w-6" />
            Verfügbarkeit & Präferenzen
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Arbeitszeiten</h4>
              <p className="text-sm text-gray-700">Vollzeit / Teilzeit</p>
              <p className="text-sm text-gray-700">Schichtbereitschaft</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Verfügbarkeit</h4>
              <p className="text-sm text-gray-700">Sofort verfügbar</p>
              <p className="text-sm text-gray-700">Flexibel einsetzbar</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PflegeClearLayout;