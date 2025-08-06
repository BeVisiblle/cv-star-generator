import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export default function Datenschutz() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Zurück zur Startseite
          </Button>
          
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Datenschutzerklärung
          </h1>
          <p className="text-sm text-muted-foreground">
            Stand: {new Date().toLocaleDateString('de-DE')}
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Verantwortlicher</h2>
              <p>
                Verantwortlicher für die Datenverarbeitung auf dieser Website ist:<br/>
                Ausbildungsbasis<br/>
                [Ihre Adresse]<br/>
                [Ihre Kontaktdaten]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Erhebung und Speicherung personenbezogener Daten</h2>
              <h3 className="text-xl font-medium mb-3 text-foreground">2.1 Beim Besuch der Website</h3>
              <p>
                Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser 
                automatisch Informationen an den Server unserer Website gesendet. Diese Informationen werden 
                temporär in einem sog. Logfile gespeichert.
              </p>
              
              <h3 className="text-xl font-medium mb-3 text-foreground">2.2 Bei der Nutzung des CV Generators</h3>
              <p>
                Für die Erstellung Ihres Lebenslaufs erheben wir folgende Daten:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Persönliche Daten (Name, Adresse, Kontaktdaten)</li>
                <li>Berufliche Qualifikationen und Erfahrungen</li>
                <li>Bildungsweg und Abschlüsse</li>
                <li>Weitere freiwillige Angaben</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Zweck der Datenverarbeitung</h2>
              <p>
                Die Verarbeitung Ihrer personenbezogenen Daten erfolgt zu folgenden Zwecken:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Bereitstellung und Optimierung unserer Website</li>
                <li>Erstellung und Speicherung Ihres Lebenslaufs</li>
                <li>Matching mit passenden Unternehmen</li>
                <li>Kommunikation und Support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Ihre Rechte</h2>
              <p>
                Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Recht auf Auskunft</li>
                <li>Recht auf Berichtigung oder Löschung</li>
                <li>Recht auf Einschränkung der Verarbeitung</li>
                <li>Recht auf Widerspruch gegen die Verarbeitung</li>
                <li>Recht auf Datenübertragbarkeit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Kontakt</h2>
              <p>
                Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:<br/>
                E-Mail: datenschutz@ausbildungsbasis.de<br/>
                Telefon: [Ihre Telefonnummer]
              </p>
            </section>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button 
            onClick={() => navigate('/')}
            size="lg"
          >
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    </div>
  );
}