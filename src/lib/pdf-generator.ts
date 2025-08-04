import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFGeneratorOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter';
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

    // PDF dimensions (A4: 210 x 297 mm)
    const imgWidth = format === 'a4' ? 190 : 200; // Accounting for margins
    const pageHeight = format === 'a4' ? 287 : 260; // Accounting for margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
      unit: 'mm',
      format: format,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // If content fits on one page
    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    } else {
      // Handle multi-page PDFs
      let remainingHeight = imgHeight;
      let position = 0;
      
      while (remainingHeight > 0) {
        if (position > 0) {
          pdf.addPage();
        }
        
        const currentPageHeight = Math.min(pageHeight, remainingHeight);
        
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin - position,
          imgWidth,
          imgHeight
        );
        
        remainingHeight -= pageHeight;
        position += pageHeight;
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