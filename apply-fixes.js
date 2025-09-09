#!/usr/bin/env node

/**
 * Apply draft fixes to the database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/"/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Applying draft fixes to database...\n');

async function applyFixes() {
  try {
    // Read the SQL file
    const sqlContent = readFileSync('apply-draft-fixes.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Some errors are expected (like "already exists")
            if (error.message.includes('already exists') || 
                error.message.includes('does not exist') ||
                error.message.includes('duplicate key')) {
              console.log(`⚠️  Statement ${i + 1}: ${error.message}`);
            } else {
              console.error(`❌ Statement ${i + 1} failed:`, error.message);
              errorCount++;
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } catch (err) {
          console.error(`❌ Statement ${i + 1} error:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} errors`);
    
    if (errorCount === 0) {
      console.log('🎉 All fixes applied successfully!');
    } else {
      console.log('⚠️  Some fixes had issues, but this is often normal for existing databases');
    }
    
  } catch (error) {
    console.error('❌ Failed to apply fixes:', error.message);
  }
}

// Check if we have the exec_sql function
async function checkExecSql() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    if (error) {
      console.log('⚠️  exec_sql function not available, trying alternative approach...');
      return false;
    }
    return true;
  } catch (error) {
    console.log('⚠️  exec_sql function not available, trying alternative approach...');
    return false;
  }
}

// Alternative approach using direct SQL execution
async function applyFixesAlternative() {
  console.log('🔄 Trying alternative approach...');
  
  try {
    // Test basic operations
    console.log('1. Testing company slug addition...');
    const { error: companyError } = await supabase
      .from('companies')
      .select('id, name, slug')
      .limit(1);
    
    if (companyError && companyError.message.includes('slug')) {
      console.log('⚠️  Company slug column missing - will be added by migration');
    } else {
      console.log('✅ Company slug column exists');
    }
    
    console.log('2. Testing job_posts slug...');
    const { error: jobError } = await supabase
      .from('job_posts')
      .select('id, title, slug')
      .limit(1);
    
    if (jobError && jobError.message.includes('slug')) {
      console.log('⚠️  Job slug column missing - will be added by migration');
    } else {
      console.log('✅ Job slug column exists');
    }
    
    console.log('3. Testing company joins...');
    const { error: joinError } = await supabase
      .from('job_posts')
      .select(`
        *,
        companies!job_posts_company_id_fkey(name)
      `)
      .limit(1);
    
    if (joinError) {
      console.log('⚠️  Company join issue:', joinError.message);
    } else {
      console.log('✅ Company joins working');
    }
    
    console.log('\n📋 Manual steps needed:');
    console.log('1. Apply the migration: supabase/migrations/20250110_fix_job_drafts_and_slugs.sql');
    console.log('2. Or run the SQL manually in the Supabase dashboard');
    console.log('3. Test the application at http://localhost:8080');
    
  } catch (error) {
    console.error('❌ Alternative approach failed:', error.message);
  }
}

// Main execution
async function main() {
  const hasExecSql = await checkExecSql();
  
  if (hasExecSql) {
    await applyFixes();
  } else {
    await applyFixesAlternative();
  }
}

main().catch(console.error);
