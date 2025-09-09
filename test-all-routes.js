import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testAllRoutes() {
  console.log('🚀 Teste alle Routen und Features...\n');

  try {
    // Test 1: Server Status
    console.log('1️⃣ Teste Server Status...');
    try {
      const response = await fetch('http://localhost:8080');
      if (response.ok) {
        console.log('✅ Server läuft auf http://localhost:8080');
      } else {
        console.log('❌ Server antwortet nicht korrekt');
      }
    } catch (error) {
      console.log('❌ Server nicht erreichbar:', error.message);
    }

    // Test 2: Supabase Verbindung
    console.log('\n2️⃣ Teste Supabase Verbindung...');
    const { data: testData, error: testError } = await supabase
      .from('job_posts')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Supabase Verbindung fehlgeschlagen:', testError.message);
    } else {
      console.log('✅ Supabase Verbindung erfolgreich');
    }

    // Test 3: Job Posts laden
    console.log('\n3️⃣ Teste Job Posts laden...');
    const { data: jobs, error: jobsError } = await supabase
      .from('job_posts')
      .select(`
        id,
        title,
        city,
        country,
        work_mode,
        employment_type,
        salary_currency,
        salary_min,
        salary_max,
        salary_interval,
        published_at,
        description_md,
        company_id
      `)
      .eq('is_public', true)
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(10);

    if (jobsError) {
      console.log('❌ Fehler beim Laden der Jobs:', jobsError.message);
    } else {
      console.log('✅ Jobs erfolgreich geladen:', jobs?.length || 0);
      if (jobs && jobs.length > 0) {
        console.log('📝 Verfügbare Jobs:');
        jobs.forEach((job, index) => {
          console.log(`  ${index + 1}. ${job.title} (${job.city}, ${job.country})`);
        });
      }
    }

    // Test 4: Companies laden
    console.log('\n4️⃣ Teste Companies laden...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);

    if (companiesError) {
      console.log('❌ Fehler beim Laden der Companies:', companiesError.message);
    } else {
      console.log('✅ Companies erfolgreich geladen:', companies?.length || 0);
    }

    // Test 5: User Authentication
    console.log('\n5️⃣ Teste User Authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth Fehler:', authError.message);
    } else if (user) {
      console.log('✅ User eingeloggt:', user.email);
    } else {
      console.log('⚠️  Kein User eingeloggt (normal für anonyme Tests)');
    }

    // Test 6: Database Schema
    console.log('\n6️⃣ Teste Database Schema...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('job_posts')
      .select('id, title, description_md, slug, view_count, application_count, tags, is_featured, is_urgent')
      .limit(1);

    if (schemaError) {
      console.log('❌ Schema Test fehlgeschlagen:', schemaError.message);
    } else {
      console.log('✅ Schema Test erfolgreich');
      if (schemaTest && schemaTest.length > 0) {
        console.log('📊 Verfügbare Spalten:', Object.keys(schemaTest[0]));
      }
    }

    console.log('\n🎉 Alle Tests abgeschlossen!');
    console.log('\n📋 Nächste Schritte:');
    console.log('1. Öffne http://localhost:8080 im Browser');
    console.log('2. Teste die verschiedenen Routen:');
    console.log('   - / (Homepage)');
    console.log('   - /jobs (Stellenanzeigen)');
    console.log('   - /test-data (Test-Daten erstellen)');
    console.log('   - /company/dashboard (Company Dashboard)');
    console.log('   - /company/jobs (Company Jobs)');

  } catch (error) {
    console.error('❌ Fehler beim Testen:', error);
  }
}

testAllRoutes();
