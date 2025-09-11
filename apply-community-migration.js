import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function applyCommunityMigration() {
  console.log('🔍 Applying Community Features Migration...\n');

  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250109_complete_community_features.sql', 'utf8');
    
    console.log('📄 Migration file loaded, applying...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
          console.log(`SQL: ${statement.substring(0, 100)}...`);
          
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`❌ Error: ${error.message}`);
            errorCount++;
          } else {
            console.log(`✅ Success`);
            successCount++;
          }
        } catch (err) {
          console.log(`❌ Exception: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Migration Results:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Community migration completed successfully!');
    } else {
      console.log('\n⚠️ Migration completed with some errors. Check the output above.');
    }

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
  }
}

applyCommunityMigration();
