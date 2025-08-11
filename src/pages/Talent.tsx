import React, { useEffect } from "react";
import BaseLayout from "@/components/layout/BaseLayout";
import Header from "@/components/marketing/Header";
import Hero from "@/components/marketing/Hero";
import FeatureTabs from "@/components/marketing/FeatureTabs";
import LogoGrid from "@/components/marketing/LogoGrid";
import SponsorGrid from "@/components/marketing/SponsorGrid";
import CompanyCards from "@/components/marketing/CompanyCards";
import PersonaSwitcher from "@/components/marketing/PersonaSwitcher";

export default function TalentPage() {
  useEffect(() => {
    document.title = "CV erstellen in Minuten | Talent-Plattform";
    const desc = "Generiere einen professionellen Lebenslauf, baue dein Netzwerk auf und werde von Unternehmen gefunden.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, []);

  return (
    <BaseLayout>
      <Header variant="talent" />
      <main>
        <Hero
          headlines={[
            "Erstelle deinen CV in Minuten",
            "Vernetze dich mit Profis aus deiner Branche",
            "Werde direkt von Unternehmen kontaktiert",
            "Tritt der am schnellsten wachsenden Talent-Community bei",
          ]}
          subtitle="Generiere einen professionellen Lebenslauf, baue dein Netzwerk auf und werde von Unternehmen gefunden – alles auf einer Plattform."
          primaryCta={{ label: "Jetzt CV erstellen", href: "/cv-generator" }}
          note="Keine Kreditkarte erforderlich."
        />

        <FeatureTabs
          title="Alles an einem Ort"
          subtitle="Werkzeuge, die dich sichtbar machen – und dich weiterbringen."
          items={[
            { title: "CV-Generator", description: "Erstelle in Minuten einen professionellen CV. Exportieren, teilen, jederzeit aktualisieren – ohne Designkenntnisse." },
            { title: "Austausch & Netzwerk", description: "Triff Peers, Mentoren und Branchenexpert:innen. Fragen stellen, Wissen teilen, voneinander lernen." },
            { title: "Kontaktiert werden", description: "Unternehmen melden sich direkt bei dir – passend zu deinem Profil." },
            { title: "Gruppen & Communities", description: "Tritt Gruppen nach Branche, Skills oder Interessen bei. Bleib aktuell und tausche dich aus." },
            { title: "Folgen & Interagieren (bald)", description: "Folge spannenden Profilen, Unternehmen und Leadern, um dein Netzwerk zu erweitern." },
          ]}
        />

        <LogoGrid
          title="6000+ Unternehmen vertrauen uns bereits"
          subtitle="Arbeitgeber entdecken, verbinden und stellen über unsere Plattform ein."
        />

        <SponsorGrid endpoint="/api/partners" />

        <CompanyCards
          title="Eine Lösung für jedes Unternehmen"
          subtitle="Vom ersten Azubi bis zum wachsenden Fachkräfteteam – wir sind bereit."
          items={[
            { title: "Versicherungen", text: "Präsentiere dich modern bei führenden Versicherern." },
            { title: "E‑Commerce", text: "Zeig deine Skills – direkt bei starken Online‑Marken." },
            { title: "Auto & Mobility", text: "Verbinde dich mit Händlern, Werkstätten und Innovatoren." },
            { title: "Recruiting", text: "Werde sichtbar für Agenturen und Recruiter." },
            { title: "Banking & Fintech", text: "Positioniere dich bei Banken und Finanzdienstleistern." },
            { title: "Bildung & Training", text: "Finde Chancen in Schulen, Trainingszentren und EdTech." },
          ]}
        />

        <PersonaSwitcher
          title="Die perfekte Lösung für dich"
          cta={{ label: "Jetzt starten", href: "/cv-generator" }}
          personas={[
            { key: "schueler", title: "Schüler", text: "Bau dein erstes Profil und entdecke Chancen, die du noch nicht kanntest." },
            { key: "azubi", title: "Azubi", text: "Dokumentiere Fortschritte, bleib vernetzt und plane deinen nächsten Schritt." },
            { key: "fachkraft", title: "Fachkraft", text: "Heb deine Skills hervor und vernetze dich mit Entscheider:innen." },
            { key: "manager", title: "Manager", text: "Baue Reichweite auf, fördere Talente und teile Expertise." },
          ]}
        />
      </main>
    </BaseLayout>
  );
}
