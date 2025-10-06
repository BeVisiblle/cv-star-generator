import React, { useState, useEffect } from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import BerlinLayout from '@/components/cv-layouts/BerlinLayout';
import MuenchenLayout from '@/components/cv-layouts/MuenchenLayout';
import HamburgLayout from '@/components/cv-layouts/HamburgLayout';
import KoelnLayout from '@/components/cv-layouts/KoelnLayout';
import FrankfurtLayout from '@/components/cv-layouts/FrankfurtLayout';
import DuesseldorfLayout from '@/components/cv-layouts/DuesseldorfLayout';
import { mapFormDataToCVData } from '@/components/cv-layouts/mapFormDataToCVData';
import { cn } from '@/lib/utils';
import '@/styles/cv.css';

const CVStep6 = () => {
  const { formData, setCurrentStep, isLayoutEditMode, setLayoutEditMode } = useCVForm();
  const navigate = useNavigate();
  const { profile } = useAuth();

  // DEBUG: Log formData on mount and when it changes
  useEffect(() => {
    console.log('🔵 CVStep6 - Current formData:', formData);
    console.log('🔵 CVStep6 - Layout value:', formData.layout);
    console.log('🔵 CVStep6 - Layout type:', typeof formData.layout);
    
    // Also check localStorage directly
    const savedData = localStorage.getItem('cvFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('🔵 CVStep6 - localStorage cvFormData:', parsed);
        console.log('🔵 CVStep6 - localStorage layout:', parsed.layout);
      } catch (e) {
        console.error('Error parsing localStorage:', e);
      }
    }
  }, [formData]);

  const selected = Number(formData.layout) || 1;
  const data = mapFormDataToCVData(formData);

  console.log('🔵 CVStep6 - Selected layout (after Number()):', selected);

  const LayoutComponent =
    selected === 2 ? MuenchenLayout :
    selected === 3 ? HamburgLayout :
    selected === 4 ? KoelnLayout :
    selected === 5 ? FrankfurtLayout :
    selected === 6 ? DuesseldorfLayout :
    BerlinLayout;

  console.log('🔵 CVStep6 - LayoutComponent:', LayoutComponent.name);

  const getLayoutName = () => {
    switch (selected) {
      case 1: return 'Berlin';
      case 2: return 'München';
      case 3: return 'Hamburg';
      case 4: return 'Köln';
      case 5: return 'Frankfurt';
      case 6: return 'Düsseldorf';
      default: return 'Berlin';
    }
  };

  const handleBackToLayout = () => setCurrentStep(5);

  const handleFinish = async () => {
    if (isLayoutEditMode && profile) {
      try {
        const { error } = await supabase.from('profiles')
          .update({ layout: Number(formData.layout) || 1 })
          .eq('id', profile.id);
        if (error) throw error;
        toast.success('Layout gespeichert');
        setLayoutEditMode(false);
        localStorage.removeItem('cvLayoutEditMode');
        navigate('/profile');
      } catch (e) {
        console.error(e);
        toast.error('Fehler beim Speichern');
      }
    } else {
      setCurrentStep(7);
    }
  };

  const handleGeneratePDF = () => {
    // Open print page in new window with layout and user data
    const params = new URLSearchParams({
      layout: String(selected),
      userId: profile?.id || ''
    });
    window.open(`/cv/print?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">CV-Vorschau</h2>
          <p className="text-sm text-muted-foreground">
            Layout: <strong>{getLayoutName()}</strong> (ID: {selected}) – Wenn alles passt, als PDF speichern.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleBackToLayout} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Layout ändern
          </Button>
          <Button 
            onClick={handleGeneratePDF} 
            className="w-full sm:w-auto"
            variant="secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Als PDF speichern
          </Button>
          <Button onClick={handleFinish} className="w-full sm:w-auto">
            {isLayoutEditMode ? 'Layout speichern' : 'Weiter zum Download'}
            {!isLayoutEditMode && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="cv-preview-surface">
          <div className="cv-preview-wrapper">
            <article data-cv-preview data-variant="a4" className={cn('cv-a4-page bg-white text-foreground')} aria-label="Lebenslauf Vorschau – A4">
              <LayoutComponent data={data} />
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVStep6;
