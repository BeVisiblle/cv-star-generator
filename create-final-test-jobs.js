import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createFinalTestJobs() {
  console.log('🚀 Erstelle finale Test-Jobs...');

  try {
    // Unternehmen erstellen mit korrekten Spalten
    console.log('🏢 Erstelle Test-Unternehmen...');
    const companyId = uuidv4();
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        id: companyId,
        name: 'TechCorp GmbH',
        description: 'Ein innovatives Technologieunternehmen',
        industry: 'Technology',
        size_range: '50-200',
        founded_year: 2020,
        main_location: 'Berlin, Deutschland',
        website_url: 'https://techcorp.de',
        primary_email: 'info@techcorp.de',
        phone: '+49 30 12345678',
        country: 'Deutschland',
        account_status: 'active',
        plan_status: 'active'
      })
      .select()
      .single();

    if (companyError && !companyError.message.includes('duplicate key')) {
      console.log('❌ Fehler beim Erstellen des Unternehmens:', companyError.message);
      return;
    } else {
      console.log('✅ Test-Unternehmen erstellt:', companyId);
    }

    // Test Jobs erstellen
    console.log('📝 Erstelle Test-Jobs...');
    
    const testJobs = [
      {
        id: uuidv4(),
        title: 'Frontend Entwickler (m/w/d)',
        company_id: companyId,
        description_md: 'Wir suchen einen erfahrenen Frontend-Entwickler für unser innovatives Team. Du arbeitest mit React, TypeScript und modernen Web-Technologien.',
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
        description_md: 'Entwickle robuste Backend-Systeme mit Node.js und PostgreSQL. Du arbeitest in einem agilen Team und trägst zur Architektur bei.',
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
      },
      {
        id: uuidv4(),
        title: 'UX/UI Designer (m/w/d)',
        company_id: companyId,
        description_md: 'Gestalte benutzerfreundliche Interfaces und verbessere die User Experience unserer Produkte.',
        city: 'Hamburg',
        country: 'Deutschland',
        work_mode: 'office',
        employment_type: 'full_time',
        salary_min: 40000,
        salary_max: 55000,
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

createFinalTestJobs();
