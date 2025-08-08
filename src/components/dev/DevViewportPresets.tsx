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

  return (
    <div className="fixed z-[61] top-2 right-2 rounded-md border border-border bg-background text-foreground shadow-sm">
      <select
        aria-label="Viewport preset"
        className="h-9 min-h-[44px] px-2 bg-transparent"
        value={w ?? ''}
        onChange={(e) => {
          const val = Number(e.target.value);
          setW(val);
          if (val) {
            document.documentElement.style.setProperty("--dev-viewport-width", `${val}px`);
            localStorage.setItem("devViewportWidth", String(val));
          } else {
            document.documentElement.style.removeProperty("--dev-viewport-width");
            localStorage.removeItem("devViewportWidth");
          }
        }}
      >
        <option value="">Viewport</option>
        {presets.map((p) => (
          <option key={p} value={p}>{p}px</option>
        ))}
      </select>
    </div>
  );
};

export default DevViewportPresets;
