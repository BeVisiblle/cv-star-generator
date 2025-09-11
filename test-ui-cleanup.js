import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUICleanup() {
  console.log('🧹 Testing UI Cleanup - Single Composer & No Duplicate Branding...\n');

  try {
    // Test 1: Check ComposerProvider Integration
    console.log('🎭 Testing ComposerProvider Integration...');
    
    try {
      const appContent = fs.readFileSync('src/App.tsx', 'utf8');
      
      if (appContent.includes('FeedComposerProvider')) {
        console.log('✅ FeedComposerProvider: Integrated in App.tsx');
      } else {
        console.log('❌ FeedComposerProvider: Not integrated in App.tsx');
      }
      
      if (appContent.includes('import { FeedComposerProvider }')) {
        console.log('✅ FeedComposerProvider: Imported correctly');
      } else {
        console.log('❌ FeedComposerProvider: Import missing');
      }
    } catch (err) {
      console.log('❌ Error reading App.tsx:', err.message);
    }

    // Test 2: Check ComposerProvider Implementation
    console.log('\n🔧 Testing ComposerProvider Implementation...');
    
    try {
      const providerContent = fs.readFileSync('src/components/feed/ComposerProvider.tsx', 'utf8');
      
      if (providerContent.includes('mountedRef.current.size >= 1')) {
        console.log('✅ Single Composer Logic: Implemented (max 1 composer)');
      } else {
        console.log('❌ Single Composer Logic: Not implemented');
      }
      
      if (providerContent.includes('useComposerGuard')) {
        console.log('✅ Composer Guard Hook: Available');
      } else {
        console.log('❌ Composer Guard Hook: Missing');
      }
    } catch (err) {
      console.log('❌ Error reading ComposerProvider:', err.message);
    }

    // Test 3: Check Branding Configuration
    console.log('\n🏷️ Testing Branding Configuration...');
    
    try {
      const layoutConfig = fs.readFileSync('src/lib/layoutConfig.ts', 'utf8');
      
      if (layoutConfig.includes("brandPlacement: 'navbar'")) {
        console.log('✅ Brand Placement: Configured for navbar only');
      } else {
        console.log('❌ Brand Placement: Not configured correctly');
      }
    } catch (err) {
      console.log('❌ Error reading layoutConfig:', err.message);
    }

    // Test 4: Check TopNavBar Branding
    console.log('\n📱 Testing TopNavBar Branding...');
    
    try {
      const topNavContent = fs.readFileSync('src/components/navigation/TopNavBar.tsx', 'utf8');
      
      if (topNavContent.includes('BrandMark') || topNavContent.includes('BrandWordmark')) {
        console.log('✅ TopNavBar: Contains branding components');
      } else {
        console.log('❌ TopNavBar: Missing branding components');
      }
      
      if (topNavContent.includes('BrandMark') && topNavContent.includes('BrandWordmark')) {
        console.log('✅ TopNavBar: Uses proper branding components (BrandMark + BrandWordmark)');
      } else {
        console.log('❌ TopNavBar: Not using proper branding components');
      }
    } catch (err) {
      console.log('❌ Error reading TopNavBar:', err.message);
    }

    // Test 5: Check Sidebar Branding (should be none)
    console.log('\n📋 Testing Sidebar Branding (should be none)...');
    
    try {
      const appSidebarContent = fs.readFileSync('src/components/AppSidebar.tsx', 'utf8');
      
      if (appSidebarContent.includes('No logo/brand in sidebar')) {
        console.log('✅ AppSidebar: Correctly configured with no branding');
      } else {
        console.log('❌ AppSidebar: May have branding issues');
      }
      
      if (!appSidebarContent.includes('BrandMark') && !appSidebarContent.includes('BrandWordmark')) {
        console.log('✅ AppSidebar: No branding components found');
      } else {
        console.log('❌ AppSidebar: Contains branding components (should be none)');
      }
    } catch (err) {
      console.log('❌ Error reading AppSidebar:', err.message);
    }

    // Test 6: Check Company Sidebar (should only have company logos, not main branding)
    console.log('\n🏢 Testing Company Sidebar Branding...');
    
    try {
      const companySidebarContent = fs.readFileSync('src/components/Company/CompanySidebar.tsx', 'utf8');
      
      if (companySidebarContent.includes('company?.logo_url')) {
        console.log('✅ CompanySidebar: Shows company logos (correct)');
      } else {
        console.log('❌ CompanySidebar: Missing company logos');
      }
      
      if (!companySidebarContent.includes('BrandMark') && !companySidebarContent.includes('BrandWordmark')) {
        console.log('✅ CompanySidebar: No main branding components (correct)');
      } else {
        console.log('❌ CompanySidebar: Contains main branding (should only have company logos)');
      }
    } catch (err) {
      console.log('❌ Error reading CompanySidebar:', err.message);
    }

    // Test 7: Check for Duplicate Composer Usage
    console.log('\n🎭 Testing for Duplicate Composer Usage...');
    
    try {
      const composerFiles = [
        'src/components/community/CommunityComposer.tsx',
        'src/components/dashboard/ComposerTeaser.tsx',
        'src/components/community/NewPostComposer.tsx',
        'src/components/community/CommunityComposerTeaser.tsx',
        'src/components/marketplace/MarketplaceComposer.tsx',
        'src/components/dashboard/CompanyComposerTeaser.tsx',
        'src/components/community/CompanyNewPostComposer.tsx'
      ];
      
      let composerCount = 0;
      for (const file of composerFiles) {
        if (fs.existsSync(file)) {
          composerCount++;
          console.log(`✅ Composer file exists: ${file}`);
        }
      }
      
      console.log(`📊 Total composer files found: ${composerCount}`);
      
      // Check if main composers use the guard
      const communityComposerContent = fs.readFileSync('src/components/community/CommunityComposer.tsx', 'utf8');
      if (communityComposerContent.includes('useComposerGuard')) {
        console.log('✅ CommunityComposer: Uses composer guard');
      } else {
        console.log('❌ CommunityComposer: Does not use composer guard');
      }
    } catch (err) {
      console.log('❌ Error checking composer files:', err.message);
    }

    // Test 8: Check Layout Consistency
    console.log('\n🎨 Testing Layout Consistency...');
    
    try {
      const dashboardContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
      
      if (dashboardContent.includes('RightRail')) {
        console.log('✅ Dashboard: Includes RightRail component');
      } else {
        console.log('❌ Dashboard: Missing RightRail component');
      }
      
      if (dashboardContent.includes('CommunityComposerTeaser')) {
        console.log('✅ Dashboard: Includes composer teaser');
      } else {
        console.log('❌ Dashboard: Missing composer teaser');
      }
    } catch (err) {
      console.log('❌ Error reading Dashboard:', err.message);
    }

    console.log('\n🎉 UI Cleanup Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testUICleanup();
