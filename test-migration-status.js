import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testMigrationStatus() {
  console.log('🔍 Teste Migration-Status...\n');

  try {
    // Test 1: Job Analytics
    console.log('📊 Teste Job Analytics...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('job_analytics')
      .select('*')
      .limit(1);

    if (analyticsError) {
      console.log('❌ Job Analytics nicht gefunden:', analyticsError.message);
    } else {
      console.log('✅ Job Analytics gefunden!');
    }

    // Test 2: Job Previews
    console.log('\n👁️ Teste Job Previews...');
    const { data: previews, error: previewsError } = await supabase
      .from('job_previews')
      .select('*')
      .limit(1);

    if (previewsError) {
      console.log('❌ Job Previews nicht gefunden:', previewsError.message);
    } else {
      console.log('✅ Job Previews gefunden!');
    }

    // Test 3: Job Bookmarks
    console.log('\n🔖 Teste Job Bookmarks...');
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('job_bookmarks')
      .select('*')
      .limit(1);

    if (bookmarksError) {
      console.log('❌ Job Bookmarks nicht gefunden:', bookmarksError.message);
    } else {
      console.log('✅ Job Bookmarks gefunden!');
    }

    // Test 4: RPC Functions
    console.log('\n🔧 Teste RPC Functions...');
    const { data: rpcTest, error: rpcError } = await supabase
      .rpc('get_company_job_stats', { p_company_id: '00000000-0000-0000-0000-000000000000' });

    if (rpcError) {
      console.log('❌ RPC Functions nicht gefunden:', rpcError.message);
    } else {
      console.log('✅ RPC Functions gefunden!');
      console.log('📊 Test-Ergebnis:', rpcTest);
    }

    // Test 5: Job Posts mit neuen Spalten
    console.log('\n📝 Teste Job Posts mit neuen Spalten...');
    const { data: jobs, error: jobsError } = await supabase
      .from('job_posts')
      .select('id, title, description_md, slug, view_count, application_count, tags, is_featured, is_urgent')
      .limit(1);

    if (jobsError) {
      console.log('❌ Job Posts mit neuen Spalten nicht gefunden:', jobsError.message);
    } else {
      console.log('✅ Job Posts mit neuen Spalten gefunden!');
      if (jobs && jobs.length > 0) {
        console.log('📊 Verfügbare Spalten:', Object.keys(jobs[0]));
      }
    }

    console.log('\n🎉 Migration-Test abgeschlossen!');

  } catch (error) {
    console.error('❌ Fehler beim Testen der Migrationen:', error);
  }
}

testMigrationStatus();
