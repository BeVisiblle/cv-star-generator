import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSearchComponents() {
  console.log('🔍 Testing Search Components with Real Data...\n');

  try {
    // Test 1: Test search functionality with actual database queries
    console.log('📊 Testing Database Search Queries...');
    
    // Test profiles search
    console.log('\n👥 Testing Profiles Search...');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, vorname, nachname, avatar_url, headline')
        .limit(5);

      if (profilesError) {
        console.log(`❌ Profiles search: ${profilesError.message}`);
      } else {
        console.log(`✅ Profiles search: Found ${profiles.length} profiles`);
        if (profiles.length > 0) {
          console.log(`   Sample: ${profiles[0].vorname} ${profiles[0].nachname}`);
        }
      }
    } catch (err) {
      console.log(`❌ Profiles search: ${err.message}`);
    }

    // Test companies search
    console.log('\n🏢 Testing Companies Search...');
    try {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, logo_url, description')
        .limit(5);

      if (companiesError) {
        console.log(`❌ Companies search: ${companiesError.message}`);
      } else {
        console.log(`✅ Companies search: Found ${companies.length} companies`);
        if (companies.length > 0) {
          console.log(`   Sample: ${companies[0].name}`);
        }
      }
    } catch (err) {
      console.log(`❌ Companies search: ${err.message}`);
    }

    // Test posts search
    console.log('\n📝 Testing Posts Search...');
    try {
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, content, created_at, author_id')
        .limit(5);

      if (postsError) {
        console.log(`❌ Posts search: ${postsError.message}`);
      } else {
        console.log(`✅ Posts search: Found ${posts.length} posts`);
        if (posts.length > 0) {
          console.log(`   Sample: ${posts[0].content?.substring(0, 50)}...`);
        }
      }
    } catch (err) {
      console.log(`❌ Posts search: ${err.message}`);
    }

    // Test groups search
    console.log('\n👥 Testing Groups Search...');
    try {
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, description, member_count')
        .limit(5);

      if (groupsError) {
        console.log(`❌ Groups search: ${groupsError.message}`);
      } else {
        console.log(`✅ Groups search: Found ${groups.length} groups`);
        if (groups.length > 0) {
          console.log(`   Sample: ${groups[0].name}`);
        }
      }
    } catch (err) {
      console.log(`❌ Groups search: ${err.message}`);
    }

    // Test 2: Test search with different query patterns
    console.log('\n🔍 Testing Search Patterns...');
    
    const searchQueries = ['test', 'ausbildung', 'job', 'company'];
    
    for (const query of searchQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      // Test profiles with query
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, vorname, nachname')
          .or(`vorname.ilike.%${query}%,nachname.ilike.%${query}%`)
          .limit(3);

        if (error) {
          console.log(`   ❌ Profiles: ${error.message}`);
        } else {
          console.log(`   ✅ Profiles: ${profiles.length} results`);
        }
      } catch (err) {
        console.log(`   ❌ Profiles: ${err.message}`);
      }

      // Test companies with query
      try {
        const { data: companies, error } = await supabase
          .from('companies')
          .select('id, name')
          .ilike('name', `%${query}%`)
          .limit(3);

        if (error) {
          console.log(`   ❌ Companies: ${error.message}`);
        } else {
          console.log(`   ✅ Companies: ${companies.length} results`);
        }
      } catch (err) {
        console.log(`   ❌ Companies: ${err.message}`);
      }
    }

    // Test 3: Test right-rail recommendations
    console.log('\n🎯 Testing Right-Rail Recommendations...');
    
    // Test trending hashtags (if table exists)
    try {
      const { data: hashtags, error } = await supabase
        .from('hashtags')
        .select('tag, usage_count')
        .order('usage_count', { ascending: false })
        .limit(5);

      if (error) {
        console.log(`❌ Trending hashtags: ${error.message}`);
      } else {
        console.log(`✅ Trending hashtags: Found ${hashtags.length} hashtags`);
        if (hashtags.length > 0) {
          console.log(`   Sample: #${hashtags[0].tag} (${hashtags[0].usage_count} uses)`);
        }
      }
    } catch (err) {
      console.log(`❌ Trending hashtags: ${err.message}`);
    }

    // Test recommended groups
    try {
      const { data: groups, error } = await supabase
        .from('groups')
        .select('id, name, description, member_count')
        .order('member_count', { ascending: false })
        .limit(5);

      if (error) {
        console.log(`❌ Recommended groups: ${error.message}`);
      } else {
        console.log(`✅ Recommended groups: Found ${groups.length} groups`);
        if (groups.length > 0) {
          console.log(`   Sample: ${groups[0].name} (${groups[0].member_count} members)`);
        }
      }
    } catch (err) {
      console.log(`❌ Recommended groups: ${err.message}`);
    }

    console.log('\n🎉 Search Components Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testSearchComponents();
