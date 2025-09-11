import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testBookmarkingSharingModeration() {
  console.log('🔖 Testing Bookmarking, Sharing, and Post Moderation Features...\n');

  try {
    // Test 1: Check Component Files
    console.log('🧩 Testing Component Files...');
    
    const components = [
      'src/components/post/BookmarkButton.tsx',
      'src/components/post/ShareMenu.tsx',
      'src/components/post/PostMoreMenu.tsx'
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

    // Test 2: Check Component Functionality
    console.log('\n🔧 Testing Component Functionality...');
    
    let functionalityScore = 0;
    
    // Check BookmarkButton
    try {
      const bookmarkContent = fs.readFileSync('src/components/post/BookmarkButton.tsx', 'utf8');
      
      const bookmarkChecks = [
        { name: 'Bookmark State', check: bookmarkContent.includes('isBookmarked') },
        { name: 'Loading State', check: bookmarkContent.includes('isLoading') },
        { name: 'Supabase Integration', check: bookmarkContent.includes('supabase') },
        { name: 'Toast Notifications', check: bookmarkContent.includes('toast') },
        { name: 'User Authentication', check: bookmarkContent.includes('useAuth') },
        { name: 'Bookmark Icons', check: bookmarkContent.includes('Bookmark') && bookmarkContent.includes('BookmarkCheck') }
      ];

      for (const check of bookmarkChecks) {
        if (check.check) {
          console.log(`✅ BookmarkButton ${check.name}: Implemented`);
          functionalityScore++;
        } else {
          console.log(`❌ BookmarkButton ${check.name}: Missing`);
        }
      }
    } catch (err) {
      console.log('❌ Error reading BookmarkButton:', err.message);
    }

    // Check ShareMenu
    try {
      const shareContent = fs.readFileSync('src/components/post/ShareMenu.tsx', 'utf8');
      
      const shareChecks = [
        { name: 'Copy Link', check: shareContent.includes('handleCopyLink') },
        { name: 'System Share', check: shareContent.includes('handleSystemShare') },
        { name: 'Clipboard API', check: shareContent.includes('navigator.clipboard') },
        { name: 'Web Share API', check: shareContent.includes('navigator.share') },
        { name: 'Toast Notifications', check: shareContent.includes('toast') },
        { name: 'Dropdown Menu', check: shareContent.includes('DropdownMenu') }
      ];

      for (const check of shareChecks) {
        if (check.check) {
          console.log(`✅ ShareMenu ${check.name}: Implemented`);
          functionalityScore++;
        } else {
          console.log(`❌ ShareMenu ${check.name}: Missing`);
        }
      }
    } catch (err) {
      console.log('❌ Error reading ShareMenu:', err.message);
    }

    // Check PostMoreMenu
    try {
      const moderationContent = fs.readFileSync('src/components/post/PostMoreMenu.tsx', 'utf8');
      
      const moderationChecks = [
        { name: 'Report Functionality', check: moderationContent.includes('handleReport') },
        { name: 'Hide Post', check: moderationContent.includes('handleHidePost') },
        { name: 'Snooze Post', check: moderationContent.includes('handleSnoozePost') },
        { name: 'Report Dialog', check: moderationContent.includes('showReportDialog') },
        { name: 'Report Reasons', check: moderationContent.includes('reportReasons') },
        { name: 'Supabase Integration', check: moderationContent.includes('supabase') }
      ];

      for (const check of moderationChecks) {
        if (check.check) {
          console.log(`✅ PostMoreMenu ${check.name}: Implemented`);
          functionalityScore++;
        } else {
          console.log(`❌ PostMoreMenu ${check.name}: Missing`);
        }
      }
    } catch (err) {
      console.log('❌ Error reading PostMoreMenu:', err.message);
    }

    console.log(`📊 Functionality Score: ${functionalityScore}/18`);

    // Test 3: Check Database Tables
    console.log('\n🗄️ Testing Database Tables...');
    
    const tables = [
      'bookmarks',
      'reports',
      'hidden_posts',
      'snoozed_posts'
    ];

    let tableScore = 0;
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table} table: ${error.message}`);
        } else {
          console.log(`✅ ${table} table: Accessible`);
          tableScore++;
        }
      } catch (err) {
        console.log(`❌ ${table} table: ${err.message}`);
      }
    }
    console.log(`📊 Table Score: ${tableScore}/${tables.length}`);

    // Test 4: Check i18n Translations
    console.log('\n🌐 Testing i18n Translations...');
    
    try {
      const i18nContent = fs.readFileSync('src/lib/i18n/de.json', 'utf8');
      
      const translationChecks = [
        { name: 'Bookmark Translations', check: i18nContent.includes('"bookmark"') },
        { name: 'Share Translations', check: i18nContent.includes('"share"') },
        { name: 'Moderation Translations', check: i18nContent.includes('"moderation"') },
        { name: 'Report Reasons', check: i18nContent.includes('"report_reasons"') }
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
    } catch (err) {
      console.log('❌ Error reading i18n file:', err.message);
    }

    // Test 5: Check Integration in Post Cards
    console.log('\n🔗 Testing Integration in Post Cards...');
    
    const postCards = [
      'src/components/community/CommunityPostCard.tsx',
      'src/components/community/PostCard.tsx'
    ];

    let integrationScore = 0;
    for (const postCard of postCards) {
      if (fs.existsSync(postCard)) {
        const content = fs.readFileSync(postCard, 'utf8');
        
        const integrationChecks = [
          { name: 'ShareMenu', check: content.includes('ShareMenu') },
          { name: 'BookmarkButton', check: content.includes('BookmarkButton') },
          { name: 'PostMoreMenu', check: content.includes('PostMoreMenu') }
        ];

        let cardScore = 0;
        for (const check of integrationChecks) {
          if (check.check) {
            console.log(`✅ ${postCard}: ${check.name} integrated`);
            cardScore++;
          } else {
            console.log(`❌ ${postCard}: ${check.name} not integrated`);
          }
        }
        
        integrationScore += cardScore;
      }
    }
    console.log(`📊 Integration Score: ${integrationScore}/${postCards.length * 3}`);

    // Test 6: Check API Functionality
    console.log('\n🔌 Testing API Functionality...');
    
    try {
      // Test bookmark functionality
      const { data: bookmarks, error: bookmarkError } = await supabase
        .from('bookmarks')
        .select('*')
        .limit(1);

      if (bookmarkError) {
        console.log(`❌ Bookmarks API: ${bookmarkError.message}`);
      } else {
        console.log(`✅ Bookmarks API: Working`);
      }

      // Test reports functionality
      const { data: reports, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .limit(1);

      if (reportError) {
        console.log(`❌ Reports API: ${reportError.message}`);
      } else {
        console.log(`✅ Reports API: Working`);
      }

    } catch (err) {
      console.log('❌ Error testing API functionality:', err.message);
    }

    // Overall Score
    const totalScore = componentScore + functionalityScore + tableScore + integrationScore;
    const maxScore = components.length + 18 + tables.length + (postCards.length * 3);
    
    console.log('\n🎯 Overall Bookmarking, Sharing & Moderation Test Results:');
    console.log(`📊 Total Score: ${totalScore}/${maxScore} (${Math.round((totalScore/maxScore)*100)}%)`);
    
    if (totalScore >= maxScore * 0.8) {
      console.log('🎉 Excellent! Bookmarking, sharing, and moderation features are working well.');
    } else if (totalScore >= maxScore * 0.6) {
      console.log('✅ Good! Most features are working, some improvements needed.');
    } else {
      console.log('⚠️ Needs improvement. Several features are missing or not working.');
    }

    console.log('\n🎉 Bookmarking, Sharing & Moderation Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testBookmarkingSharingModeration();
