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
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Angaben gemäß § 5 Digitale-Dienste-Gesetz</h2>
            <div className="space-y-2">
              <p><strong>Name des Anbieters:</strong> Morawe Ventures GbR</p>
              <p><strong>Rechtsform, Registrierung, Sitz:</strong> Die Morawe Ventures GbR ist eine Gesellschaft bürgerlichen Rechts nach den Vorschriften des Bürgerlichen Gesetzbuches mit Sitz in Schmitten, Deutschland.</p>
              <p><strong>Umsatzsteuer-Identifikationsnummer (§ 27a des Umsatzsteuergesetzes):</strong> DE 360924411</p>
              <p><strong>Vertretung durch Geschäftsführer:</strong> Todd Morawe, Tom Morawe</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Postanschrift</h2>
            <div className="space-y-2">
              <p>Leiweg 24</p>
              <p>61389 Schmitten</p>
              <p>Deutschland</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Kontaktdaten</h2>
            <div className="space-y-2">
              <p><strong>E-Mail:</strong> Info@Ausbildungsbasis.de</p>
              <p><strong>Website:</strong> www.Ausbildungsbasis.de</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Weitere Angaben</h2>
            <p className="mb-4">
              Für von uns erbrachte Leistungen gelten unsere AGB. Sie finden Sie unter https://ausbildungsbasis.de/agb/ . 
              Darin ist geregelt, dass deutsches Recht Anwendung findet und dass, soweit zulässig, als Gerichtsstand 
              Frankfurt am Main vereinbart wird.
            </p>
            <p>
              <strong>Hinweis zur OS-Plattform:</strong> Wir sind aufgrund von Art. 14 Abs. 1 der Verordnung (EU) 524/2013 
              über Online-Streitbeilegung in Verbraucherangelegenheiten (ODR-Verordnung) gesetzlich verpflichtet, Sie auf 
              die Europäische Online-Streitbeilegungs-Plattform der Europäischen Kommission hinzuweisen. Sie können diese 
              unter http://ec.europa.eu/odr erreichen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Haftung</h2>
            <p className="mb-4">
              Wir sind für die Inhalte unserer Internetseiten nach den Maßgaben der allgemeinen Gesetze verantwortlich. 
              Alle Inhalte werden mit der gebotenen Sorgfalt und nach bestem Wissen erstellt und dienen lediglich rein 
              informativen Zwecken. Soweit wir auf unseren Internetseiten mittels Hyperlinks auf Internetseiten Dritter 
              verweisen, können wir keine Gewähr für die fortwährende Aktualität, Richtigkeit und Vollständigkeit der 
              verlinkten Inhalte übernehmen, da diese Inhalte außerhalb unseres Verantwortungsbereichs liegen und wir auf 
              die zukünftige Gestaltung keinen Einfluss haben. Sollten aus Ihrer Sicht Inhalte gegen geltendes Recht 
              verstoßen oder unangemessen sein, teilen Sie uns dies bitte mit.
            </p>
            <p>
              Die rechtlichen Hinweise auf dieser Seite sowie alle Fragen und Streitigkeiten im Zusammenhang mit der 
              Gestaltung dieser Internetseite unterliegen dem Recht der Bundesrepublik Deutschland.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Datenschutz</h2>
            <p>
              Unsere Datenschutzhinweise finden Sie unter https://ausbildungsbasis.de/datenschutz/ .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Urheberrechtshinweis</h2>
            <p className="mb-4">
              Die auf unserer Internetseite vorhandenen Texte, Bilder, Fotos, Videos oder Grafiken unterliegen in der 
              Regel dem Schutz des Urheberrechts. Jede unberechtigte Verwendung (insbesondere die Vervielfältigung, 
              Bearbeitung oder Verbreitung) dieser urheberrechtsgeschützten Inhalte ist daher untersagt. Wenn Sie 
              beabsichtigen, diese Inhalte oder Teile davon zu verwenden, kontaktieren Sie uns bitte im Voraus unter 
              den obenstehenden Angaben.
            </p>
            <p>
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte 
              Dritter beachtet. Insbesondere werden Inhalt Dritter als solche gekennzeichnet. Sollten Sie trotzdem 
              auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um entsprechenden Hinweis. Bei 
              Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Social-Media-Profile</h2>
            <p className="mb-2">Dieses Impressum gilt auch für folgende Social-Media-Profile:</p>
            <div className="space-y-1">
              <p>Ausbildungsbasis: https://www.instagram.com/ausbildungsbasis</p>
              <p>Ausbildungsbasis: https://www.tiktok.com/@ausbildungsbasis</p>
            </div>
            <p className="mt-4"><strong>Gültigkeit:</strong> 01.01.2025</p>
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