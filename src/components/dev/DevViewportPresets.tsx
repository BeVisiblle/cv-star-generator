import React, { useEffect, useState } from "react";
const isDev = typeof import.meta !== "undefined" && (import.meta as any).env?.DEV;
const presets = [320, 360, 390, 414, 430];
export const DevViewportPresets: React.FC = () => {
  const [w, setW] = useState<number | null>(null);
  useEffect(() => {
    if (!isDev) return;
    const width = localStorage.getItem("devViewportWidth");
    if (width) document.documentElement.style.setProperty("--dev-viewport-width", width + "px");
  }, []);
  if (!isDev) return null;
  return <div className="fixed z-[61] top-2 right-2 rounded-md border border-border bg-background text-foreground shadow-sm">
      
    </div>;
};
export default DevViewportPresets;