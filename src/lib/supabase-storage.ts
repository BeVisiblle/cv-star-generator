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
  
  // Create a temporary canvas and convert to blob
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
  });

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

export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};