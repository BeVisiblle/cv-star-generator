import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export default function Impressum() {
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
            Impressum
          </h1>
        </div>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Angaben gemäß § 5 TMG</h2>
            <div className="space-y-2">
              <p><strong>Ausbildungsbasis</strong></p>
              <p>[Ihr Name oder Firmenname]</p>
              <p>[Ihre Straße und Hausnummer]</p>
              <p>[PLZ und Ort]</p>
              <p>[Land]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Kontakt</h2>
            <div className="space-y-2">
              <p><strong>Telefon:</strong> [Ihre Telefonnummer]</p>
              <p><strong>E-Mail:</strong> info@ausbildungsbasis.de</p>
              <p><strong>Website:</strong> www.ausbildungsbasis.de</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Handelsregister</h2>
            <div className="space-y-2">
              <p><strong>Registergericht:</strong> [Zuständiges Amtsgericht]</p>
              <p><strong>Registernummer:</strong> [Handelsregisternummer]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br/>
              [Ihre USt-IdNr.]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <div className="space-y-2">
              <p>[Name des Verantwortlichen]</p>
              <p>[Adresse]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Haftungsausschluss</h2>
            
            <h3 className="text-xl font-medium mb-3 text-foreground">Haftung für Inhalte</h3>
            <p className="mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
              unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
              Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h3 className="text-xl font-medium mb-3 text-foreground">Haftung für Links</h3>
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
              Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h3 className="text-xl font-medium mb-3 text-foreground">Urheberrecht</h3>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
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