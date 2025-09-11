import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCommunityFeatures() {
  console.log('🔍 Testing Community Features...\n');

  try {
    // Test 1: Check if community tables exist
    console.log('📊 Testing Community Tables...');
    
    const tables = [
      'profiles', 'posts', 'reactions', 'comments', 'comment_reactions',
      'polls', 'poll_options', 'poll_votes', 'events', 'event_rsvps',
      'attachments', 'attachment_links', 'saved_posts', 'post_reports',
      'post_mutes', 'hashtags', 'post_hashtags', 'groups', 'group_members',
      'connections', 'follows'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Table exists`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    // Test 2: Check RPC functions
    console.log('\n🔧 Testing RPC Functions...');
    
    const functions = [
      'get_enhanced_feed',
      'search_autocomplete',
      'search_all',
      'get_interesting_profiles'
    ];

    for (const func of functions) {
      try {
        const { data, error } = await supabase.rpc(func, {});
        if (error) {
          console.log(`❌ ${func}: ${error.message}`);
        } else {
          console.log(`✅ ${func}: Function exists`);
        }
      } catch (err) {
        console.log(`❌ ${func}: ${err.message}`);
      }
    }

    // Test 3: Check views
    console.log('\n👁️ Testing Views...');
    
    const views = [
      'trending_hashtags',
      'recommended_groups',
      'post_statistics'
    ];

    for (const view of views) {
      try {
        const { data, error } = await supabase.from(view).select('*').limit(1);
        if (error) {
          console.log(`❌ ${view}: ${error.message}`);
        } else {
          console.log(`✅ ${view}: View exists`);
        }
      } catch (err) {
        console.log(`❌ ${view}: ${err.message}`);
      }
    }

    // Test 4: Test basic CRUD operations
    console.log('\n📝 Testing Basic CRUD Operations...');
    
    // Test creating a test post
    try {
      const { data: testPost, error: postError } = await supabase
        .from('posts')
        .insert({
          content: 'Test post for community features',
          post_type: 'text',
          author_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
        })
        .select()
        .single();

      if (postError) {
        console.log(`❌ Create post: ${postError.message}`);
      } else {
        console.log(`✅ Create post: Success (ID: ${testPost.id})`);
        
        // Clean up test post
        await supabase.from('posts').delete().eq('id', testPost.id);
        console.log(`🧹 Cleaned up test post`);
      }
    } catch (err) {
      console.log(`❌ Create post: ${err.message}`);
    }

    console.log('\n🎉 Community Features Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testCommunityFeatures();
