import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createSimpleTestJobs() {
  console.log('🚀 Erstelle einfache Test-Jobs...');

  try {
    // Erst prüfen, welche Spalten in companies existieren
    console.log('🔍 Prüfe companies Tabelle...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (companiesError) {
      console.log('❌ Fehler beim Prüfen der companies Tabelle:', companiesError.message);
    } else {
      console.log('✅ Companies Tabelle gefunden');
      if (companies && companies.length > 0) {
        console.log('📊 Verfügbare Spalten:', Object.keys(companies[0]));
      }
    }

    // Einfaches Unternehmen erstellen
    console.log('🏢 Erstelle einfaches Test-Unternehmen...');
    const companyId = uuidv4();
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        id: companyId,
        name: 'TechCorp GmbH',
        description: 'Ein innovatives Technologieunternehmen',
        is_verified: true,
        is_active: true
      })
      .select()
      .single();

    if (companyError && !companyError.message.includes('duplicate key')) {
      console.log('❌ Fehler beim Erstellen des Unternehmens:', companyError.message);
      return;
    } else {
      console.log('✅ Test-Unternehmen erstellt:', companyId);
    }

    // Einfache Test Jobs erstellen
    console.log('📝 Erstelle einfache Test-Jobs...');
    
    const testJobs = [
      {
        id: uuidv4(),
        title: 'Frontend Entwickler (m/w/d)',
        company_id: companyId,
        description_md: 'Wir suchen einen erfahrenen Frontend-Entwickler für unser innovatives Team.',
        city: 'Berlin',
        country: 'Deutschland',
        work_mode: 'hybrid',
        employment_type: 'full_time',
        salary_min: 45000,
        salary_max: 65000,
        salary_currency: 'EUR',
        salary_interval: 'Jahr',
        is_public: true,
        is_active: true,
        is_draft: false,
        published_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Backend Entwickler (m/w/d)',
        company_id: companyId,
        description_md: 'Entwickle robuste Backend-Systeme mit Node.js und PostgreSQL.',
        city: 'München',
        country: 'Deutschland',
        work_mode: 'remote',
        employment_type: 'full_time',
        salary_min: 50000,
        salary_max: 70000,
        salary_currency: 'EUR',
        salary_interval: 'Jahr',
        is_public: true,
        is_active: true,
        is_draft: false,
        published_at: new Date().toISOString()
      }
    ];

    for (const job of testJobs) {
      const { data, error } = await supabase
        .from('job_posts')
        .insert(job)
        .select();

      if (error && !error.message.includes('duplicate key')) {
        console.log(`❌ Fehler beim Erstellen von Job "${job.title}":`, error.message);
      } else {
        console.log(`✅ Job "${job.title}" erstellt`);
      }
    }

    console.log('\n🎉 Test-Jobs erfolgreich erstellt!');
    console.log('🌐 Öffne http://localhost:8080/jobs um die Jobs zu sehen');

  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Test-Daten:', error);
  }
}

createSimpleTestJobs();
