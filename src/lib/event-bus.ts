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
