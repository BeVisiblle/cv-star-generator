import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSearchFunctionality() {
  console.log('🔍 Testing Search Functionality...\n');

  try {
    // Test 1: Check if search API endpoints exist
    console.log('📡 Testing Search API Endpoints...');
    
    const searchEndpoints = [
      '/api/search/autocomplete',
      '/api/search/all',
      '/api/trending/hashtags',
      '/api/recommendations/groups'
    ];

    for (const endpoint of searchEndpoints) {
      try {
        const response = await fetch(`http://localhost:8080${endpoint}?q=test`);
        if (response.ok) {
          console.log(`✅ ${endpoint}: Available`);
        } else {
          console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.log(`❌ ${endpoint}: ${err.message}`);
      }
    }

    // Test 2: Test search components integration
    console.log('\n🧩 Testing Search Components...');
    
    // Check if search components exist
    const fs = await import('fs');
    const searchComponents = [
      'src/components/search/GlobalSearchBar.tsx',
      'src/components/search/SearchAutocomplete.tsx',
      'src/components/search/SearchResults.tsx',
      'src/components/sidebars/TrendingHashtags.tsx',
      'src/components/sidebars/RecommendedGroups.tsx',
      'src/components/sidebars/RightRail.tsx'
    ];

    for (const component of searchComponents) {
      try {
        if (fs.existsSync(component)) {
          console.log(`✅ ${component}: Exists`);
        } else {
          console.log(`❌ ${component}: Missing`);
        }
      } catch (err) {
        console.log(`❌ ${component}: ${err.message}`);
      }
    }

    // Test 3: Test search page
    console.log('\n📄 Testing Search Page...');
    
    try {
      if (fs.existsSync('src/pages/search.tsx')) {
        console.log(`✅ Search page: Exists`);
      } else {
        console.log(`❌ Search page: Missing`);
      }
    } catch (err) {
      console.log(`❌ Search page: ${err.message}`);
    }

    // Test 4: Test right-rail integration
    console.log('\n🎯 Testing Right-Rail Integration...');
    
    try {
      const dashboardContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
      if (dashboardContent.includes('RightRail')) {
        console.log(`✅ RightRail: Integrated in Dashboard`);
      } else {
        console.log(`❌ RightRail: Not integrated in Dashboard`);
      }
    } catch (err) {
      console.log(`❌ RightRail integration: ${err.message}`);
    }

    // Test 5: Test search functionality with mock data
    console.log('\n🔍 Testing Search with Mock Data...');
    
    // Test profiles search
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, vorname, nachname, avatar_url')
        .ilike('vorname', '%test%')
        .limit(5);

      if (profilesError) {
        console.log(`❌ Profiles search: ${profilesError.message}`);
      } else {
        console.log(`✅ Profiles search: Found ${profiles.length} results`);
      }
    } catch (err) {
      console.log(`❌ Profiles search: ${err.message}`);
    }

    // Test companies search
    try {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, logo_url')
        .ilike('name', '%test%')
        .limit(5);

      if (companiesError) {
        console.log(`❌ Companies search: ${companiesError.message}`);
      } else {
        console.log(`✅ Companies search: Found ${companies.length} results`);
      }
    } catch (err) {
      console.log(`❌ Companies search: ${err.message}`);
    }

    // Test posts search
    try {
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, content, created_at')
        .ilike('content', '%test%')
        .limit(5);

      if (postsError) {
        console.log(`❌ Posts search: ${postsError.message}`);
      } else {
        console.log(`✅ Posts search: Found ${posts.length} results`);
      }
    } catch (err) {
      console.log(`❌ Posts search: ${err.message}`);
    }

    console.log('\n🎉 Search Functionality Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testSearchFunctionality();
