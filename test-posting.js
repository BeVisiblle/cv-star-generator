// Test script for posting functionality
// This script tests if posts can be created and retrieved from the database

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPosting() {
  console.log('🧪 Testing Posting Functionality...\n');

  try {
    // Test 1: Check if posts table exists and is accessible
    console.log('1️⃣ Testing posts table access...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.error('❌ Error accessing posts table:', postsError.message);
      return;
    }
    
    console.log('✅ Posts table is accessible');
    console.log(`📊 Found ${posts?.length || 0} existing posts\n`);

    // Test 2: Create a test post
    console.log('2️⃣ Testing post creation...');
    const testPost = {
      id: crypto.randomUUID(),
      content: 'Test post from automated test - ' + new Date().toISOString(),
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy user ID for testing
      post_type: 'text',
      visibility: 'public',
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert([testPost])
      .select();

    if (insertError) {
      console.error('❌ Error creating post:', insertError.message);
      console.error('Details:', insertError);
      return;
    }

    console.log('✅ Post created successfully');
    console.log('📝 Post ID:', newPost[0]?.id);
    console.log('📝 Content:', newPost[0]?.content);

    // Test 3: Retrieve the created post
    console.log('\n3️⃣ Testing post retrieval...');
    const { data: retrievedPost, error: retrieveError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', newPost[0].id)
      .single();

    if (retrieveError) {
      console.error('❌ Error retrieving post:', retrieveError.message);
      return;
    }

    console.log('✅ Post retrieved successfully');
    console.log('📝 Retrieved content:', retrievedPost.content);

    // Test 4: Test storage bucket access
    console.log('\n4️⃣ Testing storage bucket access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error accessing storage:', bucketsError.message);
    } else {
      const postMediaBucket = buckets.find(bucket => bucket.id === 'post-media');
      if (postMediaBucket) {
        console.log('✅ post-media bucket exists');
      } else {
        console.log('⚠️ post-media bucket not found');
      }
    }

    // Test 5: Clean up test post
    console.log('\n5️⃣ Cleaning up test post...');
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', newPost[0].id);

    if (deleteError) {
      console.error('❌ Error deleting test post:', deleteError.message);
    } else {
      console.log('✅ Test post cleaned up');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Posting functionality is working correctly');

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

// Run the test
testPosting();
