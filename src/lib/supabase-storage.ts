import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
}

export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string = ''
): Promise<UploadResult> => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicData.publicUrl,
    path: data.path
  };
};

export const uploadProfileImage = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, 'profile-images', 'avatars');
};

export const uploadCoverImage = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, 'profile-images', 'covers');
};

export const uploadCV = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, 'cvs');
};

export const generateCVFromHTML = async (
  element: HTMLElement,
  filename: string
): Promise<File> => {
  const { generatePDF } = await import('@/lib/pdf-generator');
  
  // Prepare a clean offscreen clone to avoid scaled transforms
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

  const cleanup: Array<() => void> = [];

  const style = document.createElement('style');
  style.textContent = `
    .pdf-clone, .pdf-clone * {
      transform: none !important;
      animation: none !important;
      transition: none !important;
      filter: none !important;
    }
  `;
  document.head.appendChild(style);
  cleanup.push(() => style.remove());

  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.add('pdf-clone');
  clone.style.position = 'fixed';
  clone.style.left = '-10000px';
  clone.style.top = '0';
  clone.style.maxWidth = 'none';
  clone.style.width = `${element.scrollWidth || element.clientWidth}px`;
  (clone.style as any).zoom = '1';
  clone.style.transform = 'none';
  document.body.appendChild(clone);
  cleanup.push(() => clone.remove());

  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: clone.scrollWidth,
    height: clone.scrollHeight,
    logging: false,
  });

  cleanup.forEach((fn) => fn());

  // Create PDF blob
  const imgWidth = 190;
  const pageHeight = 287;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  } else {
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
        10,
        10 - position,
        imgWidth,
        imgHeight
      );
      
      remainingHeight -= pageHeight;
      position += pageHeight;
    }
  }

  // Convert PDF to blob and then to File
  const pdfBlob = pdf.output('blob');
  return new File([pdfBlob], filename, { type: 'application/pdf' });
};

export const uploadCVWithFilename = async (file: File, filename: string): Promise<UploadResult> => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const path = `${user.id}/${filename}`;
  const { data, error } = await supabase.storage
    .from('cvs')
    .upload(path, file, { upsert: true });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from('cvs')
    .getPublicUrl(data.path);

  return {
    url: publicData.publicUrl,
    path: data.path
  };
};

export const generateCVVariantFile = async (
  element: HTMLElement,
  filename: string,
  variant: 'mobile' | 'a4'
): Promise<File> => {
  // Create a temporary canvas and convert to blob
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

  // Prepare a clean offscreen clone to avoid scaled transforms
  const cleanup: Array<() => void> = [];

  const style = document.createElement('style');
  style.textContent = `
    .pdf-clone, .pdf-clone * {
      transform: none !important;
      animation: none !important;
      transition: none !important;
      filter: none !important;
    }
    .pdf-clone {
      position: fixed !important;
      left: -10000px !important;
      top: 0 !important;
      max-width: none !important;
      width: auto !important;
      height: auto !important;
      background: white !important;
      border: none !important;
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(style);
  cleanup.push(() => style.remove());

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
  cleanup.push(() => cvContainer.remove());

  const canvas = await html2canvas(cvContainer, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: cvContainer.offsetWidth,
    height: cvContainer.offsetHeight,
    logging: false,
  });

  cleanup.forEach((fn) => fn());

  // Page dimensions in mm
  const pageDims = variant === 'a4'
    ? { width: 210, height: 297, margin: 0 }  // No margin for full A4 coverage
    : { width: 105, height: 148, margin: 0 }; // No margin for mobile

  const usableWidth = pageDims.width - 2 * pageDims.margin;
  const usableHeight = pageDims.height - 2 * pageDims.margin;
  
  // Calculate image dimensions to fit perfectly in A4
  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * usableWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: variant === 'a4' ? 'a4' : [pageDims.width, pageDims.height],
  });

  const imgData = canvas.toDataURL('image/png', 1.0);

  // Always fit the entire CV on one page for A4
  if (variant === 'a4') {
    pdf.addImage(imgData, 'PNG', pageDims.margin, pageDims.margin, imgWidth, imgHeight);
  } else {
    // For mobile, handle multi-page if needed
    if (imgHeight <= usableHeight) {
      pdf.addImage(imgData, 'PNG', pageDims.margin, pageDims.margin, imgWidth, imgHeight);
    } else {
      let remainingHeight = imgHeight;
      let position = 0;

      while (remainingHeight > 0) {
        if (position > 0) {
          pdf.addPage([pageDims.width, pageDims.height]);
        }

        pdf.addImage(
          imgData,
          'PNG',
          pageDims.margin,
          pageDims.margin - position,
          imgWidth,
          imgHeight
        );

        remainingHeight -= usableHeight;
        position += usableHeight;
      }
    }
  }

  const pdfBlob = pdf.output('blob');
  return new File([pdfBlob], filename, { type: 'application/pdf' });
};

export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};