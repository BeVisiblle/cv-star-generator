#!/usr/bin/env node

// Debug script for community feed issues
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

async function debugCommunityFeed() {
  console.log('🔍 Debugging Community Feed Issues...\n');

  try {
    // Test 1: Check if community_posts table exists and has data
    console.log('1️⃣ Checking community_posts table...');
    
    const { data: posts, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .limit(5);

    if (postsError) {
      console.error('❌ Error accessing community_posts:', postsError.message);
      
      // Check if table exists at all
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'community_posts');

      if (tablesError) {
        console.error('❌ Error checking tables:', tablesError.message);
      } else if (tables.length === 0) {
        console.log('❌ community_posts table does not exist!');
        console.log('📋 You need to apply the migration: supabase/migrations/20250912140000_fix_community_tables.sql');
        return false;
      }
    } else {
      console.log(`✅ community_posts table exists with ${posts.length} posts`);
      
      if (posts.length > 0) {
        console.log('📝 Sample post:', {
          id: posts[0].id,
          body_md: posts[0].body_md?.substring(0, 50) + '...',
          status: posts[0].status,
          actor_user_id: posts[0].actor_user_id,
          actor_company_id: posts[0].actor_company_id,
          created_at: posts[0].created_at
        });
      }
    }

    // Test 2: Check profiles table
    console.log('\n2️⃣ Checking profiles table...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, vorname, nachname, avatar_url')
      .limit(3);

    if (profilesError) {
      console.error('❌ Error accessing profiles:', profilesError.message);
    } else {
      console.log(`✅ profiles table exists with ${profiles.length} profiles`);
      if (profiles.length > 0) {
        console.log('👤 Sample profile:', {
          id: profiles[0].id,
          name: `${profiles[0].vorname} ${profiles[0].nachname}`,
          avatar_url: profiles[0].avatar_url
        });
      }
    }

    // Test 3: Check companies table
    console.log('\n3️⃣ Checking companies table...');
    
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, logo_url')
      .limit(3);

    if (companiesError) {
      console.error('❌ Error accessing companies:', companiesError.message);
    } else {
      console.log(`✅ companies table exists with ${companies.length} companies`);
      if (companies.length > 0) {
        console.log('🏢 Sample company:', {
          id: companies[0].id,
          name: companies[0].name,
          logo_url: companies[0].logo_url
        });
      }
    }

    // Test 4: Check community_likes table
    console.log('\n4️⃣ Checking community_likes table...');
    
    const { data: likes, error: likesError } = await supabase
      .from('community_likes')
      .select('*')
      .limit(3);

    if (likesError) {
      console.error('❌ Error accessing community_likes:', likesError.message);
    } else {
      console.log(`✅ community_likes table exists with ${likes.length} likes`);
    }

    // Test 5: Check community_comments table
    console.log('\n5️⃣ Checking community_comments table...');
    
    const { data: comments, error: commentsError } = await supabase
      .from('community_comments')
      .select('*')
      .limit(3);

    if (commentsError) {
      console.error('❌ Error accessing community_comments:', commentsError.message);
    } else {
      console.log(`✅ community_comments table exists with ${comments.length} comments`);
    }

    // Test 6: Simulate the feed query
    console.log('\n6️⃣ Testing feed query...');
    
    const { data: feedPosts, error: feedError } = await supabase
      .from('community_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5);

    if (feedError) {
      console.error('❌ Error in feed query:', feedError.message);
    } else {
      console.log(`✅ Feed query successful, found ${feedPosts.length} published posts`);
      
      if (feedPosts.length === 0) {
        console.log('⚠️  No published posts found! This is why the feed is empty.');
        console.log('💡 Try creating some test posts with: node create-test-posts.js');
      }
    }

    // Test 7: Check authentication
    console.log('\n7️⃣ Checking authentication...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
    } else if (user) {
      console.log(`✅ User authenticated: ${user.email}`);
    } else {
      console.log('⚠️  No user authenticated - this might affect RLS policies');
    }

    console.log('\n🎯 Summary:');
    if (postsError) {
      console.log('❌ Main issue: community_posts table not accessible');
      console.log('📋 Solution: Apply the migration first');
    } else if (feedPosts.length === 0) {
      console.log('❌ Main issue: No published posts in database');
      console.log('💡 Solution: Create test posts');
    } else {
      console.log('✅ Database structure looks good');
      console.log('🔍 Check the browser console for JavaScript errors');
    }

    return true;

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    return false;
  }
}

// Run the debug
debugCommunityFeed().then(success => {
  process.exit(success ? 0 : 1);
});
