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
    margin = 10
  } = options;

  try {
    // Configure html2canvas options for better quality
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Determine page size in millimeters
    const pageDims = format === 'a4'
      ? { width: 210, height: 297 }
      : format === 'letter'
        ? { width: 216, height: 279 }
        : { width: 100, height: 200 }; // mobile phone-optimized page

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
    
    // If content fits on one page
    if (imgHeight <= usableHeight) {
      pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight);
    } else {
      // Handle multi-page PDFs
      let remainingHeight = imgHeight;
      let position = 0;
      
      while (remainingHeight > 0) {
        if (position > 0) {
          pdf.addPage(format === 'mobile' ? [pageDims.width, pageDims.height] : undefined);
        }
        
        const currentPageHeight = Math.min(usableHeight, remainingHeight);
        
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