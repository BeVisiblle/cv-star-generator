import React, { useState, useEffect } from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import ModernLayout from '@/components/cv-layouts/ModernLayout';
import ClassicLayout from '@/components/cv-layouts/ClassicLayout';
import CreativeLayout from '@/components/cv-layouts/CreativeLayout';
import MinimalLayout from '@/components/cv-layouts/MinimalLayout';
import ProfessionalLayout from '@/components/cv-layouts/ProfessionalLayout';
import LiveCareerLayout from '@/components/cv-layouts/LiveCareerLayout';
import ClassicV2Layout from '@/components/cv-layouts/ClassicV2Layout';
import { mapFormDataToCVData } from '@/components/cv-layouts/mapFormDataToCVData';
import { cn } from '@/lib/utils';
import '@/styles/cv.css';

const CVStep6 = () => {
  const { formData, setCurrentStep, isLayoutEditMode, setLayoutEditMode } = useCVForm();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
    selected === 2 ? ClassicLayout :
    selected === 3 ? CreativeLayout :
    selected === 4 ? MinimalLayout :
    selected === 5 ? ProfessionalLayout :
    selected === 6 ? LiveCareerLayout :
    selected === 7 ? ClassicV2Layout :
    ModernLayout;

  console.log('🔵 CVStep6 - LayoutComponent:', LayoutComponent.name);

  const getLayoutName = () => {
    switch (selected) {
      case 1: return 'Modern';
      case 2: return 'Klassisch';
      case 3: return 'Kreativ';
      case 4: return 'Minimalistisch';
      case 5: return 'Professionell';
      case 6: return 'LiveCareer';
      case 7: return 'Klassisch V2';
      default: return 'Modern';
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

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Check if we have enough data to generate a CV
      if (!formData.vorname || !formData.nachname) {
        toast.error('Vor- und Nachname sind für die CV-Generierung erforderlich.');
        return;
      }

      console.log('🔵 Starting PDF generation with layout:', selected, getLayoutName());

      // Create temporary container for CV rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.width = '210mm';
      tempContainer.style.minHeight = '297mm';
      document.body.appendChild(tempContainer);

      // Create and render CV element with selected layout
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const cvElement = React.createElement(LayoutComponent, { data });
      const root = ReactDOM.createRoot(tempContainer);
      root.render(cvElement);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Find ONLY the CV preview element (not the whole page!)
      const cvPreviewElement = tempContainer.querySelector('[data-cv-preview]') as HTMLElement;
      if (!cvPreviewElement) {
        console.error('❌ CV preview not found in container');
        throw new Error('CV preview element not found');
      }

      console.log('✅ CV element found, generating PDF...');

      // Generate PDF from ONLY the CV element
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(cvPreviewElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Download PDF
      const filename = `CV_${formData.vorname}_${formData.nachname}_${getLayoutName()}.pdf`;
      pdf.save(filename);

      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);

      console.log('✅ PDF generated successfully:', filename);

      toast.success(`CV erfolgreich erstellt: ${filename}`);
    } catch (error: any) {
      console.error('❌ Error generating CV:', error);
      toast.error(error.message || 'Es gab ein Problem beim Erstellen der PDF-Datei.');
    } finally {
      setIsGeneratingPDF(false);
    }
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
            disabled={isGeneratingPDF}
            className="w-full sm:w-auto"
            variant="secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? 'Wird erstellt...' : 'Als PDF speichern'}
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
