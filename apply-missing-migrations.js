import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function applyMissingMigrations() {
  console.log('🗄️ Applying Missing Database Migrations...\n');

  try {
    // Read the migration files
    const migrations = [
      {
        name: 'Bookmarking, Sharing & Moderation',
        file: 'supabase/bookmarking-sharing-moderation.sql'
      },
      {
        name: 'Media Storage Setup',
        file: 'supabase/media-storage-setup.sql'
      }
    ];

    for (const migration of migrations) {
      console.log(`📁 Applying ${migration.name}...`);
      
      if (!fs.existsSync(migration.file)) {
        console.log(`❌ Migration file not found: ${migration.file}`);
        continue;
      }

      const sql = fs.readFileSync(migration.file, 'utf8');
      
      try {
        // Try to apply the migration using a custom function
        const { data, error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
          console.log(`❌ Error applying ${migration.name}: ${error.message}`);
          
          // If exec_sql doesn't exist, try direct execution
          if (error.message.includes('exec_sql')) {
            console.log(`⚠️ exec_sql function not available. Manual application required.`);
            console.log(`📋 Please apply this migration manually in Supabase Dashboard:`);
            console.log(`   File: ${migration.file}`);
            console.log(`   Content preview: ${sql.substring(0, 200)}...`);
          }
        } else {
          console.log(`✅ ${migration.name} applied successfully`);
        }
      } catch (err) {
        console.log(`❌ Error applying ${migration.name}: ${err.message}`);
        console.log(`📋 Please apply this migration manually in Supabase Dashboard:`);
        console.log(`   File: ${migration.file}`);
      }
    }

    // Test if the migrations were applied
    console.log('\n🧪 Testing Applied Migrations...');
    
    const testTables = [
      'bookmarks',
      'reports', 
      'hidden_posts',
      'snoozed_posts'
    ];

    let appliedCount = 0;
    for (const table of testTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Table exists and accessible`);
          appliedCount++;
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    console.log(`\n📊 Migration Results: ${appliedCount}/${testTables.length} tables created`);

    if (appliedCount === testTables.length) {
      console.log('🎉 All migrations applied successfully!');
    } else {
      console.log('⚠️ Some migrations need manual application.');
      console.log('\n📋 Manual Application Instructions:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the content from:');
      console.log('   - supabase/bookmarking-sharing-moderation.sql');
      console.log('   - supabase/media-storage-setup.sql');
      console.log('4. Run each SQL script');
    }

  } catch (error) {
    console.error('❌ Error during migration application:', error.message);
  }
}

applyMissingMigrations();
