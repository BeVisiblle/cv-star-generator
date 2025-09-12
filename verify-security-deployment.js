#!/usr/bin/env node

/**
 * Quick Security Deployment Verification Script
 * 
 * Run this script AFTER applying the security migration to verify
 * that all security measures are working correctly.
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = 'https://koymmvuhcxlvcuoyjnvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function quickVerification() {
  console.log('🔒 Quick Security Deployment Verification\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Check if secure views exist
  try {
    const { data, error } = await supabase
      .from('profiles_public_secure')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ profiles_public_secure view not found');
      failed++;
    } else {
      console.log('✅ profiles_public_secure view exists');
      passed++;
    }
  } catch (e) {
    console.log('❌ profiles_public_secure view not found');
    failed++;
  }

  // Test 2: Check if audit log table exists
  try {
    const { data, error } = await supabase
      .from('security_audit_log')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ security_audit_log table not found');
      failed++;
    } else {
      console.log('✅ security_audit_log table exists');
      passed++;
    }
  } catch (e) {
    console.log('❌ security_audit_log table not found');
    failed++;
  }

  // Test 3: Check if log_security_event function works
  try {
    const { error } = await supabase.rpc('log_security_event', {
      p_action: 'verification_test',
      p_resource_type: 'test',
      p_resource_id: null
    });
    
    if (error) {
      console.log('❌ log_security_event function not working');
      failed++;
    } else {
      console.log('✅ log_security_event function works');
      passed++;
    }
  } catch (e) {
    console.log('❌ log_security_event function not working');
    failed++;
  }

  // Test 4: Check if company secure view exists
  try {
    const { data, error } = await supabase
      .from('companies_public_secure')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ companies_public_secure view not found');
      failed++;
    } else {
      console.log('✅ companies_public_secure view exists');
      passed++;
    }
  } catch (e) {
    console.log('❌ companies_public_secure view not found');
    failed++;
  }

  // Summary
  console.log(`\n📊 Verification Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 Security migration successfully applied!');
    console.log('Your application is now enterprise-grade secure.');
  } else {
    console.log('\n⚠️  Migration may not be fully applied.');
    console.log('Please check the Supabase Dashboard and re-run the migration.');
  }

  return failed === 0;
}

quickVerification()
  .then(success => {
    if (success) {
      console.log('\n✅ Next steps:');
      console.log('1. Run the full security test: node test-security-implementation.js');
      console.log('2. Test your application functionality');
      console.log('3. Monitor audit logs in Supabase Dashboard');
    } else {
      console.log('\n❌ Please apply the security migration first.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
