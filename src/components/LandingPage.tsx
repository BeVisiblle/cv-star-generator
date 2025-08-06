import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import step1HeroImage from '/images/step1-hero.jpg';
import step1Image from '/images/step1.jpg';
import step2Image from '/images/step2.jpg';
import step3Image from '/images/step3.jpg';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold">Ausbildungsbasis – Dein Weg zur Ausbildung oder Fachkraftstelle</h2>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <section className="text-center py-16">
          <img 
            src={step1HeroImage} 
            alt="CV Generator Step 1 Vorschau" 
            className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg mb-8"
          />
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-foreground">
            In wenigen Minuten zum Lebenslauf – und direkt gefunden werden.
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
            Erstelle kostenlos deinen Lebenslauf mit unserem CV Generator. Danach wirst du direkt von passenden Unternehmen kontaktiert – ohne klassische Bewerbung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              size="lg"
              onClick={() => navigate('/cv-generator')}
              className="text-lg px-8 py-6"
            >
              Jetzt Lebenslauf erstellen
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6"
            >
              Zum Login
            </Button>
          </div>
        </section>

        {/* So einfach funktioniert's */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">So einfach funktioniert's:</h2>
          
          {/* Step 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-16">
            <img 
              src={step1Image} 
              alt="Step 1" 
              className="w-full lg:w-1/2 rounded-xl shadow-md"
            />
            <div className="w-full lg:w-1/2">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">1. Daten eingeben</h3>
              <p className="text-lg text-muted-foreground">
                Wähle deine Branche, gib persönliche Infos ein – ganz ohne komplizierte Formulare.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-8 mb-16">
            <img 
              src={step2Image} 
              alt="Step 2" 
              className="w-full lg:w-1/2 rounded-xl shadow-md"
            />
            <div className="w-full lg:w-1/2">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">2. Automatisch CV generieren lassen</h3>
              <p className="text-lg text-muted-foreground">
                Mit nur einem Klick erstellt unser Generator deinen perfekten Lebenslauf.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-16">
            <img 
              src={step3Image} 
              alt="Step 3" 
              className="w-full lg:w-1/2 rounded-xl shadow-md"
            />
            <div className="w-full lg:w-1/2">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">3. Gefunden werden statt bewerben</h3>
              <p className="text-lg text-muted-foreground">
                Dein Profil erscheint in unserer Matching-Datenbank – Unternehmen finden dich.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="text-center py-16 bg-secondary rounded-2xl mb-16">
          <h2 className="text-3xl font-bold mb-4 text-foreground">💡 Mehr erfahren</h2>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/blog')}
            className="text-lg"
          >
            Jetzt Blogartikel lesen über Bewerbungen & Ausbildungswechsel →
          </Button>
        </section>

        {/* Target Groups */}
        <section className="py-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Für Unternehmen */}
            <div className="text-center p-8 bg-card rounded-2xl shadow-md border border-border">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">👥 Für Unternehmen</h2>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/unternehmen')}
                className="text-lg"
              >
                Infos & Zugang zur Azubi-Datenbank
              </Button>
            </div>

            {/* Für Schüler */}
            <div className="text-center p-8 bg-card rounded-2xl shadow-md border border-border">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">🙋 Für Schüler, Azubis & Gesellen</h2>
              <Button 
                variant="default" 
                size="lg"
                onClick={() => navigate('/cv-generator')}
                className="text-lg"
              >
                Jetzt Lebenslauf starten und gefunden werden
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-8 px-6 text-center mt-16">
        <div className="max-w-6xl mx-auto">
          <p>&copy; 2025 Ausbildungsbasis | 
            <Button variant="link" onClick={() => navigate('/datenschutz')} className="mx-2">
              Datenschutz
            </Button> | 
            <Button variant="link" onClick={() => navigate('/impressum')} className="mx-2">
              Impressum
            </Button>
          </p>
        </div>
      </footer>
    </div>
  );
}