import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDatabaseMigrations() {
  console.log('🗄️ Testing Database Migrations...\n');

  try {
    // Test 1: Check Migration Files
    console.log('📁 Testing Migration Files...');
    
    const migrationDir = 'supabase/migrations';
    let migrationFiles = [];
    
    if (fs.existsSync(migrationDir)) {
      migrationFiles = fs.readdirSync(migrationDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    }
    
    console.log(`✅ Found ${migrationFiles.length} migration files`);
    for (const file of migrationFiles) {
      console.log(`  - ${file}`);
    }
    console.log(`📊 Migration Files Score: ${migrationFiles.length}`);

    // Test 2: Check Core Tables
    console.log('\n🏗️ Testing Core Tables...');
    
    const coreTables = [
      'profiles',
      'companies',
      'job_posts',
      'applications',
      'candidates',
      'posts',
      'comments',
      'reactions',
      'groups',
      'group_members',
      'connections',
      'follows'
    ];

    let coreTableScore = 0;
    for (const table of coreTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible`);
          coreTableScore++;
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    console.log(`📊 Core Tables Score: ${coreTableScore}/${coreTables.length}`);

    // Test 3: Check Community Features Tables
    console.log('\n👥 Testing Community Features Tables...');
    
    const communityTables = [
      'bookmarks',
      'reports',
      'hidden_posts',
      'snoozed_posts',
      'hashtags',
      'post_hashtags',
      'trending_hashtags',
      'interesting_profiles',
      'interesting_companies'
    ];

    let communityTableScore = 0;
    for (const table of communityTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible`);
          communityTableScore++;
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    console.log(`📊 Community Tables Score: ${communityTableScore}/${communityTables.length}`);

    // Test 4: Check Storage Buckets
    console.log('\n📦 Testing Storage Buckets...');
    
    const buckets = [
      'images',
      'attachments',
      'avatars',
      'company-logos',
      'documents'
    ];

    let bucketScore = 0;
    for (const bucket of buckets) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .list('', { limit: 1 });

        if (error) {
          console.log(`❌ ${bucket}: ${error.message}`);
        } else {
          console.log(`✅ ${bucket}: Accessible`);
          bucketScore++;
        }
      } catch (err) {
        console.log(`❌ ${bucket}: ${err.message}`);
      }
    }
    console.log(`📊 Storage Buckets Score: ${bucketScore}/${buckets.length}`);

    // Test 5: Check RLS Policies
    console.log('\n🔒 Testing RLS Policies...');
    
    const rlsTables = [
      'profiles',
      'companies',
      'job_posts',
      'posts',
      'comments',
      'reactions',
      'bookmarks',
      'reports'
    ];

    let rlsScore = 0;
    for (const table of rlsTables) {
      try {
        // Try to query with RLS enabled
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && error.message.includes('row-level security')) {
          console.log(`✅ ${table}: RLS enabled`);
          rlsScore++;
        } else if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`⚠️ ${table}: RLS may not be enabled`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    console.log(`📊 RLS Policies Score: ${rlsScore}/${rlsTables.length}`);

    // Test 6: Check Functions
    console.log('\n⚙️ Testing Database Functions...');
    
    const functions = [
      'get_enhanced_feed',
      'get_interesting_profiles',
      'get_interesting_companies',
      'get_trending_hashtags',
      'get_user_bookmarks',
      'get_user_hidden_posts',
      'get_user_snoozed_posts',
      'cleanup_expired_snoozed_posts'
    ];

    let functionScore = 0;
    for (const func of functions) {
      try {
        const { data, error } = await supabase.rpc(func, {});
        
        if (error) {
          if (error.message.includes('function') && error.message.includes('does not exist')) {
            console.log(`❌ ${func}: Function does not exist`);
          } else {
            console.log(`✅ ${func}: Function exists (${error.message})`);
            functionScore++;
          }
        } else {
          console.log(`✅ ${func}: Function working`);
          functionScore++;
        }
      } catch (err) {
        console.log(`❌ ${func}: ${err.message}`);
      }
    }
    console.log(`📊 Functions Score: ${functionScore}/${functions.length}`);

    // Test 7: Check Indexes
    console.log('\n📊 Testing Database Indexes...');
    
    const indexQueries = [
      'SELECT * FROM pg_indexes WHERE tablename = \'profiles\'',
      'SELECT * FROM pg_indexes WHERE tablename = \'posts\'',
      'SELECT * FROM pg_indexes WHERE tablename = \'job_posts\'',
      'SELECT * FROM pg_indexes WHERE tablename = \'bookmarks\''
    ];

    let indexScore = 0;
    for (const query of indexQueries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: query });
        
        if (error) {
          console.log(`❌ Index query failed: ${error.message}`);
        } else {
          console.log(`✅ Index query successful`);
          indexScore++;
        }
      } catch (err) {
        console.log(`❌ Index query error: ${err.message}`);
      }
    }
    console.log(`📊 Indexes Score: ${indexScore}/${indexQueries.length}`);

    // Test 8: Check Data Integrity
    console.log('\n🔍 Testing Data Integrity...');
    
    const integrityChecks = [
      {
        name: 'Profiles have required fields',
        query: 'SELECT COUNT(*) FROM profiles WHERE id IS NOT NULL'
      },
      {
        name: 'Companies have required fields',
        query: 'SELECT COUNT(*) FROM companies WHERE id IS NOT NULL'
      },
      {
        name: 'Job posts have required fields',
        query: 'SELECT COUNT(*) FROM job_posts WHERE id IS NOT NULL'
      }
    ];

    let integrityScore = 0;
    for (const check of integrityChecks) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: check.query });
        
        if (error) {
          console.log(`❌ ${check.name}: ${error.message}`);
        } else {
          console.log(`✅ ${check.name}: Passed`);
          integrityScore++;
        }
      } catch (err) {
        console.log(`❌ ${check.name}: ${err.message}`);
      }
    }
    console.log(`📊 Data Integrity Score: ${integrityScore}/${integrityChecks.length}`);

    // Overall Score
    const totalScore = coreTableScore + communityTableScore + bucketScore + rlsScore + functionScore + indexScore + integrityScore;
    const maxScore = coreTables.length + communityTables.length + buckets.length + rlsTables.length + functions.length + indexQueries.length + integrityChecks.length;
    
    console.log('\n🎯 Overall Database Migration Test Results:');
    console.log(`📊 Total Score: ${totalScore}/${maxScore} (${Math.round((totalScore/maxScore)*100)}%)`);
    
    if (totalScore >= maxScore * 0.8) {
      console.log('🎉 Excellent! Database migrations are well applied.');
    } else if (totalScore >= maxScore * 0.6) {
      console.log('✅ Good! Most migrations are applied, some improvements needed.');
    } else {
      console.log('⚠️ Needs improvement. Several migrations are missing or not applied.');
    }

    // Specific Recommendations
    console.log('\n💡 Recommendations:');
    if (communityTableScore < communityTables.length) {
      console.log('  - Apply community features migration (bookmarking-sharing-moderation.sql)');
    }
    if (bucketScore < buckets.length) {
      console.log('  - Apply storage buckets migration (media-storage-setup.sql)');
    }
    if (functionScore < functions.length) {
      console.log('  - Apply community functions migration (20250109_complete_community_features.sql)');
    }

    console.log('\n🎉 Database Migration Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testDatabaseMigrations();
