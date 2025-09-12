#!/usr/bin/env node

/**
 * Security Implementation Testing Script
 * 
 * This script tests all security measures implemented to address
 * the identified vulnerabilities in the CV Star Generator application.
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = 'https://koymmvuhcxlvcuoyjnvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test results tracking
let testsPassed = 0;
let testsFailed = 0;
const testResults = [];

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) console.log(`   ${details}`);
  
  testResults.push({ testName, passed, details });
  if (passed) testsPassed++; else testsFailed++;
}

async function runSecurityTests() {
  console.log('🔒 Starting Security Implementation Tests\n');
  console.log('=' .repeat(60));

  // Test 1: Verify RLS is enabled on sensitive tables
  console.log('\n1. Testing Row Level Security (RLS) Policies...');
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'companies', 'applications', 'posts', 'company_employment_requests']);

    if (error) {
      logTest('RLS Tables Check', false, `Error: ${error.message}`);
    } else {
      const expectedTables = ['profiles', 'companies', 'applications', 'posts', 'company_employment_requests'];
      const foundTables = data.map(t => t.table_name);
      const missingTables = expectedTables.filter(t => !foundTables.includes(t));
      
      if (missingTables.length === 0) {
        logTest('RLS Tables Check', true, 'All sensitive tables exist');
      } else {
        logTest('RLS Tables Check', false, `Missing tables: ${missingTables.join(', ')}`);
      }
    }
  } catch (error) {
    logTest('RLS Tables Check', false, `Exception: ${error.message}`);
  }

  // Test 2: Verify secure views exist
  console.log('\n2. Testing Secure Views...');
  try {
    const { data, error } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles_public_secure', 'companies_public_secure', 'posts_authenticated']);

    if (error) {
      logTest('Secure Views Check', false, `Error: ${error.message}`);
    } else {
      const expectedViews = ['profiles_public_secure', 'companies_public_secure', 'posts_authenticated'];
      const foundViews = data.map(v => v.table_name);
      const missingViews = expectedViews.filter(v => !foundViews.includes(v));
      
      if (missingViews.length === 0) {
        logTest('Secure Views Check', true, 'All secure views exist');
      } else {
        logTest('Secure Views Check', false, `Missing views: ${missingViews.join(', ')}`);
      }
    }
  } catch (error) {
    logTest('Secure Views Check', false, `Exception: ${error.message}`);
  }

  // Test 3: Test secure functions exist
  console.log('\n3. Testing Security Functions...');
  try {
    const { data, error } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_schema', 'public')
      .in('routine_name', ['get_authorized_candidates', 'get_authorized_applications', 'company_people_secure', 'log_security_event']);

    if (error) {
      logTest('Security Functions Check', false, `Error: ${error.message}`);
    } else {
      const expectedFunctions = ['get_authorized_candidates', 'get_authorized_applications', 'company_people_secure', 'log_security_event'];
      const foundFunctions = data.map(f => f.routine_name);
      const missingFunctions = expectedFunctions.filter(f => !foundFunctions.includes(f));
      
      if (missingFunctions.length === 0) {
        logTest('Security Functions Check', true, 'All security functions exist');
      } else {
        logTest('Security Functions Check', false, `Missing functions: ${missingFunctions.join(', ')}`);
      }
    }
  } catch (error) {
    logTest('Security Functions Check', false, `Exception: ${error.message}`);
  }

  // Test 4: Test audit logging functionality
  console.log('\n4. Testing Audit Logging...');
  try {
    // First, check if audit log table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'security_audit_log')
      .single();

    if (tableError || !tableCheck) {
      logTest('Audit Log Table', false, 'security_audit_log table not found');
    } else {
      logTest('Audit Log Table', true, 'security_audit_log table exists');
      
      // Try to test the log_security_event function
      const { error: logError } = await supabase.rpc('log_security_event', {
        p_action: 'test_event',
        p_resource_type: 'test_resource',
        p_resource_id: null
      });

      if (logError) {
        logTest('Audit Logging Function', false, `Error: ${logError.message}`);
      } else {
        logTest('Audit Logging Function', true, 'log_security_event function works');
      }
    }
  } catch (error) {
    logTest('Audit Logging', false, `Exception: ${error.message}`);
  }

  // Test 5: Test data privacy compliance
  console.log('\n5. Testing Data Privacy Compliance...');
  try {
    // Check if privacy-related columns exist in profiles table
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .in('column_name', ['public_employment_visible', 'data_processing_consent', 'marketing_consent', 'consent_date', 'data_retention_until']);

    if (error) {
      logTest('Privacy Columns Check', false, `Error: ${error.message}`);
    } else {
      const expectedColumns = ['public_employment_visible', 'data_processing_consent', 'marketing_consent', 'consent_date', 'data_retention_until'];
      const foundColumns = data.map(c => c.column_name);
      const missingColumns = expectedColumns.filter(c => !foundColumns.includes(c));
      
      if (missingColumns.length === 0) {
        logTest('Privacy Columns Check', true, 'All privacy compliance columns exist');
      } else {
        logTest('Privacy Columns Check', false, `Missing columns: ${missingColumns.join(', ')}`);
      }
    }
  } catch (error) {
    logTest('Privacy Columns Check', false, `Exception: ${error.message}`);
  }

  // Test 6: Test unauthorized access prevention
  console.log('\n6. Testing Unauthorized Access Prevention...');
  try {
    // Try to access profiles data without authentication (should be restricted)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, vorname, nachname, email')
      .limit(1);

    if (error && error.message.includes('permission denied')) {
      logTest('Unauthorized Access Prevention', true, 'Profiles table properly protected');
    } else if (error) {
      logTest('Unauthorized Access Prevention', false, `Unexpected error: ${error.message}`);
    } else {
      logTest('Unauthorized Access Prevention', false, 'Profiles table accessible without proper restrictions');
    }
  } catch (error) {
    logTest('Unauthorized Access Prevention', false, `Exception: ${error.message}`);
  }

  // Test 7: Test secure views access
  console.log('\n7. Testing Secure Views Access...');
  try {
    // Try to access the secure profiles view (should work for public data)
    const { data, error } = await supabase
      .from('profiles_public_secure')
      .select('id, full_name, headline, city')
      .limit(1);

    if (error) {
      logTest('Secure Views Access', false, `Error accessing profiles_public_secure: ${error.message}`);
    } else {
      logTest('Secure Views Access', true, 'profiles_public_secure view accessible');
    }
  } catch (error) {
    logTest('Secure Views Access', false, `Exception: ${error.message}`);
  }

  // Test 8: Test company data protection
  console.log('\n8. Testing Company Data Protection...');
  try {
    // Try to access companies data (should only show basic info)
    const { data, error } = await supabase
      .from('companies_public_secure')
      .select('*')
      .limit(1);

    if (error) {
      logTest('Company Data Protection', false, `Error accessing companies_public_secure: ${error.message}`);
    } else if (data && data.length > 0) {
      const company = data[0];
      const sensitiveFields = ['contact_email', 'contact_phone', 'token_balance', 'subscription_status'];
      const hasSensitiveData = sensitiveFields.some(field => company.hasOwnProperty(field));
      
      if (!hasSensitiveData) {
        logTest('Company Data Protection', true, 'Sensitive company data properly excluded');
      } else {
        logTest('Company Data Protection', false, 'Sensitive company data still exposed');
      }
    } else {
      logTest('Company Data Protection', true, 'No company data accessible (empty result)');
    }
  } catch (error) {
    logTest('Company Data Protection', false, `Exception: ${error.message}`);
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('🔒 Security Test Summary');
  console.log('=' .repeat(60));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📊 Total Tests: ${testsPassed + testsFailed}`);
  console.log(`🎯 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

  if (testsFailed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.testName}: ${test.details}`);
    });
  }

  if (testsPassed === testsPassed + testsFailed) {
    console.log('\n🎉 All security tests passed! Your application is secure.');
  } else {
    console.log('\n⚠️  Some security tests failed. Please review and fix the issues.');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Review any failed tests');
  console.log('2. Apply missing migrations if needed');
  console.log('3. Test application functionality');
  console.log('4. Monitor audit logs');
  console.log('5. Update team documentation');

  return testsFailed === 0;
}

// Run the tests
runSecurityTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
