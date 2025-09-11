import React from 'react';
import { CVLayoutProps } from './CVLayoutBase';
import { cn } from '@/lib/utils';
import { GraduationCap, Briefcase, Star, Target, Phone, Mail, MapPin, Calendar, Award } from 'lucide-react';

const AzubiStartLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
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
      {/* Header - Youthful Blue/Purple */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center gap-6">
          {/* Profile Image */}
          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200">
            {data.profilbild || data.avatar_url ? (
              <img 
                src={typeof data.profilbild === 'string' ? data.profilbild : data.avatar_url} 
                alt="Profilbild" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-600">
                {data.vorname?.[0]}{data.nachname?.[0]}
              </div>
            )}
          </div>
          
          {/* Name and Title */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              {data.vorname} {data.nachname}
            </h1>
            <div className="text-lg font-semibold mb-3">
              {data.status === 'azubi' ? 'Auszubildender' : 
               data.status === 'schueler' ? 'Schüler' : 
               data.status === 'ausgelernt' ? 'Fachkraft' : 'Bewerber'}
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

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* About Me */}
        {data.ueberMich && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Über mich
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-gray-700 leading-relaxed">
                {data.ueberMich}
              </p>
            </div>
          </section>
        )}

        {/* Education */}
        {data.schulbildung && data.schulbildung.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Schulbildung
            </h2>
            <div className="space-y-3">
              {data.schulbildung.map((edu, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{edu.schulform}</h3>
                    <span className="text-sm text-gray-600">
                      {formatDate(edu.zeitraum_von)} - {formatDate(edu.zeitraum_bis)}
                    </span>
                  </div>
                  <div className="text-blue-600 font-medium mb-1">{edu.name}, {edu.ort}</div>
                  {edu.beschreibung && (
                    <p className="text-gray-700 text-sm">{edu.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Internships/Experience */}
        {data.berufserfahrung && data.berufserfahrung.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Praktika & Erfahrungen
            </h2>
            <div className="space-y-3">
              {data.berufserfahrung.map((job, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{job.titel}</h3>
                    <span className="text-sm text-gray-600">
                      {formatDate(job.zeitraum_von)} - {formatDate(job.zeitraum_bis)}
                    </span>
                  </div>
                  <div className="text-blue-600 font-medium mb-1">{job.unternehmen}, {job.ort}</div>
                  {job.beschreibung && (
                    <p className="text-gray-700 text-sm">{job.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Interests */}
        {data.faehigkeiten && data.faehigkeiten.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Fähigkeiten & Interessen
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.faehigkeiten.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.sprachen && data.sprachen.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Sprachen
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {data.sprachen.map((lang, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="font-semibold text-gray-800">{lang.sprache}</div>
                  <div className="text-sm text-blue-600">{lang.niveau}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Motivation & Goals */}
        <section>
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Motivation & Ziele
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-gray-700 text-sm">
              Ich bin motiviert, eine Ausbildung zu beginnen und mich in einem interessanten Berufsfeld zu entwickeln. 
              Meine Stärken liegen in der Teamarbeit, dem Lernen neuer Fähigkeiten und der Bereitschaft, Verantwortung zu übernehmen.
            </p>
          </div>
        </section>

        {/* Availability */}
        <section>
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Verfügbarkeit
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-800">Ausbildungsbeginn:</span>
                <span className="ml-2 text-gray-700">Sofort verfügbar</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Arbeitszeit:</span>
                <span className="ml-2 text-gray-700">Vollzeit</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AzubiStartLayout;