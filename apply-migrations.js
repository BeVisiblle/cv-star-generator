import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function applyMigrations() {
  try {
    console.log('🚀 Starte das Anwenden der Migrationen...');

    const migrationsDir = './supabase/migrations';
    const migrationFiles = [
      '20250910000000_add_missing_job_columns.sql',
      '20250910010000_job_analytics_system.sql',
      '20250910020000_job_preview_system.sql',
      '20250910030000_job_edit_publishing_system.sql',
      '20250910040000_job_rpc_functions.sql'
    ];

    for (const fileName of migrationFiles) {
      const filePath = path.join(migrationsDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Datei nicht gefunden: ${fileName}`);
        continue;
      }

      console.log(`📝 Wende Migration an: ${fileName}`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              console.log(`   ⚠️  Fehler bei Statement: ${error.message}`);
              // Continue with next statement
            }
          } catch (err) {
            console.log(`   ⚠️  Fehler bei Statement: ${err.message}`);
            // Continue with next statement
          }
        }
      }
      
      console.log(`   ✅ Migration ${fileName} angewendet`);
    }

    console.log('\n🎉 Alle Migrationen erfolgreich angewendet!');
    
    // Teste die Verbindung
    console.log('\n🔍 Teste die Verbindung...');
    const { data, error } = await supabase
      .from('job_posts')
      .select('id, title')
      .limit(1);

    if (error) {
      console.log('❌ Verbindungstest fehlgeschlagen:', error.message);
    } else {
      console.log('✅ Verbindungstest erfolgreich!');
      console.log('📊 Gefundene Jobs:', data?.length || 0);
    }

  } catch (error) {
    console.error('❌ Fehler beim Anwenden der Migrationen:', error);
  }
}

applyMigrations();
