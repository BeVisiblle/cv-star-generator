import { supabase } from '@/integrations/supabase/client';
import type { CVFormData } from '@/contexts/CVFormContext';

export const syncCVDataToProfile = async (userId: string, formData: CVFormData) => {
  if (!userId || !formData) return;
  
  console.log('Syncing CV form data to profile:', formData);
  
  try {
    const profileData = {
      branche: formData.branche,
      status: formData.status,
      vorname: formData.vorname,
      nachname: formData.nachname,
      geburtsdatum: formData.geburtsdatum ? 
        (formData.geburtsdatum instanceof Date ? 
          formData.geburtsdatum.toISOString().split('T')[0] : 
          formData.geburtsdatum
        ) : null,
      strasse: formData.strasse,
      hausnummer: formData.hausnummer,
      plz: formData.plz,
      ort: formData.ort,
      telefon: formData.telefon,
      avatar_url: formData.avatar_url,
      has_drivers_license: formData.has_drivers_license || false,
      driver_license_class: formData.driver_license_class,
      has_own_vehicle: formData.has_own_vehicle || false,
      target_year: formData.target_year,
      visibility_industry: formData.visibility_industry || [],
      visibility_region: formData.visibility_region || [],
      headline: formData.headline,
      bio: formData.bio,
      schule: formData.schule,
      geplanter_abschluss: formData.geplanter_abschluss,
      abschlussjahr: formData.abschlussjahr,
      ausbildungsberuf: formData.ausbildungsberuf,
      ausbildungsbetrieb: formData.ausbildungsbetrieb,
      startjahr: formData.startjahr,
      voraussichtliches_ende: formData.voraussichtliches_ende,
      abschlussjahr_fachkraft: formData.abschlussjahr_fachkraft,
      aktueller_beruf: formData.aktueller_beruf,
      kenntnisse: formData.kenntnisse,
      motivation: formData.motivation,
      praktische_erfahrung: formData.praktische_erfahrung,
      sprachen: JSON.parse(JSON.stringify(formData.sprachen || [])),
      faehigkeiten: JSON.parse(JSON.stringify(formData.faehigkeiten || [])),
      schulbildung: JSON.parse(JSON.stringify(formData.schulbildung || [])),
      berufserfahrung: JSON.parse(JSON.stringify(formData.berufserfahrung || [])),
      layout: formData.layout || 1,
      uebermich: formData.ueberMich,
      einwilligung: formData.einwilligung,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    if (error) {
      console.error('Error syncing to profile:', error);
      throw error;
    } else {
      console.log('Successfully synced form data to profile');
    }
  } catch (error) {
    console.error('Unexpected error syncing to profile:', error);
    throw error;
  }
};

export const loadProfileDataToCV = (profile: any): Partial<CVFormData> => {
  if (!profile) return {};
  
  return {
    branche: profile.branche,
    status: profile.status,
    vorname: profile.vorname,
    nachname: profile.nachname,
    geburtsdatum: profile.geburtsdatum ? new Date(profile.geburtsdatum) : undefined,
    strasse: profile.strasse,
    hausnummer: profile.hausnummer,
    plz: profile.plz,
    ort: profile.ort,
    telefon: profile.telefon,
    email: profile.email,
    avatar_url: profile.avatar_url,
    has_drivers_license: profile.has_drivers_license,
    driver_license_class: profile.driver_license_class,
    has_own_vehicle: profile.has_own_vehicle,
    target_year: profile.target_year,
    visibility_industry: profile.visibility_industry,
    visibility_region: profile.visibility_region,
    headline: profile.headline,
    bio: profile.bio,
    schule: profile.schule,
    geplanter_abschluss: profile.geplanter_abschluss,
    abschlussjahr: profile.abschlussjahr,
    ausbildungsberuf: profile.ausbildungsberuf,
    ausbildungsbetrieb: profile.ausbildungsbetrieb,
    startjahr: profile.startjahr,
    voraussichtliches_ende: profile.voraussichtliches_ende,
    abschlussjahr_fachkraft: profile.abschlussjahr_fachkraft,
    aktueller_beruf: profile.aktueller_beruf,
    kenntnisse: profile.kenntnisse,
    motivation: profile.motivation,
    praktische_erfahrung: profile.praktische_erfahrung,
    sprachen: profile.sprachen || [],
    faehigkeiten: profile.faehigkeiten || [],
    schulbildung: profile.schulbildung || [],
    berufserfahrung: profile.berufserfahrung || [],
    layout: profile.layout || 1,
    ueberMich: profile.uebermich,
    einwilligung: profile.einwilligung
  };
};

export const regenerateCVFromProfile = async (userId: string, profile: any) => {
  if (!userId || !profile || !profile.vorname || !profile.nachname) return;
  
  try {
    // Import required modules for CV generation
    const { generateCVFromHTML, uploadCV } = await import('@/lib/supabase-storage');
    
    // Create CV data from profile
    const cvData = {
      branche: profile.branche || '',
      status: profile.status || '',
      vorname: profile.vorname || '',
      nachname: profile.nachname || '',
      geburtsdatum: profile.geburtsdatum || '',
      strasse: profile.strasse || '',
      hausnummer: profile.hausnummer || '',
      plz: profile.plz || '',
      ort: profile.ort || '',
      telefon: profile.telefon || '',
      email: profile.email || '',
      ueberMich: profile.uebermich || profile.bio || '',
      schulbildung: profile.schulbildung || [],
      berufserfahrung: profile.berufserfahrung || [],
      sprachen: profile.sprachen || [],
      faehigkeiten: profile.faehigkeiten || [],
      profilbild: profile.avatar_url || ''
    };

    // Create temporary container for CV rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.width = '210mm';
    tempContainer.style.minHeight = '297mm';
    document.body.appendChild(tempContainer);

    try {
      // Import and render the correct CV layout
      const BerlinLayout = await import('@/components/cv-layouts/BerlinLayout');
      let LayoutComponent = BerlinLayout.default;

      const layoutId = profile.layout || 1;
      switch (layoutId) {
        case 2:
          LayoutComponent = (await import('@/components/cv-layouts/MuenchenLayout')).default;
          break;
        case 3:
          LayoutComponent = (await import('@/components/cv-layouts/HamburgLayout')).default;
          break;
        case 4:
          LayoutComponent = (await import('@/components/cv-layouts/KoelnLayout')).default;
          break;
        case 5:
          LayoutComponent = (await import('@/components/cv-layouts/FrankfurtLayout')).default;
          break;
        case 6:
          LayoutComponent = (await import('@/components/cv-layouts/DuesseldorfLayout')).default;
          break;
      }

      // Render CV layout
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      
      const cvElement = React.createElement(LayoutComponent, { data: cvData });
      const root = ReactDOM.createRoot(tempContainer);
      root.render(cvElement);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the CV preview element
      const cvPreviewElement = tempContainer.querySelector('[data-cv-preview]') as HTMLElement;
      if (!cvPreviewElement) {
        throw new Error('CV preview element not found');
      }

      // Generate filename and create PDF file
      const { generateCVFilename } = await import('@/lib/pdf-generator');
      const filename = generateCVFilename(profile.vorname, profile.nachname);
      const pdfFile = await generateCVFromHTML(cvPreviewElement, filename);
      
      // Upload to Supabase
      const { url } = await uploadCV(pdfFile);
      
      // Update profile with new CV URL
      const { error } = await supabase
        .from('profiles')
        .update({ cv_url: url })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);
      
      console.log('CV successfully regenerated from profile');
    } catch (error) {
      // Clean up on error
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error regenerating CV from profile:', error);
    throw error;
  }
};