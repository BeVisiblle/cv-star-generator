import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  try {
    console.log('🔍 Teste Supabase-Verbindung...');
    
    // Teste die Verbindung durch Abfrage der job_posts Tabelle
    const { data, error } = await supabase
      .from('job_posts')
      .select('id, title')
      .limit(1);

    if (error) {
      console.error('❌ Supabase-Verbindungsfehler:', error);
      return false;
    }

    console.log('✅ Supabase-Verbindung erfolgreich!');
    console.log('📊 Gefundene Jobs:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('📝 Erster Job:', data[0]);
    }

    return true;
  } catch (err) {
    console.error('❌ Unerwarteter Fehler:', err);
    return false;
  }
}

// Teste auch die Companies-Tabelle
async function testCompanies() {
  try {
    console.log('🔍 Teste Companies-Tabelle...');
    
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);

    if (error) {
      console.error('❌ Companies-Tabellenfehler:', error);
      return false;
    }

    console.log('✅ Companies-Tabelle erreichbar!');
    console.log('🏢 Gefundene Unternehmen:', data?.length || 0);
    
    return true;
  } catch (err) {
    console.error('❌ Companies-Fehler:', err);
    return false;
  }
}

// Führe Tests aus
async function runTests() {
  console.log('🚀 Starte Supabase-Verbindungstests...\n');
  
  const connectionOk = await testConnection();
  console.log('');
  
  const companiesOk = await testCompanies();
  console.log('');
  
  if (connectionOk && companiesOk) {
    console.log('🎉 Alle Tests erfolgreich! Supabase ist bereit.');
  } else {
    console.log('⚠️  Einige Tests fehlgeschlagen. Überprüfe die Konfiguration.');
  }
}

runTests();
