import React from 'react';
import { cn } from '@/lib/utils';
import { Wrench, Award, Car, Wrench as Tool, Shield, Clock, MapPin, Phone, Mail, Calendar } from 'lucide-react';

interface CVData {
  vorname?: string;
  nachname?: string;
  telefon?: string;
  email?: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  ort?: string;
  geburtsdatum?: Date | string;
  profilbild?: File | string;
  avatar_url?: string;
  has_drivers_license?: boolean;
  driver_license_class?: string;
  status?: 'schueler' | 'azubi' | 'ausgelernt';
  branche?: 'handwerk' | 'it' | 'gesundheit' | 'buero' | 'verkauf' | 'gastronomie' | 'bau';
  ueberMich?: string;
  schulbildung?: Array<{
    schulform: string;
    name: string;
    ort: string;
    zeitraum_von: string;
    zeitraum_bis: string;
    beschreibung?: string;
  }>;
  berufserfahrung?: Array<{
    titel: string;
    unternehmen: string;
    ort: string;
    zeitraum_von: string;
    zeitraum_bis: string;
    beschreibung?: string;
  }>;
  sprachen?: Array<{
    sprache: string;
    niveau: string;
  }>;
  faehigkeiten?: string[];
}

interface CVLayoutProps {
  data: CVData;
  className?: string;
}

const HandwerkClassicLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
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
      {/* Header - Handwerk Orange/Blue */}
      <div className="bg-gradient-to-r from-orange-600 to-blue-600 text-white p-6">
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

      {/* Main Content - 2 Column Layout */}
      <div className="flex">
        {/* Left Column - 65% */}
        <div className="w-[65%] p-6 space-y-6">
          {/* About Me */}
          {data.ueberMich && (
            <section>
              <h2 className="text-xl font-bold text-orange-600 mb-3 flex items-center gap-2 border-b-2 border-orange-200 pb-2">
                <Wrench className="h-5 w-5" />
                Über mich
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.ueberMich}
              </p>
            </section>
          )}

          {/* Professional Experience */}
          {data.berufserfahrung && data.berufserfahrung.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-orange-600 mb-3 flex items-center gap-2 border-b-2 border-orange-200 pb-2">
                <Tool className="h-5 w-5" />
                Berufserfahrung
              </h2>
              <div className="space-y-4">
                {data.berufserfahrung.map((job, index) => (
                  <div key={index} className="border-l-4 border-orange-300 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-800">{job.titel}</h3>
                      <span className="text-sm text-gray-600">
                        {formatDate(job.zeitraum_von)} - {formatDate(job.zeitraum_bis)}
                      </span>
                    </div>
                    <div className="text-orange-600 font-medium mb-1">{job.unternehmen}, {job.ort}</div>
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
              <h2 className="text-xl font-bold text-orange-600 mb-3 flex items-center gap-2 border-b-2 border-orange-200 pb-2">
                <Award className="h-5 w-5" />
                Ausbildung & Bildung
              </h2>
              <div className="space-y-4">
                {data.schulbildung.map((edu, index) => (
                  <div key={index} className="border-l-4 border-orange-300 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-800">{edu.schulform}</h3>
                      <span className="text-sm text-gray-600">
                        {formatDate(edu.zeitraum_von)} - {formatDate(edu.zeitraum_bis)}
                      </span>
                    </div>
                    <div className="text-orange-600 font-medium mb-1">{edu.name}, {edu.ort}</div>
                    {edu.beschreibung && (
                      <p className="text-gray-700 text-sm">{edu.beschreibung}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - 35% */}
        <div className="w-[35%] bg-gray-50 p-6 space-y-6">
          {/* Skills */}
          {data.faehigkeiten && data.faehigkeiten.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fähigkeiten & Tools
              </h3>
              <div className="space-y-2">
                {data.faehigkeiten.map((skill, index) => (
                  <div key={index} className="bg-white p-2 rounded border-l-4 border-orange-400 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.sprachen && data.sprachen.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sprachen
              </h3>
              <div className="space-y-2">
                {data.sprachen.map((lang, index) => (
                  <div key={index} className="bg-white p-2 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{lang.sprache}</span>
                      <span className="text-xs text-gray-600">{lang.niveau}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Driver's License */}
          {data.has_drivers_license && (
            <section>
              <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Führerschein
              </h3>
              <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                <div className="text-sm font-medium">
                  Klasse {data.driver_license_class || 'B'}
                </div>
                <div className="text-xs text-gray-600">Verfügbar</div>
              </div>
            </section>
          )}

          {/* Availability */}
          <section>
            <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Verfügbarkeit
            </h3>
            <div className="bg-white p-3 rounded border-l-4 border-orange-400">
              <div className="text-sm font-medium">Sofort verfügbar</div>
              <div className="text-xs text-gray-600">Vollzeit / Teilzeit</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HandwerkClassicLayout;