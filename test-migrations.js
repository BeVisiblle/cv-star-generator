import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testMigrations() {
  try {
    console.log('🚀 Teste die Migrationen...');

    // Teste die neuen Spalten
    console.log('📝 Teste neue Spalten...');
    const { data: columns, error: columnsError } = await supabase
      .from('job_posts')
      .select('id, title, description_md, slug, view_count, application_count, tags, is_featured, is_urgent')
      .limit(1);

    if (columnsError) {
      console.log('❌ Neue Spalten nicht gefunden:', columnsError.message);
    } else {
      console.log('✅ Neue Spalten gefunden!');
      console.log('📊 Spalten:', Object.keys(columns[0] || {}));
    }

    // Teste die Analytics-Tabellen
    console.log('\n📈 Teste Analytics-Tabellen...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('job_analytics')
      .select('*')
      .limit(1);

    if (analyticsError) {
      console.log('❌ Analytics-Tabellen nicht gefunden:', analyticsError.message);
    } else {
      console.log('✅ Analytics-Tabellen gefunden!');
    }

    // Teste die Preview-Tabellen
    console.log('\n👁️ Teste Preview-Tabellen...');
    const { data: previews, error: previewsError } = await supabase
      .from('job_previews')
      .select('*')
      .limit(1);

    if (previewsError) {
      console.log('❌ Preview-Tabellen nicht gefunden:', previewsError.message);
    } else {
      console.log('✅ Preview-Tabellen gefunden!');
    }

    // Teste die RPC-Funktionen
    console.log('\n🔧 Teste RPC-Funktionen...');
    const { data: rpcTest, error: rpcError } = await supabase
      .rpc('get_company_job_stats', { p_company_id: 'test-company-1' });

    if (rpcError) {
      console.log('❌ RPC-Funktionen nicht gefunden:', rpcError.message);
    } else {
      console.log('✅ RPC-Funktionen gefunden!');
    }

    console.log('\n🎉 Migrationstest abgeschlossen!');

  } catch (error) {
    console.error('❌ Fehler beim Testen der Migrationen:', error);
  }
}

testMigrations();
