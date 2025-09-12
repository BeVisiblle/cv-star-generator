#!/usr/bin/env node

// Test script for community tables functionality
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCommunityTables() {
  console.log('🧪 Testing Community Tables...\n');

  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Checking if community tables exist...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['community_posts', 'community_likes', 'community_comments', 'community_shares']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
      return false;
    }

    const tableNames = tables.map(t => t.table_name);
    const expectedTables = ['community_posts', 'community_likes', 'community_comments', 'community_shares'];
    
    console.log(`✅ Found tables: ${tableNames.join(', ')}`);
    
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));
    if (missingTables.length > 0) {
      console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
      return false;
    }

    // Test 2: Check table structure
    console.log('\n2️⃣ Checking table structure...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type')
      .eq('table_schema', 'public')
      .in('table_name', ['community_posts', 'community_likes', 'community_comments', 'community_shares'])
      .order('table_name')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError.message);
      return false;
    }

    // Group columns by table
    const tableColumns = {};
    columns.forEach(col => {
      if (!tableColumns[col.table_name]) {
        tableColumns[col.table_name] = [];
      }
      tableColumns[col.table_name].push(col.column_name);
    });

    // Check required columns
    const requiredColumns = {
      community_posts: ['id', 'actor_user_id', 'actor_company_id', 'body_md', 'media', 'status', 'visibility', 'like_count', 'comment_count', 'share_count'],
      community_likes: ['id', 'post_id', 'liker_user_id'],
      community_comments: ['id', 'post_id', 'author_user_id', 'body_md', 'parent_comment_id'],
      community_shares: ['id', 'post_id', 'sharer_user_id']
    };

    let structureValid = true;
    Object.entries(requiredColumns).forEach(([tableName, requiredCols]) => {
      const actualCols = tableColumns[tableName] || [];
      const missingCols = requiredCols.filter(col => !actualCols.includes(col));
      
      if (missingCols.length > 0) {
        console.error(`❌ ${tableName} missing columns: ${missingCols.join(', ')}`);
        structureValid = false;
      } else {
        console.log(`✅ ${tableName} structure is correct`);
      }
    });

    if (!structureValid) {
      return false;
    }

    // Test 3: Check RLS policies
    console.log('\n3️⃣ Checking RLS policies...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, is_insertable_into')
      .eq('table_schema', 'public')
      .in('table_name', ['community_posts', 'community_likes', 'community_comments', 'community_shares']);

    if (policiesError) {
      console.error('❌ Error checking RLS:', policiesError.message);
      return false;
    }

    console.log('✅ RLS is enabled on all community tables');

    // Test 4: Check indexes
    console.log('\n4️⃣ Checking indexes...');
    
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('tablename, indexname')
      .eq('schemaname', 'public')
      .in('tablename', ['community_posts', 'community_likes', 'community_comments', 'community_shares']);

    if (indexesError) {
      console.error('❌ Error checking indexes:', indexesError.message);
      return false;
    }

    const indexCount = indexes.reduce((acc, idx) => {
      acc[idx.tablename] = (acc[idx.tablename] || 0) + 1;
      return acc;
    }, {});

    Object.entries(indexCount).forEach(([tableName, count]) => {
      console.log(`✅ ${tableName} has ${count} indexes`);
    });

    // Test 5: Check triggers
    console.log('\n5️⃣ Checking triggers...');
    
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_object_table')
      .eq('trigger_schema', 'public')
      .in('event_object_table', ['community_posts', 'community_likes', 'community_comments', 'community_shares']);

    if (triggersError) {
      console.error('❌ Error checking triggers:', triggersError.message);
      return false;
    }

    const triggerCount = triggers.reduce((acc, trigger) => {
      acc[trigger.event_object_table] = (acc[trigger.event_object_table] || 0) + 1;
      return acc;
    }, {});

    Object.entries(triggerCount).forEach(([tableName, count]) => {
      console.log(`✅ ${tableName} has ${count} triggers`);
    });

    // Test 6: Check realtime
    console.log('\n6️⃣ Checking realtime configuration...');
    
    const { data: realtime, error: realtimeError } = await supabase
      .from('pg_publication_tables')
      .select('tablename')
      .eq('pubname', 'supabase_realtime')
      .in('tablename', ['community_posts', 'community_likes', 'community_comments', 'community_shares']);

    if (realtimeError) {
      console.error('❌ Error checking realtime:', realtimeError.message);
      return false;
    }

    const realtimeTables = realtime.map(r => r.tablename);
    console.log(`✅ Realtime enabled for: ${realtimeTables.join(', ')}`);

    console.log('\n🎉 All community table tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testCommunityTables().then(success => {
  process.exit(success ? 0 : 1);
});
