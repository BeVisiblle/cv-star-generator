import React from "react";

interface LogoGridProps {
  title: string;
  subtitle?: string;
}

export default function LogoGrid({ title, subtitle }: LogoGridProps) {
  const logos = [
    "/images/step1.jpg",
    "/images/step2.jpg",
    "/images/step3.jpg",
    "/images/step1-hero.jpg",
    "/images/step2.jpg",
    "/images/step3.jpg",
  ];
  return (
    <section className="py-10">
      <header className="mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {logos.map((src, idx) => (
          <div key={idx} className="h-16 rounded-md border bg-muted/30 flex items-center justify-center">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img src={src} alt={`Unternehmenslogo ${idx + 1}`} loading="lazy" decoding="async" className="h-10 object-contain grayscale hover:grayscale-0 transition" />
          </div>
        ))}
      </div>
    </section>
  );
}
