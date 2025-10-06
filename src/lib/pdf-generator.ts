import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFGeneratorOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter' | 'mobile';
  margin?: number;
}

export const generatePDF = async (
  element: HTMLElement,
  options: PDFGeneratorOptions = {}
): Promise<void> => {
  const {
    filename = 'CV.pdf',
    quality = 2,
    format = 'a4',
    margin = 0  // No margin for full A4 coverage
  } = options;

  try {
    // Create a completely isolated CV container
    const cvContainer = document.createElement('div');
    cvContainer.style.position = 'fixed';
    cvContainer.style.left = '-10000px';
    cvContainer.style.top = '0';
    cvContainer.style.width = '794px';
    cvContainer.style.height = '1123px';
    cvContainer.style.backgroundColor = 'white';
    cvContainer.style.padding = '0';
    cvContainer.style.margin = '0';
    cvContainer.style.border = 'none';
    cvContainer.style.boxShadow = 'none';
    cvContainer.style.overflow = 'hidden';
    
    // Clone ONLY the CV content and remove any page-related elements
    const cvContent = element.cloneNode(true) as HTMLElement;
    
    // Remove any elements that might be page-related
    const elementsToRemove = cvContent.querySelectorAll('button, .btn, nav, header, footer, .navbar, .header, .footer, .progress-bar, .step-indicator, .cv-step, .cv-generator, .layout-selection, .back-button, .download-button');
    elementsToRemove.forEach(el => el.remove());
    
    // Set clean styles for the CV content
    cvContent.style.width = '100%';
    cvContent.style.height = '100%';
    cvContent.style.margin = '0';
    cvContent.style.padding = '0';
    cvContent.style.border = 'none';
    cvContent.style.boxShadow = 'none';
    cvContent.style.borderRadius = '0';
    cvContent.style.overflow = 'hidden';
    
    cvContainer.appendChild(cvContent);
    document.body.appendChild(cvContainer);
    
    // Clean up after PDF generation
    const cleanup = () => cvContainer.remove();
    
    const canvas = await html2canvas(cvContainer, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: cvContainer.offsetWidth,
      height: cvContainer.offsetHeight,
    });
    
    cleanup();

    // Determine page size in millimeters
    const pageDims = format === 'a4'
      ? { width: 210, height: 297 }
      : format === 'letter'
        ? { width: 216, height: 279 }
        : { width: 105, height: 148 }; // A6 portrait for mobile

    const usableWidth = pageDims.width - 2 * margin;
    const usableHeight = pageDims.height - 2 * margin;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      // Use custom array for mobile size, named preset for others
      format: format === 'mobile' ? [pageDims.width, pageDims.height] : format,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // For A4 format, always fit on one page
    if (format === 'a4') {
      pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight);
    } else {
      // Handle multi-page PDFs for other formats
      if (imgHeight <= usableHeight) {
        pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        let position = 0;
        
        while (remainingHeight > 0) {
          if (position > 0) {
            pdf.addPage(format === 'mobile' ? [pageDims.width, pageDims.height] : undefined);
          }
          
          pdf.addImage(
            imgData,
            'PNG',
            margin,
            margin - position,
            usableWidth,
            imgHeight
          );
          
          remainingHeight -= usableHeight;
          position += usableHeight;
        }
      }
    }

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('PDF generation failed');
  }
};

export const generateCVFilename = (
  firstName: string,
  lastName: string
): string => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const sanitizedFirstName = firstName.replace(/[^a-zA-Z0-9]/g, '');
  const sanitizedLastName = lastName.replace(/[^a-zA-Z0-9]/g, '');
  
  return `CV_${sanitizedFirstName}_${sanitizedLastName}_${date}.pdf`;
};

export const generatePDFFromCV = async (layoutId: number, userId: string, filename?: string): Promise<void> => {
  try {
    // Create temporary iframe to load CV print page
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);

    // Load CV print page in iframe
    const params = new URLSearchParams({
      layout: String(layoutId),
      userId: userId
    });
    
    return new Promise<void>((resolve, reject) => {
      iframe.onload = async () => {
        try {
          // Wait a bit for the CV to fully render
          await new Promise(r => setTimeout(r, 1500));

          const cvElement = iframe.contentDocument?.querySelector('[data-cv-preview]') as HTMLElement;
          if (!cvElement) {
            throw new Error('CV element not found');
          }

          // Generate canvas from CV element
          const canvas = await html2canvas(cvElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794, // A4 width in pixels (210mm at 96dpi)
            height: 1123 // A4 height in pixels (297mm at 96dpi)
          });

          // Calculate PDF dimensions (A4)
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Create PDF
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

          // Download PDF
          const pdfFilename = filename || `CV_${new Date().toISOString().split('T')[0]}.pdf`;
          pdf.save(pdfFilename);

          // Cleanup
          document.body.removeChild(iframe);
          resolve();
        } catch (error) {
          document.body.removeChild(iframe);
          reject(error);
        }
      };

      iframe.onerror = () => {
        document.body.removeChild(iframe);
        reject(new Error('Failed to load CV'));
      };

      iframe.src = `/cv/print?${params.toString()}`;
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};