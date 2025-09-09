import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = "https://koymmvuhcxlvcuoyjnvv.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM4MDc1NywiZXhwIjoyMDY5OTU2NzU3fQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyCommunityMigrations() {
  console.log('🚀 Applying Community Features Migrations...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250109_community_enhancements.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement.trim()) continue;

      console.log(`\n${i + 1}/${statements.length} Executing statement...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          // Continue with next statement
          continue;
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        // Continue with next statement
        continue;
      }
    }

    console.log('\n🎉 Community migrations completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the new community features');
    console.log('2. Create some test posts, polls, and events');
    console.log('3. Test reactions and comments');
    console.log('4. Verify realtime updates are working');

  } catch (error) {
    console.error('❌ Error applying migrations:', error);
    process.exit(1);
  }
}

// Check if exec_sql function exists
async function checkExecSqlFunction() {
  try {
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'exec_sql')
      .limit(1);

    if (error) {
      console.log('⚠️  exec_sql function not found. You may need to apply migrations manually via Supabase Dashboard.');
      console.log('📄 Migration file location: supabase/migrations/20250109_community_enhancements.sql');
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.log('⚠️  Could not check for exec_sql function. You may need to apply migrations manually.');
    return false;
  }
}

async function main() {
  console.log('🔍 Checking database connection...');
  
  const hasExecSql = await checkExecSqlFunction();
  
  if (hasExecSql) {
    await applyCommunityMigrations();
  } else {
    console.log('\n📋 Manual Migration Required:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of: supabase/migrations/20250109_community_enhancements.sql');
    console.log('4. Execute the SQL');
    console.log('5. Verify all tables and functions are created successfully');
  }
}

main().catch(console.error);
