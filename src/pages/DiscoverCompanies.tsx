import React, { useEffect } from "react";
import { CompanyRecommendations } from "@/components/linkedin/right-rail/CompanyRecommendations";

const DiscoverCompanies: React.FC = () => {
  useEffect(() => {
    document.title = "Unternehmen entdecken – Handwerk Netzwerk";
    const desc = "Finde interessante Unternehmen im Handwerk und entdecke neue Chancen.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = desc;
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Interessante Unternehmen</h1>
        <p className="text-muted-foreground">Erkunde Arbeitgeber und informiere dich über Branchen.</p>
      </header>
      <main>
        <CompanyRecommendations limit={12} showMore={false} />
      </main>
    </div>
  );
};

export default DiscoverCompanies;
