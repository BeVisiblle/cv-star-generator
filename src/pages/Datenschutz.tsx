import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { trackPageView } from '@/lib/telemetry';

export default function Datenschutz() {
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('Datenschutz');
  }, []);

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
            Stand: 30. April 2025
          </p>
          <p className="mt-4 text-muted-foreground">
            Wir freuen uns über Ihr Interesse an Ausbildungsbasis.de – einem Service der Morawe
            Ventures GbR, Leiweg 24, 61389 Schmitten. Der Schutz Ihrer personenbezogenen Daten ist
            uns ein besonderes Anliegen. Nachfolgend informieren wir Sie gemäß Art. 13 DSGVO über
            Art, Umfang und Zweck der Verarbeitung personenbezogener Daten auf unserer Plattform.
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Verantwortlicher im Sinne der DSGVO</h2>
              <div className="space-y-2">
                <p>Morawe Ventures GbR</p>
                <p>Leiweg 24</p>
                <p>61389 Schmitten</p>
                <p>E-Mail: info@ausbildungsbasis.de</p>
                <p>Telefon: +49 (0)172-6128947</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Zwecke und Rechtsgrundlagen der Datenverarbeitung</h2>
              <p className="mb-4">
                Im Folgenden finden Sie eine Übersicht, zu welchen Zwecken wir personenbezogene Daten
                auf Ausbildungsbasis.de verarbeiten und auf welcher gesetzlichen Grundlage dies jeweils
                erfolgt:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left">Zweck</th>
                      <th className="border border-border p-3 text-left">Datenarten</th>
                      <th className="border border-border p-3 text-left">Rechtsgrundlage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3">Registrierung & Login</td>
                      <td className="border border-border p-3">E-Mail, Passwort, Name, Telefonnummer</td>
                      <td className="border border-border p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Profilerstellung & Matching</td>
                      <td className="border border-border p-3">Lebenslauf, Interessen, Fähigkeiten, Ausbildungsangaben, Anschrift (Straße, Hausnummer, PLZ, Stadt, Bundesland)</td>
                      <td className="border border-border p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Sichtbarkeit für Unternehmen</td>
                      <td className="border border-border p-3">Sichtbare Profildaten (nur bei aktiver Freigabe)</td>
                      <td className="border border-border p-3">Art. 6 Abs. 1 lit. a DSGVO</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Kommunikation mit Nutzern</td>
                      <td className="border border-border p-3">E-Mail, Telefonnummer, ggf. WhatsApp</td>
                      <td className="border border-border p-3">Art. 6 Abs. 1 lit. a/b DSGVO</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Nutzung durch Unternehmen</td>
                      <td className="border border-border p-3">Zugriff auf freigegebene Profile (nach Freischaltung)</td>
                      <td className="border border-border p-3">Art. 6 Abs. 1 lit. b/f DSGVO</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Token-Nutzung</td>
                      <td className="border border-border p-3">Firmenkonto, Token-Transaktionen</td>
                      <td className="border border-border p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Zahlungsabwicklung</td>
                      <td className="border border-border p-3">Firmendaten, Rechnungsdaten, Zahlungsstatus</td>
                      <td className="border border-border p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Schutz vor Missbrauch</td>
                      <td className="border border-border p-3">IP-Adresse, Log-Daten</td>
                      <td className="border border-border p-3">Art. 6 Abs. 1 lit. f DSGVO</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Sichtbarkeit & Widerruf durch Nutzer</h2>
              <p className="mb-2">Nutzer können:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>ihr Profil jederzeit über die Kontoeinstellungen auf unsichtbar schalten</li>
                <li>die Einwilligung zur Sichtbarkeit jederzeit mit Wirkung für die Zukunft widerrufen</li>
                <li>das Profil und alle Daten vollständig löschen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Datenweitergabe an Dritte</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Eine Weitergabe an Unternehmen erfolgt nur, wenn Nutzer ihr Profil aktiv freigeben.</li>
                <li>Unternehmen verpflichten sich, diese Daten ausschließlich zur Ausbildungsplatzvermittlung zu verwenden (§5 AGB).</li>
                <li>Eine Weitergabe an andere Dritte (z. B. Partner, Werbetreibende) erfolgt nicht ohne ausdrückliche Zustimmung.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Einsatz von Tokensystem & Zahlungsdienstleister</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Unternehmen nutzen Token zur Freischaltung von Profilen oder Schaltung von Stellenanzeigen.</li>
                <li>Die Bezahlung erfolgt über den Dienstleister Stripe, Inc.; es gelten ergänzend dessen Datenschutzrichtlinien.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Hosting, Sicherheit & Auftragsverarbeitung</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Die Plattform wird ausschließlich in Deutschland gehostet.</li>
                <li>Es bestehen Auftragsverarbeitungsverträge mit allen externen Dienstleistern gemäß Art. 28 DSGVO.</li>
                <li>Ausbildungsbasis.de trifft angemessene technische und organisatorische Maßnahmen (TOM), um Ihre Daten zu schützen – z. B. durch SSL-Verschlüsselung, Zugriffskontrollen, Backup-Systeme und Schulung interner Mitarbeiter.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Speicherdauer</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left">Datenart</th>
                      <th className="border border-border p-3 text-left">Speicherdauer</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3">Nutzerkonten</td>
                      <td className="border border-border p-3">Bis zur Löschung durch Nutzer oder 3 Jahre nach letzter Aktivität</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Sichtbarkeitsstatus</td>
                      <td className="border border-border p-3">jederzeit widerrufbar</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Log-Daten</td>
                      <td className="border border-border p-3">max. 6 Monate</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Zahlungs- & Buchungsdaten</td>
                      <td className="border border-border p-3">10 Jahre (gesetzliche Aufbewahrungspflicht)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Ihre Rechte gemäß DSGVO</h2>
              <p className="mb-2">Sie haben jederzeit das Recht auf:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Auskunft (Art. 15 DSGVO)</li>
                <li>Berichtigung (Art. 16 DSGVO)</li>
                <li>Löschung (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruch gegen Verarbeitung (Art. 21 DSGVO)</li>
                <li>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
                <li>Beschwerde bei der zuständigen Datenschutzaufsichtsbehörde</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Cookies & Tracking-Technologien</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Es werden technisch notwendige Cookies eingesetzt.</li>
                <li>Weitere Cookies (z. B. für Analyse oder Marketing) nur nach aktiver Zustimmung.</li>
                <li>Nähere Informationen findest du in unserer Cookie-Richtlinie.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Änderung dieser Datenschutzerklärung</h2>
              <p>
                Diese Datenschutzerklärung kann jederzeit an gesetzliche Anforderungen oder technische
                Änderungen angepasst werden. Gültig ist die jeweils aktuelle Version auf
                www.ausbildungsbasis.de/datenschutz.
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