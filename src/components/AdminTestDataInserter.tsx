import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminTestDataInserter() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const insertTestData = async () => {
    setLoading(true);
    setProgress('Starte das Einfügen der Test-Daten...');

    try {
      // UUIDs für die Test-Daten
      const company1Id = 'd8d0da2a-b9ad-4a8a-b5f4-8a190cd086ac';
      const company2Id = '501642b4-43a0-47c7-bca1-cd53cdda25ec';
      const jobIds = [
        'af3cc321-6a8e-40cb-821e-8313331007a9',
        'ccdcdaac-0539-4640-a50e-838cc8ca2b3d',
        'f3ef617b-f7c7-4aac-8032-f01addd1602a',
        'a7d2cd41-3ec1-4787-b441-df27154c7579',
        '0d387be9-fea9-4087-aae1-faed65858478',
        '0fcefb45-fff0-4276-ac37-6e71d9ec9f4e'
      ];

      // Test Company 1
      setProgress('Erstelle TechCorp GmbH...');
      const { error: company1Error } = await supabase
        .from('companies')
        .upsert({
          id: company1Id,
          name: 'TechCorp GmbH',
          description: 'Ein innovatives Technologieunternehmen, das sich auf digitale Lösungen spezialisiert hat.',
          website_url: 'https://techcorp.de',
          logo_url: 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=TC',
          industry: 'Technology',
          size_range: '50-200',
          main_location: 'Berlin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (company1Error) {
        console.log('Company 1 Fehler:', company1Error.message);
      }

      // Test Company 2
      setProgress('Erstelle StartupXYZ...');
      const { error: company2Error } = await supabase
        .from('companies')
        .upsert({
          id: company2Id,
          name: 'StartupXYZ',
          description: 'Ein aufstrebendes Startup im Bereich Fintech mit innovativen Lösungen.',
          website_url: 'https://startupxyz.de',
          logo_url: 'https://via.placeholder.com/100x100/10B981/FFFFFF?text=SX',
          industry: 'Fintech',
          size_range: '10-50',
          main_location: 'Berlin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (company2Error) {
        console.log('Company 2 Fehler:', company2Error.message);
      }

      setProgress('Erstelle Test-Jobs...');

      // Test Jobs
      const testJobs = [
        {
          id: jobIds[0],
          company_id: company1Id,
          title: 'Frontend Developer (React/TypeScript)',
          job_type: 'professional',
          team_department: 'Engineering',
          role_family: 'Development',
          description_md: 'Wir suchen einen erfahrenen Frontend Developer, der sich mit modernen Web-Technologien auskennt und leidenschaftlich für sauberen Code ist.\n\nIn unserem dynamischen Team arbeitest du an spannenden Projekten und trägst zur Weiterentwicklung unserer digitalen Produkte bei.',
          work_mode: 'hybrid',
          city: 'Berlin',
          country: 'Deutschland',
          address_street: 'Unter den Linden 1',
          postal_code: '10117',
          employment_type: 'fulltime',
          hours_per_week_min: 35,
          hours_per_week_max: 40,
          salary_currency: 'EUR',
          salary_min: 4500,
          salary_max: 6500,
          salary_interval: 'month',
          tasks_description: 'Entwicklung von benutzerfreundlichen Web-Anwendungen mit React und TypeScript\nOptimierung der Performance und User Experience\nZusammenarbeit mit Designern und Backend-Entwicklern\nCode-Reviews und Mentoring von Junior-Entwicklern\nImplementierung von modernen Frontend-Architekturen',
          requirements_description: 'Abgeschlossenes Studium in Informatik oder vergleichbare Qualifikation\nMindestens 3 Jahre Erfahrung mit React und TypeScript\nKenntnisse in modernen CSS-Frameworks (Tailwind, Styled Components)\nErfahrung mit State Management (Redux, Zustand)\nGute Kenntnisse in Git und agilen Entwicklungsmethoden\nEnglischkenntnisse in Wort und Schrift',
          benefits_description: 'Flexible Arbeitszeiten und Homeoffice-Möglichkeiten\nModerne Arbeitsplätze in zentraler Lage\nWeiterbildungsbudget und Konferenzbesuche\nBetriebliche Altersvorsorge\nFitnessstudio-Mitgliedschaft\nTeam-Events und regelmäßige Firmenfeiern',
          languages: ['Deutsch', 'Englisch'],
          skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Git', 'Webpack', 'Jest'],
          is_public: true,
          is_active: true,
          is_draft: false,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: jobIds[1],
          company_id: company1Id,
          title: 'Marketing Manager (Digital Marketing)',
          job_type: 'professional',
          team_department: 'Marketing',
          role_family: 'Management',
          description_md: 'Als Marketing Manager bist du verantwortlich für die Entwicklung und Umsetzung unserer digitalen Marketingstrategien.\n\nDu arbeitest eng mit verschiedenen Teams zusammen und trägst maßgeblich zum Wachstum unseres Unternehmens bei.',
          work_mode: 'remote',
          city: 'Remote',
          country: 'Deutschland',
          address_street: '',
          postal_code: '',
          employment_type: 'fulltime',
          hours_per_week_min: 35,
          hours_per_week_max: 40,
          salary_currency: 'EUR',
          salary_min: 4000,
          salary_max: 5500,
          salary_interval: 'month',
          tasks_description: 'Entwicklung und Umsetzung von digitalen Marketingkampagnen\nVerwaltung von Social Media Kanälen und Content-Erstellung\nAnalyse von Marketing-KPIs und Optimierung der Strategien\nZusammenarbeit mit externen Agenturen und Partnern\nPlanung und Durchführung von Marketing-Events',
          requirements_description: 'Studium in Marketing, Kommunikation oder verwandten Bereichen\nMindestens 2 Jahre Erfahrung im digitalen Marketing\nKenntnisse in Google Analytics, Facebook Ads und Google Ads\nErfahrung mit Content Management Systemen\nKreative Denkweise und analytische Fähigkeiten\nSehr gute Deutsch- und Englischkenntnisse',
          benefits_description: 'Vollständig remote möglich\nFlexible Arbeitszeiten\nWeiterbildungsbudget\nModerne Arbeitsausstattung\nBetriebliche Altersvorsorge\nGesundheitszuschuss',
          languages: ['Deutsch', 'Englisch'],
          skills: ['Digital Marketing', 'Social Media', 'Google Analytics', 'Content Marketing', 'SEO', 'SEM', 'Email Marketing'],
          is_public: true,
          is_active: true,
          is_draft: false,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: jobIds[2],
          company_id: company1Id,
          title: 'Data Analyst (Business Intelligence)',
          job_type: 'professional',
          team_department: 'Analytics',
          role_family: 'Analysis',
          description_md: 'Wir suchen einen Data Analyst, der uns dabei hilft, aus unseren Daten wertvolle Erkenntnisse zu gewinnen.\n\nDu arbeitest mit großen Datenmengen und entwickelst innovative Lösungen für datengetriebene Entscheidungen.',
          work_mode: 'onsite',
          city: 'München',
          country: 'Deutschland',
          address_street: 'Maximilianstraße 10',
          postal_code: '80539',
          employment_type: 'fulltime',
          hours_per_week_min: 35,
          hours_per_week_max: 40,
          salary_currency: 'EUR',
          salary_min: 4200,
          salary_max: 5800,
          salary_interval: 'month',
          tasks_description: 'Analyse von Geschäftsdaten und Erstellung von Reports\nEntwicklung von Dashboards und Visualisierungen\nDatenqualitätssicherung und -bereinigung\nZusammenarbeit mit verschiedenen Abteilungen\nPräsentation von Ergebnissen und Empfehlungen',
          requirements_description: 'Studium in Mathematik, Statistik, Informatik oder verwandten Bereichen\nErfahrung mit SQL und Datenbanken\nKenntnisse in Python oder R\nErfahrung mit BI-Tools (Tableau, Power BI)\nStarke analytische und problemlösende Fähigkeiten\nGute Kommunikationsfähigkeiten',
          benefits_description: 'Moderne Büros in München\nFlexible Arbeitszeiten\nWeiterbildungsmöglichkeiten\nBetriebliche Altersvorsorge\nÖPNV-Ticket\nMitarbeiterrabatte',
          languages: ['Deutsch', 'Englisch'],
          skills: ['SQL', 'Python', 'R', 'Tableau', 'Power BI', 'Excel', 'Statistics', 'Data Visualization'],
          is_public: true,
          is_active: true,
          is_draft: false,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: jobIds[3],
          company_id: company1Id,
          title: 'UX/UI Designer (Digital Products)',
          job_type: 'professional',
          team_department: 'Design',
          role_family: 'Creative',
          description_md: 'Als UX/UI Designer gestaltest du die Benutzeroberflächen unserer digitalen Produkte und sorgst für eine optimale User Experience.\n\nDu arbeitest eng mit Entwicklern und Produktmanagern zusammen und bringst kreative Ideen ein.',
          work_mode: 'hybrid',
          city: 'Hamburg',
          country: 'Deutschland',
          address_street: 'Speicherstadt 1',
          postal_code: '20457',
          employment_type: 'fulltime',
          hours_per_week_min: 35,
          hours_per_week_max: 40,
          salary_currency: 'EUR',
          salary_min: 3800,
          salary_max: 5200,
          salary_interval: 'month',
          tasks_description: 'Entwicklung von User Experience Konzepten\nErstellung von Wireframes und Prototypen\nDesign von Benutzeroberflächen und Interaktionen\nDurchführung von Usability-Tests\nZusammenarbeit mit Entwicklern bei der Umsetzung',
          requirements_description: 'Studium in Design, Kommunikationsdesign oder verwandten Bereichen\nErfahrung mit Design-Tools (Figma, Sketch, Adobe Creative Suite)\nKenntnisse in UX-Design-Prinzipien\nErfahrung mit Prototyping-Tools\nKreative Denkweise und Auge für Details\nPortfolio mit relevanten Projekten',
          benefits_description: 'Kreative Arbeitsumgebung\nFlexible Arbeitszeiten\nDesign-Tools und Hardware\nWeiterbildungsbudget\nBetriebliche Altersvorsorge\nTeam-Events',
          languages: ['Deutsch', 'Englisch'],
          skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Wireframing', 'Visual Design'],
          is_public: true,
          is_active: true,
          is_draft: false,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: jobIds[4],
          company_id: company1Id,
          title: 'Sales Manager (B2B Software)',
          job_type: 'professional',
          team_department: 'Sales',
          role_family: 'Management',
          description_md: 'Wir suchen einen erfahrenen Sales Manager, der unser B2B-Software-Geschäft vorantreibt und neue Kunden gewinnt.\n\nDu arbeitest in einem dynamischen Team und hast die Möglichkeit, deine Karriere bei uns weiterzuentwickeln.',
          work_mode: 'onsite',
          city: 'Frankfurt',
          country: 'Deutschland',
          address_street: 'Zeil 1',
          postal_code: '60313',
          employment_type: 'fulltime',
          hours_per_week_min: 35,
          hours_per_week_max: 40,
          salary_currency: 'EUR',
          salary_min: 5000,
          salary_max: 7000,
          salary_interval: 'month',
          tasks_description: 'Akquisition neuer B2B-Kunden\nBetreuung bestehender Kunden und Account Management\nEntwicklung von Verkaufsstrategien\nDurchführung von Präsentationen und Verhandlungen\nZusammenarbeit mit Marketing und Produktentwicklung',
          requirements_description: 'Studium in BWL, Marketing oder verwandten Bereichen\nMindestens 3 Jahre Erfahrung im B2B-Verkauf\nErfahrung mit CRM-Systemen (Salesforce, HubSpot)\nStarke Kommunikations- und Verhandlungsfähigkeiten\nErfolgreiche Verkaufsabschlüsse nachweisbar\nReisebereitschaft',
          benefits_description: 'Attraktive Provisionen und Boni\nFirmenwagen oder Mobilitätsbudget\nFlexible Arbeitszeiten\nWeiterbildungsmöglichkeiten\nBetriebliche Altersvorsorge\nRegelmäßige Team-Events',
          languages: ['Deutsch', 'Englisch'],
          skills: ['B2B Sales', 'CRM', 'Negotiation', 'Account Management', 'Lead Generation', 'Presentation Skills'],
          is_public: true,
          is_active: true,
          is_draft: false,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: jobIds[5],
          company_id: company2Id,
          title: 'Product Manager (Fintech)',
          job_type: 'professional',
          team_department: 'Product',
          role_family: 'Management',
          description_md: 'Als Product Manager bei StartupXYZ entwickelst du innovative Fintech-Lösungen und trägst zur digitalen Transformation der Finanzbranche bei.\n\nDu arbeitest in einem agilen Umfeld und hast direkten Einfluss auf die Produktentwicklung.',
          work_mode: 'hybrid',
          city: 'Berlin',
          country: 'Deutschland',
          address_street: 'Potsdamer Platz 1',
          postal_code: '10785',
          employment_type: 'fulltime',
          hours_per_week_min: 35,
          hours_per_week_max: 40,
          salary_currency: 'EUR',
          salary_min: 5500,
          salary_max: 7500,
          salary_interval: 'month',
          tasks_description: 'Entwicklung von Produktstrategien und Roadmaps\nZusammenarbeit mit Engineering und Design Teams\nMarktanalyse und Wettbewerbsbeobachtung\nKoordination von Produktlaunches\nKundenfeedback sammeln und analysieren',
          requirements_description: 'Studium in BWL, Informatik oder verwandten Bereichen\nMindestens 2 Jahre Erfahrung im Product Management\nErfahrung im Fintech-Bereich von Vorteil\nKenntnisse in agilen Entwicklungsmethoden\nStarke analytische und kommunikative Fähigkeiten\nEnglischkenntnisse erforderlich',
          benefits_description: 'Startup-Atmosphäre mit flachen Hierarchien\nFlexible Arbeitszeiten und Homeoffice\nAktienoptionen\nWeiterbildungsbudget\nModerne Arbeitsausstattung\nRegelmäßige Team-Events',
          languages: ['Deutsch', 'Englisch'],
          skills: ['Product Management', 'Agile', 'Fintech', 'Analytics', 'User Research', 'Roadmapping'],
          is_public: true,
          is_active: true,
          is_draft: false,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Jobs einfügen
      for (let i = 0; i < testJobs.length; i++) {
        const job = testJobs[i];
        setProgress(`Erstelle Job ${i + 1}/${testJobs.length}: ${job.title}`);
        
        const { error: jobError } = await supabase
          .from('job_posts')
          .upsert(job);

        if (jobError) {
          console.log(`Fehler bei Job ${job.id}:`, jobError.message);
        }
      }

      setProgress('Test-Daten erfolgreich erstellt!');
      toast.success('Alle Test-Jobs wurden erfolgreich erstellt!');
      
    } catch (error) {
      console.error('Fehler beim Erstellen der Test-Daten:', error);
      toast.error('Fehler beim Erstellen der Test-Daten');
      setProgress('Fehler aufgetreten!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Test-Daten Inserter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Diese Komponente erstellt 6 Test-Jobs mit 2 Test-Unternehmen für die Anwendung.
          <br />
          <strong>Hinweis:</strong> Du musst als authentifizierter User eingeloggt sein.
        </p>
        
        {progress && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{progress}</p>
          </div>
        )}
        
        <Button 
          onClick={insertTestData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Erstelle Test-Daten...' : 'Test-Jobs erstellen'}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Erstellte Jobs:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Frontend Developer (React/TypeScript) - TechCorp GmbH</li>
            <li>Marketing Manager (Digital Marketing) - TechCorp GmbH</li>
            <li>Data Analyst (Business Intelligence) - TechCorp GmbH</li>
            <li>UX/UI Designer (Digital Products) - TechCorp GmbH</li>
            <li>Sales Manager (B2B Software) - TechCorp GmbH</li>
            <li>Product Manager (Fintech) - StartupXYZ</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
