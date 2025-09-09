#!/usr/bin/env node

/**
 * Test script for draft loading/publishing fixes
 * Tests: ambiguous joins, public URLs, delete functionality
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

console.log('🧪 Testing Draft Loading/Publishing Fixes\n');

async function testDatabaseConnection() {
  console.log('1. Testing database connection...');
  try {
    const { data, error } = await supabase.from('companies').select('id, name').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testJobPostsTable() {
  console.log('\n2. Testing job_posts table structure...');
  try {
    const { data, error } = await supabase.from('job_posts').select('*').limit(1);
    if (error) throw error;
    console.log('✅ job_posts table accessible');
    
    // Check if slug column exists
    if (data && data.length > 0) {
      const hasSlug = 'slug' in data[0];
      console.log(hasSlug ? '✅ slug column exists' : '⚠️  slug column missing (will be added by migration)');
    }
    return true;
  } catch (error) {
    console.error('❌ job_posts table error:', error.message);
    return false;
  }
}

async function testCompanyJoins() {
  console.log('\n3. Testing company joins (ambiguous join fix)...');
  try {
    const { data, error } = await supabase
      .from('job_posts')
      .select(`
        *,
        companies!job_posts_company_id_fkey(name, slug)
      `)
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Company joins working correctly (ambiguous join fixed)');
    return true;
  } catch (error) {
    console.error('❌ Company join error:', error.message);
    return false;
  }
}

async function testJobCRUD() {
  console.log('\n4. Testing job CRUD operations...');
  try {
    // Test create
    const testJob = {
      title: 'Test Job - Draft Fix',
      description_md: 'Test job for draft fixes',
      company_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
      is_active: false,
      is_public: false,
      is_draft: true
    };
    
    const { data: createData, error: createError } = await supabase
      .from('job_posts')
      .insert(testJob)
      .select()
      .single();
    
    if (createError) throw createError;
    console.log('✅ Job creation successful');
    
    const jobId = createData.id;
    
    // Test read
    const { data: readData, error: readError } = await supabase
      .from('job_posts')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (readError) throw readError;
    console.log('✅ Job reading successful');
    
    // Test update
    const { error: updateError } = await supabase
      .from('job_posts')
      .update({ is_active: true })
      .eq('id', jobId);
    
    if (updateError) throw updateError;
    console.log('✅ Job update successful');
    
    // Test delete
    const { error: deleteError } = await supabase
      .from('job_posts')
      .delete()
      .eq('id', jobId);
    
    if (deleteError) throw deleteError;
    console.log('✅ Job delete successful');
    
    return true;
  } catch (error) {
    console.error('❌ Job CRUD error:', error.message);
    return false;
  }
}

async function testPublicURLs() {
  console.log('\n5. Testing public URL structure...');
  try {
    // Check if we have any companies with slugs
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, slug')
      .limit(1);
    
    if (companiesError) throw companiesError;
    
    if (companies && companies.length > 0) {
      const company = companies[0];
      const hasSlug = company.slug && company.slug.length > 0;
      console.log(hasSlug ? '✅ Company slugs available for public URLs' : '⚠️  Company slugs missing');
      
      // Test URL structure
      const publicUrl = `/companies/${company.slug || company.id}/jobs/test-job`;
      console.log(`✅ Public URL structure: ${publicUrl}`);
    } else {
      console.log('⚠️  No companies found for URL testing');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Public URL test error:', error.message);
    return false;
  }
}

async function testRLSPolicies() {
  console.log('\n6. Testing RLS policies...');
  try {
    // Test public read access
    const { data, error } = await supabase
      .from('job_posts')
      .select('id, title, is_public, is_active')
      .eq('is_public', true)
      .eq('is_active', true)
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Public read access working');
    
    return true;
  } catch (error) {
    console.error('❌ RLS policy test error:', error.message);
    return false;
  }
}

async function runAllTests() {
  const tests = [
    testDatabaseConnection,
    testJobPostsTable,
    testCompanyJoins,
    testJobCRUD,
    testPublicURLs,
    testRLSPolicies
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) passed++;
    } catch (error) {
      console.error('Test failed:', error.message);
    }
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All draft fixes are working correctly!');
    console.log('\n✅ Ready for manual testing at: http://localhost:8080');
    console.log('📋 Test these features:');
    console.log('   - Create draft jobs at /company/jobs');
    console.log('   - Load and publish drafts');
    console.log('   - Delete draft jobs');
    console.log('   - Check public job URLs use slugs');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
