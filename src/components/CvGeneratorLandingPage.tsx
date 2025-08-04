import { Button } from "@/components/ui/button";
import { Feature } from "@/components/Feature";
import { BranchCard } from "@/components/BranchCard";
import { Step } from "@/components/Step";

export default function CvGeneratorLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="text-center py-24 px-6 bg-hero-gradient">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-3xl mx-auto text-foreground">
          Mach keinen Lebenslauf. Mach Eindruck.
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-xl mx-auto text-muted-foreground">
          In 5 Minuten zum perfekten Azubi-CV – für Handwerk, IT oder Gesundheit. Kein Word. Kein Stress.
        </p>
        <Button variant="hero" size="xl" className="mt-8">
          🎯 Jetzt Lebenslauf erstellen
        </Button>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-semibold text-center mb-12 text-foreground">Warum unser Generator anders ist</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Feature icon="🛠️" title="Branchenangepasstes Layout" desc="Dein Design passt zu deinem Wunschjob – Handwerk, Gesundheit oder IT." />
          <Feature icon="🧠" title="Geführte Fragen" desc="Nur das, was wirklich zählt. Ohne Lebenslauf-Vorkenntnisse." />
          <Feature icon="🎨" title="Live-Vorschau & 5 Layouts" desc="Such dir den Stil, der zu dir passt – mit Echtzeit-Vorschau." />
          <Feature icon="🚀" title="Profil auf Knopfdruck" desc="PDF speichern oder direkt im System sichtbar werden." />
        </div>
      </section>

      {/* Branchen-Tabs */}
      <section className="bg-secondary py-20 px-6">
        <h2 className="text-3xl font-semibold text-center mb-12 text-foreground">Wähle deine Richtung</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <BranchCard
            emoji="👷"
            title="Handwerk"
            text="Zeig, was du kannst – auch ohne Berufserfahrung. Pünktlichkeit, Einsatz, Praxis sind gefragt."
          />
          <BranchCard
            emoji="💻"
            title="IT"
            text="Logisches Denken und digitales Interesse zählen mehr als Noten. Wir holen das Beste aus deinem Tech-Profil."
          />
          <BranchCard
            emoji="🩺"
            title="Gesundheit"
            text="Empathie, Sorgfalt, Verantwortung – das zählt bei dir. Wir bringen das in deinem CV rüber."
          />
        </div>
      </section>

      {/* Ablauf */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-semibold text-center mb-12 text-foreground">So einfach geht's</h2>
        <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          <Step number="1" text="Branche wählen" />
          <Step number="2" text="Fragen beantworten" />
          <Step number="3" text="Layout auswählen" />
          <Step number="4" text="PDF speichern" />
          <Step number="5" text="Optional: Profil erstellen" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-20 px-6 text-center">
        <h2 className="text-4xl font-bold">Starte jetzt. Und werde gefunden.</h2>
        <p className="mt-4 text-lg">Kein Login. Kein Bewerbungsterror. Nur du & dein Weg.</p>
        <Button variant="cta" size="xl" className="mt-8">
          💥 Jetzt Lebenslauf starten
        </Button>
      </section>
    </div>
  );
}