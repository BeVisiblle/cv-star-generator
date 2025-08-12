import React, { useEffect } from "react";
import { PeopleRecommendations } from "@/components/linkedin/right-rail/PeopleRecommendations";

const DiscoverAzubis: React.FC = () => {
  useEffect(() => {
    document.title = "Azubi-Empfehlungen – Handwerk Netzwerk";
    const desc = "Finde vernetzte Azubis und Schüler: Empfehlungen, Profile und Vernetzen im Handwerk.";
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
        <h1 className="text-2xl md:text-3xl font-bold">Empfehlungen für Azubis</h1>
        <p className="text-muted-foreground">Entdecke spannende Profile und vernetze dich.</p>
      </header>
      <main>
        <PeopleRecommendations limit={12} showMore={false} />
      </main>
    </div>
  );
};

export default DiscoverAzubis;
