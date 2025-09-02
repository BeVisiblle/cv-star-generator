import { useEffect, useRef } from "react";

/** Equalizer: setzt alle .ab-card auf die Höhe der höchsten Karte (responsive). */
export function useEqualizeCards() {
  const ref = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;

    const apply = () => {
      const cards = Array.from(wrap.querySelectorAll<HTMLElement>(".ab-card"));
      
      // Batch DOM writes first
      requestAnimationFrame(() => {
        cards.forEach(c => (c.style.height = "auto"));
        
        // Then batch DOM reads in next frame to avoid forced reflow
        requestAnimationFrame(() => {
          const max = cards.reduce((m, c) => Math.max(m, c.offsetHeight), 0);
          cards.forEach(c => (c.style.height = `${max}px`));
        });
      });
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    window.addEventListener("resize", apply);
    
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);
  
  return ref;
}