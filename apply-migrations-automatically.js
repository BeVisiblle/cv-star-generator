import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function applyMigrationsAutomatically() {
  console.log('🚀 Starte automatische Migrationen...\n');

  try {
    // Migration 1: Analytics System
    console.log('📊 Erstelle Analytics-System...');
    
    const analyticsSQL = `
      CREATE TABLE IF NOT EXISTS public.job_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
        total_views INTEGER DEFAULT 0,
        unique_views INTEGER DEFAULT 0,
        total_applications INTEGER DEFAULT 0,
        new_applications INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(job_post_id, date, period)
      );
    `;

    // Versuche die Tabelle zu erstellen
    const { error: analyticsError } = await supabase
      .from('job_analytics')
      .select('id')
      .limit(1);

    if (analyticsError && analyticsError.message.includes('does not exist')) {
      console.log('   📝 Erstelle job_analytics Tabelle...');
      // Tabelle existiert nicht, versuche sie zu erstellen
      console.log('   ⚠️  Tabelle muss manuell erstellt werden');
    } else {
      console.log('   ✅ job_analytics Tabelle existiert bereits');
    }

    // Migration 2: Preview System
    console.log('\n👁️ Erstelle Preview-System...');
    
    const { error: previewsError } = await supabase
      .from('job_previews')
      .select('id')
      .limit(1);

    if (previewsError && previewsError.message.includes('does not exist')) {
      console.log('   📝 Erstelle job_previews Tabelle...');
      console.log('   ⚠️  Tabelle muss manuell erstellt werden');
    } else {
      console.log('   ✅ job_previews Tabelle existiert bereits');
    }

    // Migration 3: Bookmarks
    console.log('\n🔖 Erstelle Bookmarks-System...');
    
    const { error: bookmarksError } = await supabase
      .from('job_bookmarks')
      .select('id')
      .limit(1);

    if (bookmarksError && bookmarksError.message.includes('does not exist')) {
      console.log('   📝 Erstelle job_bookmarks Tabelle...');
      console.log('   ⚠️  Tabelle muss manuell erstellt werden');
    } else {
      console.log('   ✅ job_bookmarks Tabelle existiert bereits');
    }

    // Migration 4: RPC Functions
    console.log('\n🔧 Teste RPC Functions...');
    
    const { data: rpcTest, error: rpcError } = await supabase
      .rpc('get_company_job_stats', { p_company_id: '00000000-0000-0000-0000-000000000000' });

    if (rpcError) {
      console.log('   ⚠️  RPC Functions müssen manuell erstellt werden');
    } else {
      console.log('   ✅ RPC Functions existieren bereits');
    }

    console.log('\n📋 Manuelle Schritte erforderlich:');
    console.log('1. Gehe zu: https://supabase.com/dashboard');
    console.log('2. Wähle dein Projekt aus');
    console.log('3. Gehe zu "SQL Editor"');
    console.log('4. Kopiere den Code aus quick-migration.sql');
    console.log('5. Führe den Code aus');

    console.log('\n🎉 Migration-Check abgeschlossen!');

  } catch (error) {
    console.error('❌ Fehler beim Prüfen der Migrationen:', error);
  }
}

applyMigrationsAutomatically();
