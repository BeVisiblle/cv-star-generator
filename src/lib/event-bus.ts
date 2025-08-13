export const openPostComposer = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-post-composer'));
  }
};

export const subscribeOpenPostComposer = (handler: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const listener = () => handler();
  window.addEventListener('open-post-composer', listener);
  return () => window.removeEventListener('open-post-composer', listener);
};

// Mobile quick actions: CV download/edit and document upload
export const openCvDownload = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cv-download'));
  }
};

export const subscribeOpenCvDownload = (handler: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const listener = () => handler();
  window.addEventListener('open-cv-download', listener);
  return () => window.removeEventListener('open-cv-download', listener);
};

export const openCvEdit = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cv-edit'));
  }
};

export const subscribeOpenCvEdit = (handler: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const listener = () => handler();
  window.addEventListener('open-cv-edit', listener);
  return () => window.removeEventListener('open-cv-edit', listener);
};

export const openDocUpload = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-doc-upload'));
  }
};

export const subscribeOpenDocUpload = (handler: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const listener = () => handler();
  window.addEventListener('open-doc-upload', listener);
  return () => window.removeEventListener('open-doc-upload', listener);
};