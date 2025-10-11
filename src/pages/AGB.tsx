import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { trackPageView } from '@/lib/telemetry';

export default function AGB() {
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('AGB');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 sm:py-10">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Zurück zur Startseite
          </Button>
          
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-sm text-muted-foreground">
            Stand: 30. April 2025
          </p>
          <p className="mt-4 text-muted-foreground">
            Ausbildungsbasis.de ist ein Service der Morawe Ventures GbR, Leiweg 24, 61389 Schmitten, Deutschland. 
            Wir begrüßen Sie herzlich und möchten Sie bitten, vor Beginn Ihrer intensiven Suche nach Auszubildenden 
            unsere Allgemeinen Geschäftsbedingungen (AGB) sorgfältig zu lesen. Vielen Dank.
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="space-y-6 text-muted-foreground">
            <section>
              <p className="mb-4">
                Diese Allgemeinen Geschäftsbedingungen regeln die vertraglichen Beziehungen zwischen Ausbildungsbasis.de (nachfolgend "AB") und
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 mb-4">
                <li>den Unternehmen (nachfolgend "Kunden"), die über die Plattform Ausbildungsstellen bewerben und geeignete Bewerber kontaktieren,</li>
                <li>sowie den ausbildungsplatzsuchenden Personen (nachfolgend "Nutzer"), die den Dienst kostenfrei nutzen.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§1 Geltungsbereich</h2>
              <p className="mb-2">1.1 Diese AGB gelten für alle kostenpflichtigen und kostenlosen Dienste von Ausbildungsbasis.de, insbesondere für die Nutzung der Datenbank, der Token-basierten Zusatzleistungen und die Erstellung bzw. Freischaltung von Nutzerprofilen.</p>
              <p className="mb-2">1.2 Abweichende Geschäftsbedingungen von Kunden oder Nutzern finden keine Anwendung, es sei denn, AB stimmt diesen ausdrücklich zu.</p>
              <p>1.3 Änderungen dieser AGB werden auf der Plattform veröffentlicht und gelten als akzeptiert, wenn nicht binnen 14 Tagen widersprochen wird.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§2 Registrierung & Vertragsverhältnis</h2>
              <p className="mb-2">2.1 Die Nutzung der Plattform setzt eine vorherige Registrierung voraus.</p>
              <p className="mb-2">2.2 Kunden registrieren sich unter Angabe von Unternehmensdaten (z. B. Firmenname, Branche, Ansprechpartner, E-Mail, Passwort). Nutzer geben persönliche Daten (Name, E-Mail, Telefonnummer, Schulabschluss, Interessen, Lebenslauf, Anschrift (Straße, Hausnummer, PLZ, Stadt, Bundesland)) ein.</p>
              <p className="mb-4">2.3 Mit erfolgreicher Registrierung kommt ein rechtlich verbindliches, aber unentgeltliches Vertragsverhältnis zwischen dem Nutzer bzw. dem Kunden und Ausbildungsbasis.de zustande. Dieses Vertragsverhältnis unterliegt diesen Allgemeinen Geschäftsbedingungen und der Datenschutzerklärung – unabhängig davon, ob ein kostenpflichtiges Abonnement abgeschlossen wird.</p>
              
              <p className="mb-2"><strong>Für Nutzer gilt:</strong> Das Vertragsverhältnis ermöglicht den Zugang zu den unentgeltlichen Plattformfunktionen (z. B. Profilerstellung, Lebenslauf, Matching) und verpflichtet beide Parteien zur Einhaltung dieser Bedingungen.</p>
              
              <p className="mb-4"><strong>Für Kunden gilt:</strong> Auch bei einer kostenlosen Testversion oder dem Zugang zu einzelnen Funktionen (z. B. durch kostenlose Token oder Profilansicht) entsteht ein verbindliches Nutzungsverhältnis. Die Nutzung der Plattform sowie der Zugriff auf Nutzerprofile ist nur im Rahmen dieser AGB zulässig. Ein entgeltliches Vertragsverhältnis beginnt zusätzlich mit dem Abschluss eines kostenpflichtigen Abonnements.</p>
              
              <p>2.4 Nutzer bestätigen bei Registrierung, dass sie mindestens 16 Jahre alt sind oder die Zustimmung ihrer Erziehungsberechtigten eingeholt haben.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§3 Nutzungsmodelle & Tokensystem</h2>
              <p className="mb-2">3.1 Nutzer können die Plattform unentgeltlich nutzen, ihr Profil anlegen und auf Wunsch für Unternehmen sichtbar machen.</p>
              <p className="mb-2">3.2 Kunden erwerben ein Abonnement zur Freischaltung des Datenbankzugangs.</p>
              <p className="mb-4">3.3 Zusätzlich können Kunden sogenannte Token erwerben, die innerhalb der Plattform eingesetzt werden können – z. B. zur:</p>
              <ul className="list-disc list-inside ml-8 space-y-1 mb-2">
                <li>Freischaltung einzelner Bewerberprofile</li>
                <li>Schaltung von Stellenanzeigen</li>
              </ul>
              <p className="mb-2">3.4 Die Anzahl erforderlicher Token kann je nach Produktart variieren.</p>
              <p>3.5 Token haben keinen Geldwert außerhalb der Plattform und können nicht erstattet oder übertragen werden.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§4 Sichtbarkeit & Datenschutz</h2>
              <p className="mb-2">4.1 Nutzer entscheiden selbst, ob und wann ihr Profil für Kunden sichtbar ist. Die Sichtbarkeit kann jederzeit im Nutzerkonto oder durch schriftliche Mitteilung an AB deaktiviert werden.</p>
              <p>4.2 Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung von AB.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§5 Zweckbindung und Datennutzung durch Kunden</h2>
              <p className="mb-2">5.1 Kunden verpflichten sich, personenbezogene Daten von Nutzern (z. B. Name, Telefonnummer, Lebenslauf) ausschließlich im Rahmen der Ausbildungsplatzvermittlung zu verwenden.</p>
              <p className="mb-2">5.2 Eine Nutzung zu anderen Zwecken (z. B. Werbung, Scoring, Datenanalyse, Vertrieb) ist untersagt.</p>
              <p>5.3 Bei Verstoß behält sich AB das Recht vor, das Konto zu sperren, rechtliche Schritte einzuleiten sowie die Datenschutzaufsicht zu informieren.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§6 Vertragsstrafe bei Datenschutzverstoß</h2>
              <p className="mb-2">6.1 Bei schuldhaftem Verstoß gegen §5 ist AB berechtigt, eine Vertragsstrafe in Höhe von bis zu 5.000 € zu erheben. Die Höhe wird von AB nach billigem Ermessen festgelegt.</p>
              <p>6.2 Die Geltendmachung weiterer Schadensersatzansprüche bleibt unberührt.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§7 Abonnements & Laufzeit</h2>
              <p className="mb-2">7.1 Mit Abschluss eines kostenpflichtigen Abonnements erhalten Kunden Zugang zur Bewerberdatenbank.</p>
              <p className="mb-2">7.2 Das Abonnement ist ein digitales Produkt. Es beginnt unmittelbar nach Vertragsabschluss und ist nicht vorzeitig kündbar.</p>
              <p className="mb-2">7.3 Der Kunde stimmt bei Bestellung ausdrücklich zu, dass das Abonnement sofort beginnt, und bestätigt, dass er dadurch auf sein Widerrufsrecht verzichtet.</p>
              <p>7.4 Das Abonnement endet automatisch mit Ablauf der vereinbarten Laufzeit. Es erfolgt keine automatische Verlängerung. Kunden können ihr Konto danach erneut upgraden.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§8 Bezahlung & Zahlungsdienstleister</h2>
              <p className="mb-2">8.1 Die Zahlungsabwicklung erfolgt über Drittanbieter (z. B. Stripe). Es gelten ergänzend deren Geschäftsbedingungen.</p>
              <p>8.2 Kunden können zwischen verschiedenen Zahlungsmethoden wählen.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§9 Profil- und Kontoverwaltung</h2>
              <p className="mb-2">9.1 Nutzer können ihr Profil jederzeit anpassen, unsichtbar schalten oder das Konto vollständig löschen.</p>
              <p className="mb-2">9.2 Die vollständige Löschung erfolgt unverzüglich, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
              <p>9.3 Inaktive Konten können nach 12 Monaten Inaktivität durch AB gelöscht werden.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§10 Rechte und Pflichten</h2>
              <p className="mb-2">10.1 Kunden und Nutzer verpflichten sich, bei der Registrierung und Nutzung wahrheitsgemäße Angaben zu machen.</p>
              <p>10.2 Die gewerbliche Nutzung durch Kunden ist ausschließlich im Rahmen dieser AGB gestattet. Die Nutzung durch automatisierte Abfragen (z. B. Scraper) ist untersagt.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§11 Haftung</h2>
              <p className="mb-2">11.1 AB übernimmt keine Haftung für die Richtigkeit von Nutzerangaben oder den Vermittlungserfolg.</p>
              <p>11.2 Bei vorsätzlicher oder grob fahrlässiger Pflichtverletzung haftet AB im Rahmen der gesetzlichen Bestimmungen.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§12 Urheberrechte</h2>
              <p>12.1 Alle Inhalte, Marken, Designs und Softwarebestandteile von Ausbildungsbasis.de sind urheberrechtlich geschützt.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">§13 Schlussbestimmungen</h2>
              <p className="mb-2">13.1 Es gilt deutsches Recht. Gerichtsstand ist – sofern gesetzlich zulässig – der Sitz von AB.</p>
              <p className="mb-2">13.2 Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt.</p>
              <p>13.3 Die jeweils aktuelle Version der AGB ist jederzeit auf www.ausbildungsbasis.de einsehbar.</p>
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