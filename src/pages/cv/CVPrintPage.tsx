import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

import ModernLayout from '@/components/cv-layouts/ModernLayout';
import ClassicLayout from '@/components/cv-layouts/ClassicLayout';
import CreativeLayout from '@/components/cv-layouts/CreativeLayout';
import MinimalLayout from '@/components/cv-layouts/MinimalLayout';
import ProfessionalLayout from '@/components/cv-layouts/ProfessionalLayout';
import LiveCareerLayout from '@/components/cv-layouts/LiveCareerLayout';
import ClassicV2Layout from '@/components/cv-layouts/ClassicV2Layout';
import OliviaLayout from '@/components/cv-layouts/OliviaLayout';
import JohannaLayout from '@/components/cv-layouts/JohannaLayout';
import KatharinaLayout from '@/components/cv-layouts/KatharinaLayout';
import '@/styles/cv.css';

export default function CVPrintPage() {
  const [searchParams] = useSearchParams();
  const [cvData, setCvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const layoutId = Number(searchParams.get('layout')) || 1;
  const userId = searchParams.get('userId');

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (profile) {
          // Convert profile to CVData format
          const cvData = {
            vorname: profile.vorname,
            nachname: profile.nachname,
            telefon: profile.telefon,
            email: profile.email,
            strasse: profile.strasse,
            hausnummer: profile.hausnummer,
            plz: profile.plz,
            ort: profile.ort,
            geburtsdatum: profile.geburtsdatum ? new Date(profile.geburtsdatum) : undefined,
            profilbild: profile.avatar_url,
            avatar_url: profile.avatar_url,
            has_drivers_license: profile.has_drivers_license,
            driver_license_class: profile.driver_license_class,
            status: profile.status,
            branche: profile.branche,
            ueberMich: profile.uebermich || profile.bio,
            schulbildung: profile.schulbildung || [],
            berufserfahrung: profile.berufserfahrung || [],
            sprachen: profile.sprachen || [],
            faehigkeiten: profile.faehigkeiten || [],
            qualifikationen: [],
            zertifikate: [],
            weiterbildung: [],
            interessen: []
          };
          setCvData(cvData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Keine CV-Daten gefunden</p>
      </div>
    );
  }

  const LayoutComponent =
    layoutId === 2 ? ClassicLayout :
    layoutId === 3 ? CreativeLayout :
    layoutId === 4 ? MinimalLayout :
    layoutId === 5 ? ProfessionalLayout :
    layoutId === 6 ? LiveCareerLayout :
    layoutId === 7 ? ClassicV2Layout :
    layoutId === 8 ? OliviaLayout :
    layoutId === 9 ? JohannaLayout :
    layoutId === 10 ? KatharinaLayout :
    ModernLayout;

  return (
    <div className="cv-print-container">
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .cv-print-container {
            width: 210mm;
            min-height: 297mm;
          }
        }
        .cv-print-container {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          padding: 0;
        }
      `}</style>
      <article 
        data-cv-preview 
        data-variant="a4" 
        className="cv-a4-page bg-white text-foreground"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        <LayoutComponent data={cvData} />
      </article>
    </div>
  );
}
