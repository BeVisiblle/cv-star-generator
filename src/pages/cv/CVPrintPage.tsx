"use client";
import React, { useEffect } from "react";
import OliviaSidebar from "@/components/cv/OliviaSidebar";
import OliviaMain from "@/components/cv/OliviaMain";
import { useCVForm } from '@/contexts/CVFormContext';
import { mapFormDataToCVData } from '@/components/cv-steps/CVStep6';
import { SidebarData } from '@/components/cv/OliviaSidebar';
import { OliviaMainData } from '@/components/cv/OliviaMain';
import { formatDate } from '@/components/cv-layouts/ClassicV2Layout';

export default function CVPrintPage() {
  const { formData } = useCVForm();

  // Map formData to OliviaSidebar and OliviaMain data structures
  const cvData = mapFormDataToCVData(formData);

  const sidebarData: SidebarData = {
    photoUrl: cvData.avatar_url || (cvData.profilbild instanceof File ? URL.createObjectURL(cvData.profilbild) : cvData.profilbild),
    personal: {
      birthdate: cvData.geburtsdatum,
      email: cvData.email,
      phone: cvData.telefon,
      address: cvData.strasse && cvData.hausnummer && cvData.plz && cvData.ort 
        ? `${cvData.strasse} ${cvData.hausnummer}, ${cvData.plz} ${cvData.ort}`
        : undefined
    },
    languages: cvData.sprachen?.map(sprache => ({
      name: sprache.sprache,
      level: sprache.niveau
    })) || [],
    skills: cvData.faehigkeiten && cvData.faehigkeiten.length > 0 ? [{
      name: 'Fähigkeiten',
      items: cvData.faehigkeiten
    }] : []
  };

  const mainData: OliviaMainData = {
    name: `${cvData.vorname || ''} ${cvData.nachname || ''}`.trim() || 'Vorname Nachname',
    jobTitle: cvData.aktueller_beruf || cvData.ausbildungsberuf || 'Jobbezeichnung erforderlich',
    aboutMe: cvData.ueberberuf || cvData.ueberMich,
    experience: cvData.berufserfahrung?.map(exp => ({
      role: exp.titel || exp.position || 'Position',
      company: exp.unternehmen || exp.firma || 'Unternehmen',
      location: exp.ort,
      start_fmt: formatDate(exp.zeitraum_von || exp.start_date) || 'Start',
      end_fmt: formatDate(exp.zeitraum_bis || exp.end_date) || 'Ende',
      bullets: exp.beschreibung ? exp.beschreibung.split('\n').filter(line => line.trim()).map(line => ({ text: line.trim() })) : []
    })) || [],
    education: cvData.schulbildung?.map(edu => ({
      degree: edu.schulform || 'Abschluss',
      institution: edu.name || 'Institution',
      location: edu.ort,
      start_fmt: edu.zeitraum_von || 'Start',
      end_fmt: edu.zeitraum_bis || 'Ende',
      field: edu.beschreibung
    })) || [],
    signature: {
      place_date: cvData.ort ? `${cvData.ort}, ${new Date().toLocaleDateString('de-DE')}` : undefined,
      name: `${cvData.vorname || ''} ${cvData.nachname || ''}`.trim()
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      // Optional: Schließt den Tab nach dem Drucken
      // window.close(); 
    }, 500); // Kurze Verzögerung, um das Rendering zu ermöglichen
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="cv-root" className="cv-a4">
      <div className="cv-page">
        <div className="cv-grid">
          <OliviaSidebar data={sidebarData} />
          <OliviaMain data={mainData} />
        </div>
      </div>
    </div>
  );
}
