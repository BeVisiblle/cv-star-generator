import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAllFeaturesEndToEnd() {
  console.log('🧪 Testing All Features End-to-End...\n');

  try {
    let totalScore = 0;
    let maxScore = 0;

    // Test 1: Core Database Tables
    console.log('🗄️ Testing Core Database Tables...');
    const coreTables = [
      'profiles',
      'companies', 
      'job_posts',
      'applications',
      'candidates',
      'posts',
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
    totalScore += coreTableScore;
    maxScore += coreTables.length;

    // Test 2: Community Features Tables
    console.log('\n👥 Testing Community Features Tables...');
    const communityTables = [
      'bookmarks',
      'reports',
      'hidden_posts',
      'snoozed_posts'
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
    totalScore += communityTableScore;
    maxScore += communityTables.length;

    // Test 3: Storage Buckets
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
    totalScore += bucketScore;
    maxScore += buckets.length;

    // Test 4: Component Files
    console.log('\n🧩 Testing Component Files...');
    const components = [
      'src/components/upload/AttachmentUploader.tsx',
      'src/components/upload/FilePreview.tsx',
      'src/components/viewer/LightboxModal.tsx',
      'src/components/viewer/PdfInlineViewer.tsx',
      'src/components/post/BookmarkButton.tsx',
      'src/components/post/ShareMenu.tsx',
      'src/components/post/PostMoreMenu.tsx',
      'src/components/community/CommunityComposer.tsx',
      'src/components/community/CommunityPostCard.tsx',
      'src/components/community/PostCard.tsx',
      'src/components/community/NewPostComposer.tsx',
      'src/components/marketplace/MarketplaceComposer.tsx'
    ];

    let componentScore = 0;
    for (const component of components) {
      if (fs.existsSync(component)) {
        console.log(`✅ ${component}: Exists`);
        componentScore++;
      } else {
        console.log(`❌ ${component}: Missing`);
      }
    }
    console.log(`📊 Component Score: ${componentScore}/${components.length}`);
    totalScore += componentScore;
    maxScore += components.length;

    // Test 5: Upload Utilities
    console.log('\n🔧 Testing Upload Utilities...');
    try {
      const uploadUtils = fs.readFileSync('src/lib/uploads.ts', 'utf8');
      
      const utilityChecks = [
        { name: 'MAX_FILE_BYTES', check: uploadUtils.includes('MAX_FILE_BYTES') },
        { name: 'ALLOWED_MIME', check: uploadUtils.includes('ALLOWED_MIME') },
        { name: 'isAllowedFile', check: uploadUtils.includes('isAllowedFile') },
        { name: 'humanFileSize', check: uploadUtils.includes('humanFileSize') },
        { name: 'uploadToSupabase', check: uploadUtils.includes('uploadToSupabase') },
        { name: 'UploadedAttachment type', check: uploadUtils.includes('UploadedAttachment') }
      ];

      let utilityScore = 0;
      for (const check of utilityChecks) {
        if (check.check) {
          console.log(`✅ ${check.name}: Implemented`);
          utilityScore++;
        } else {
          console.log(`❌ ${check.name}: Missing`);
        }
      }
      console.log(`📊 Utility Score: ${utilityScore}/${utilityChecks.length}`);
      totalScore += utilityScore;
      maxScore += utilityChecks.length;
    } catch (err) {
      console.log('❌ Error reading upload utilities:', err.message);
    }

    // Test 6: i18n Translations
    console.log('\n🌐 Testing i18n Translations...');
    try {
      const i18nContent = fs.readFileSync('src/lib/i18n/de.json', 'utf8');
      
      const translationChecks = [
        { name: 'Bookmark Translations', check: i18nContent.includes('"bookmark"') },
        { name: 'Share Translations', check: i18nContent.includes('"share"') },
        { name: 'Moderation Translations', check: i18nContent.includes('"moderation"') },
        { name: 'Upload Translations', check: i18nContent.includes('"upload"') },
        { name: 'Community Translations', check: i18nContent.includes('"community"') }
      ];

      let translationScore = 0;
      for (const check of translationChecks) {
        if (check.check) {
          console.log(`✅ ${check.name}: Available`);
          translationScore++;
        } else {
          console.log(`❌ ${check.name}: Missing`);
        }
      }
      console.log(`📊 Translation Score: ${translationScore}/${translationChecks.length}`);
      totalScore += translationScore;
      maxScore += translationChecks.length;
    } catch (err) {
      console.log('❌ Error reading i18n file:', err.message);
    }

    // Test 7: Database Functions
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
    totalScore += functionScore;
    maxScore += functions.length;

    // Test 8: Integration Tests
    console.log('\n🔗 Testing Component Integration...');
    
    // Test CommunityPostCard integration
    let integrationScore = 0;
    const integrationTests = [
      {
        name: 'CommunityPostCard FilePreview',
        file: 'src/components/community/CommunityPostCard.tsx',
        check: 'FilePreview'
      },
      {
        name: 'CommunityPostCard BookmarkButton',
        file: 'src/components/community/CommunityPostCard.tsx',
        check: 'BookmarkButton'
      },
      {
        name: 'CommunityPostCard ShareMenu',
        file: 'src/components/community/CommunityPostCard.tsx',
        check: 'ShareMenu'
      },
      {
        name: 'CommunityPostCard PostMoreMenu',
        file: 'src/components/community/CommunityPostCard.tsx',
        check: 'PostMoreMenu'
      },
      {
        name: 'PostCard FilePreview',
        file: 'src/components/community/PostCard.tsx',
        check: 'FilePreview'
      },
      {
        name: 'PostCard BookmarkButton',
        file: 'src/components/community/PostCard.tsx',
        check: 'BookmarkButton'
      },
      {
        name: 'CommunityComposer AttachmentUploader',
        file: 'src/components/community/CommunityComposer.tsx',
        check: 'AttachmentUploader'
      },
      {
        name: 'NewPostComposer CreatePost',
        file: 'src/components/community/NewPostComposer.tsx',
        check: 'CreatePost'
      }
    ];

    for (const test of integrationTests) {
      if (fs.existsSync(test.file)) {
        const content = fs.readFileSync(test.file, 'utf8');
        if (content.includes(test.check)) {
          console.log(`✅ ${test.name}: Integrated`);
          integrationScore++;
        } else {
          console.log(`❌ ${test.name}: Not integrated`);
        }
      } else {
        console.log(`❌ ${test.name}: File not found`);
      }
    }
    console.log(`📊 Integration Score: ${integrationScore}/${integrationTests.length}`);
    totalScore += integrationScore;
    maxScore += integrationTests.length;

    // Overall Results
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    console.log('\n🎯 Overall End-to-End Test Results:');
    console.log(`📊 Total Score: ${totalScore}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🎉 Excellent! All features are working perfectly.');
    } else if (percentage >= 80) {
      console.log('✅ Very good! Most features are working well.');
    } else if (percentage >= 70) {
      console.log('✅ Good! Most features are working, some improvements needed.');
    } else if (percentage >= 60) {
      console.log('⚠️ Fair. Several features need attention.');
    } else {
      console.log('❌ Needs significant work. Many features are not working.');
    }

    // Specific Recommendations
    console.log('\n💡 Recommendations:');
    if (communityTableScore < communityTables.length) {
      console.log('  - Apply community features database migration');
    }
    if (bucketScore < buckets.length) {
      console.log('  - Apply storage buckets migration');
    }
    if (functionScore < functions.length) {
      console.log('  - Apply database functions migration');
    }
    if (integrationScore < integrationTests.length) {
      console.log('  - Check component integration');
    }

    console.log('\n🎉 End-to-End Testing Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testAllFeaturesEndToEnd();
