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
    quality = 2.5, // Enhanced quality for crisp text
    format = 'a4',
    margin = 10
  } = options;

  try {
    // Enhanced CSS injection for print optimization
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .page-break-inside-avoid { 
          break-inside: avoid !important; 
          page-break-inside: avoid !important;
        }
        .page-break-before { 
          break-before: page !important; 
          page-break-before: always !important;
        }
        .page-break-after { 
          break-after: page !important; 
          page-break-after: always !important;
        }
        .columns-2 {
          column-count: 2 !important;
          column-gap: 1rem !important;
        }
        .break-inside-avoid {
          break-inside: avoid !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Enhanced html2canvas configuration for professional PDF quality
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      imageTimeout: 15000, // Longer timeout for complex layouts
      removeContainer: true,
      foreignObjectRendering: false, // Better compatibility
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    // Remove injected styles
    document.head.removeChild(style);

    // Optimized PDF dimensions for A4 format
    const imgWidth = format === 'a4' ? 190 : 200; // 190mm for A4 with margins
    const pageHeight = format === 'a4' ? 277 : 250; // 277mm for A4 content area
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format,
      compress: true // Enable compression for smaller file size
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98); // JPEG for better compression
    
    // Smart page break logic for CV content
    if (imgHeight <= pageHeight) {
      // Single page - center content if needed
      const yOffset = imgHeight < pageHeight ? (pageHeight - imgHeight) / 4 : 0;
      pdf.addImage(imgData, 'JPEG', margin, margin + yOffset, imgWidth, imgHeight);
    } else {
      // Multi-page handling with intelligent breaks
      const maxPages = 2; // Limit to 2 pages as per requirements
      const pageCount = Math.min(Math.ceil(imgHeight / pageHeight), maxPages);
      
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        const yPosition = -pageIndex * pageHeight;
        const remainingHeight = imgHeight - (pageIndex * pageHeight);
        const currentPageContentHeight = Math.min(pageHeight, remainingHeight);
        
        // Add page content with proper positioning
        pdf.addImage(
          imgData,
          'JPEG',
          margin,
          margin + yPosition,
          imgWidth,
          imgHeight
        );
        
        // Add subtle page separator for multi-page CVs
        if (pageIndex < pageCount - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.1);
        }
      }
    }

    // Save with enhanced metadata
    pdf.setProperties({
      title: `CV - ${filename.replace('.pdf', '')}`,
      subject: 'Curriculum Vitae',
      author: 'CV Generator',
      creator: 'LiveCareer Layout'
    });

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