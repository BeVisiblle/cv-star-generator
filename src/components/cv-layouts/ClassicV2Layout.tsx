import React from 'react';
import { CVLayoutProps, getBrancheColors, getBrancheTitle, getStatusTitle } from './CVLayoutBase';
import { cn } from '@/lib/utils';
import OliviaSidebar, { SidebarData } from '@/components/cv/OliviaSidebar';
import OliviaMain, { OliviaMainData, Experience, Education } from '@/components/cv/OliviaMain';

const ClassicV2Layout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  const colors = getBrancheColors(data.branche);
  
  // Konvertiere CV-Daten zu Sidebar-Daten
  const getPhotoUrl = () => {
    if (data.avatar_url) return data.avatar_url;
    if (data.profilbild) {
      // Wenn es ein File-Objekt ist, erstelle eine URL
      if (data.profilbild instanceof File) {
        return URL.createObjectURL(data.profilbild);
      }
      // Wenn es bereits eine URL/String ist
      return data.profilbild;
    }
    return undefined;
  };

  const sidebarData: SidebarData = {
    photoUrl: getPhotoUrl(),
    personal: {
      birthdate: data.geburtsdatum,
      email: data.email,
      phone: data.telefon,
      address: data.strasse && data.hausnummer && data.plz && data.ort 
        ? `${data.strasse} ${data.hausnummer}, ${data.plz} ${data.ort}`
        : undefined
    },
    languages: data.sprachen?.map(sprache => ({
      name: sprache.sprache,
      level: sprache.niveau
    })) || [],
    skills: data.faehigkeiten && data.faehigkeiten.length > 0 ? [{
      name: 'Fähigkeiten',
      items: data.faehigkeiten
    }] : []
  };

  // Hilfsfunktion für Datumsformatierung MM-JJJJ
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    
    // Wenn es bereits im gewünschten Format ist, zurückgeben
    if (dateStr.match(/^\d{2}-\d{4}$/)) return dateStr;
    
    // Versuche verschiedene Datumsformate zu parsen
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Falls Parsing fehlschlägt, Original zurückgeben
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  };


  // Konvertiere CV-Daten zu OliviaMain-Daten
  const mainData: OliviaMainData = {
    name: `${data.vorname || ''} ${data.nachname || ''}`.trim() || 'Vorname Nachname',
    jobTitle: data.ueberMich || 'Jobbezeichnung erforderlich',
    aboutMe: data.ueberMich,
    experience: data.berufserfahrung?.map(exp => ({
      role: exp.titel || 'Position',
      company: exp.unternehmen || 'Unternehmen',
      location: exp.ort,
      start_fmt: formatDate(exp.zeitraum_von) || 'Start',
      end_fmt: formatDate(exp.zeitraum_bis) || 'Ende',
      bullets: exp.beschreibung ? exp.beschreibung.split('\n').filter(line => line.trim()).map(line => ({ text: line.trim() })) : []
    })) || [],
    education: data.schulbildung?.map(edu => ({
      degree: edu.schulform || 'Abschluss',
      institution: edu.name || 'Institution',
      location: edu.ort,
      start_fmt: edu.zeitraum_von || 'Start',
      end_fmt: edu.zeitraum_bis || 'Ende',
      field: edu.beschreibung
    })) || [],
    signature: {
      place_date: data.ort ? `${data.ort}, ${new Date().toLocaleDateString('de-DE')}` : undefined,
      name: `${data.vorname || ''} ${data.nachname || ''}`.trim()
    }
  };

  // Debug logging
  console.log('🔵 ClassicV2Layout - data:', data);
  console.log('🔵 ClassicV2Layout - profilbild:', data.profilbild);
  console.log('🔵 ClassicV2Layout - profilbild type:', typeof data.profilbild);
  console.log('🔵 ClassicV2Layout - profilbild instanceof File:', data.profilbild instanceof File);
  console.log('🔵 ClassicV2Layout - avatar_url:', data.avatar_url);
  console.log('🔵 ClassicV2Layout - photoUrl:', getPhotoUrl());
  console.log('🔵 ClassicV2Layout - sidebarData:', sidebarData);
  console.log('🔵 ClassicV2Layout - mainData:', mainData);

  return (
    <div 
      id="cv-A4"
      className="cv-a4 relative mx-auto bg-white" 
      style={{ 
        width: '794px', 
        height: '1123px',
        padding: '40px',
        boxSizing: 'border-box'
      }} 
      data-cv-preview
    >
      <div 
        className="grid h-full" 
        style={{ 
          gridTemplateColumns: "240px 1fr", 
          gap: '30px',
          boxSizing: 'border-box'
        }}
      >
        {/* Sidebar - links bündig, oben/unten bündig */}
        <div className="bg-[#F2EFEA]" style={{ height: '100%' }}>
          <OliviaSidebar data={sidebarData} />
        </div>
        
        {/* Main Content - mit optimiertem Padding */}
        <div className="pr-8" style={{ height: '100%' }}>
          <OliviaMain data={mainData} />
        </div>
      </div>
    </div>
  );
};

export default ClassicV2Layout;