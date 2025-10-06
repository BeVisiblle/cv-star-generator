import { CVData } from './CVLayoutBase';
import { CVFormData } from '@/contexts/CVFormContext';

export function mapFormDataToCVData(formData: CVFormData): CVData {
  return {
    vorname: formData.vorname,
    nachname: formData.nachname,
    telefon: formData.telefon,
    email: formData.email,
    strasse: formData.strasse,
    hausnummer: formData.hausnummer,
    plz: formData.plz,
    ort: formData.ort,
    geburtsdatum: formData.geburtsdatum,
    profilbild: formData.profilbild,
    avatar_url: formData.avatar_url,
    has_drivers_license: formData.has_drivers_license,
    driver_license_class: formData.driver_license_class,
    status: formData.status,
    branche: formData.branche,
    ueberMich: formData.ueberMich || formData.bio,
    schulbildung: (formData.schulbildung || []).map(s => ({
      schulform: s.schulform,
      name: s.name,
      ort: s.ort,
      zeitraum_von: s.zeitraum_von,
      zeitraum_bis: s.zeitraum_bis,
      beschreibung: s.beschreibung,
    })),
    berufserfahrung: (formData.berufserfahrung || []).map(b => ({
      titel: b.titel,
      unternehmen: b.unternehmen,
      ort: b.ort,
      zeitraum_von: b.zeitraum_von,
      zeitraum_bis: b.zeitraum_bis,
      beschreibung: b.beschreibung,
    })),
    sprachen: (formData.sprachen || []).map(l => ({ sprache: l.sprache, niveau: l.niveau })),
    faehigkeiten: formData.faehigkeiten || [],
    qualifikationen: (formData.qualifikationen || []).map(q => ({ name: q, beschreibung: '' })),
    zertifikate: (formData.zertifikate || []).map(z => ({ name: z, anbieter: '', datum: '' })),
    weiterbildung: (formData.weiterbildung || []).map(w => ({
      titel: w.titel,
      anbieter: w.anbieter,
      ort: w.ort,
      zeitraum_von: w.zeitraum_von,
      zeitraum_bis: w.zeitraum_bis,
      beschreibung: w.beschreibung,
    })),
    interessen: formData.interessen || [],
  };
}
