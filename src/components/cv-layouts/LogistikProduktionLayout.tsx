import React from 'react';
import { CVLayoutProps } from './CVLayoutBase';
import { cn } from '@/lib/utils';
import { Factory, Truck, Shield, Clock, Award, Phone, Mail, MapPin, Calendar, Settings } from 'lucide-react';

const LogistikProduktionLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
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
    <div className={cn("max-w-4xl mx-auto bg-white shadow-lg", className)} data-cv-preview>
      {/* Header - Industrial Gray/Blue */}
      <div className="bg-gradient-to-r from-gray-700 to-blue-700 text-white p-6">
        <div className="flex items-center gap-6">
          {/* Profile Image */}
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
            {data.profilbild || data.avatar_url ? (
              <img 
                src={typeof data.profilbild === 'string' ? data.profilbild : data.avatar_url} 
                alt="Profilbild" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                {data.vorname?.[0]}{data.nachname?.[0]}
              </div>
            )}
          </div>
          
          {/* Name and Title */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {data.vorname} {data.nachname}
            </h1>
            <div className="text-xl font-semibold mb-3">
              {data.status === 'azubi' ? 'Auszubildender' : 
               data.status === 'schueler' ? 'Schüler' : 
               data.status === 'ausgelernt' ? 'Fachkraft' : 'Bewerber'} 
              {data.branche && ` - ${data.branche.charAt(0).toUpperCase() + data.branche.slice(1)}`}
            </div>
            
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {data.telefon && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {data.telefon}
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {data.email}
                </div>
              )}
              {getFullAddress() && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {getFullAddress()}
                </div>
              )}
              {data.geburtsdatum && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(data.geburtsdatum)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Timeline Layout */}
      <div className="p-6 space-y-6">
        {/* About Me */}
        {data.ueberMich && (
          <section>
            <h2 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2 border-b-2 border-gray-300 pb-2">
              <Factory className="h-5 w-5" />
              Über mich
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {data.ueberMich}
            </p>
          </section>
        )}

        {/* Professional Experience Timeline */}
        {data.berufserfahrung && data.berufserfahrung.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2 border-b-2 border-gray-300 pb-2">
              <Truck className="h-5 w-5" />
              Berufserfahrung
            </h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              <div className="space-y-6">
                {data.berufserfahrung.map((job, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{job.titel}</h3>
                        <span className="text-sm text-gray-600">
                          {formatDate(job.zeitraum_von)} - {formatDate(job.zeitraum_bis)}
                        </span>
                      </div>
                      <div className="text-gray-600 font-medium mb-2">{job.unternehmen}, {job.ort}</div>
                      {job.beschreibung && (
                        <p className="text-gray-700 text-sm">{job.beschreibung}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education Timeline */}
        {data.schulbildung && data.schulbildung.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2 border-b-2 border-gray-300 pb-2">
              <Award className="h-5 w-5" />
              Ausbildung & Bildung
            </h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              <div className="space-y-6">
                {data.schulbildung.map((edu, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{edu.schulform}</h3>
                        <span className="text-sm text-gray-600">
                          {formatDate(edu.zeitraum_von)} - {formatDate(edu.zeitraum_bis)}
                        </span>
                      </div>
                      <div className="text-gray-600 font-medium mb-2">{edu.name}, {edu.ort}</div>
                      {edu.beschreibung && (
                        <p className="text-gray-700 text-sm">{edu.beschreibung}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skills & Certifications */}
        <div className="grid grid-cols-2 gap-6">
          {/* Skills */}
          {data.faehigkeiten && data.faehigkeiten.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Fähigkeiten & Maschinen
              </h3>
              <div className="space-y-2">
                {data.faehigkeiten.map((skill, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded border-l-4 border-gray-400 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.sprachen && data.sprachen.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Sprachen
              </h3>
              <div className="space-y-2">
                {data.sprachen.map((lang, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{lang.sprache}</span>
                      <span className="text-xs text-gray-600">{lang.niveau}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Safety & Availability */}
        <div className="grid grid-cols-2 gap-6">
          {/* Safety Certifications */}
          <section>
            <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sicherheit & Zertifikate
            </h3>
            <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-400">
              <div className="text-sm font-medium">Arbeitsschutz</div>
              <div className="text-xs text-gray-600">Grundunterweisung abgeschlossen</div>
              <div className="text-sm font-medium mt-2">Erste Hilfe</div>
              <div className="text-xs text-gray-600">Zertifikat vorhanden</div>
            </div>
          </section>

          {/* Availability */}
          <section>
            <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Verfügbarkeit & Schichten
            </h3>
            <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-400">
              <div className="text-sm font-medium">Arbeitszeit</div>
              <div className="text-xs text-gray-600">Vollzeit / Teilzeit</div>
              <div className="text-sm font-medium mt-2">Schichtbereitschaft</div>
              <div className="text-xs text-gray-600">Früh-, Spät-, Nachtschicht</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LogistikProduktionLayout;