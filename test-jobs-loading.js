import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testJobsLoading() {
  console.log('🔍 Teste Job-Ladung...');

  try {
    // Teste die gleiche Query wie in PublicJobsList
    const { data, error } = await supabase
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
      .limit(50);

    if (error) {
      console.log('❌ Fehler beim Laden der Jobs:', error.message);
      console.log('📊 Error Details:', error);
    } else {
      console.log('✅ Jobs erfolgreich geladen!');
      console.log('📊 Anzahl Jobs:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('📝 Erste 3 Jobs:');
        data.slice(0, 3).forEach((job, index) => {
          console.log(`  ${index + 1}. ${job.title} (${job.city}, ${job.country})`);
          console.log(`     Work Mode: ${job.work_mode}, Employment: ${job.employment_type}`);
          console.log(`     Salary: ${job.salary_min}-${job.salary_max} ${job.salary_currency}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Fehler beim Testen der Job-Ladung:', error);
  }
}

testJobsLoading();
