import fs from 'fs';

function testResponsiveDesign() {
  console.log('📱 Testing Responsive Design and Mobile Compatibility...\n');

  try {
    // Test 1: Check Tailwind Responsive Classes
    console.log('🎨 Testing Tailwind Responsive Classes...');
    
    const responsiveClasses = [
      'sm:', 'md:', 'lg:', 'xl:', '2xl:',
      'max-sm:', 'max-md:', 'max-lg:', 'max-xl:', 'max-2xl:',
      'min-h-screen', 'w-full', 'h-full',
      'flex-col', 'sm:flex-row', 'md:flex-col',
      'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3',
      'text-sm', 'sm:text-base', 'md:text-lg',
      'p-2', 'sm:p-4', 'md:p-6',
      'gap-2', 'sm:gap-4', 'md:gap-6'
    ];

    let responsiveScore = 0;
    const filesToCheck = [
      'src/components/community/CommunityPostCard.tsx',
      'src/components/community/PostCard.tsx',
      'src/components/navigation/TopNavBar.tsx',
      'src/components/navigation/BottomNav.tsx',
      'src/components/AppSidebar.tsx',
      'src/components/community/CommunityComposer.tsx',
      'src/components/upload/FilePreview.tsx',
      'src/components/viewer/LightboxModal.tsx'
    ];

    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        let fileScore = 0;
        
        for (const className of responsiveClasses) {
          if (content.includes(className)) {
            fileScore++;
          }
        }
        
        if (fileScore > 0) {
          console.log(`✅ ${file}: ${fileScore} responsive classes found`);
          responsiveScore += fileScore;
        } else {
          console.log(`❌ ${file}: No responsive classes found`);
        }
      }
    }
    console.log(`📊 Responsive Classes Score: ${responsiveScore}`);

    // Test 2: Check Mobile-First Design Patterns
    console.log('\n📱 Testing Mobile-First Design Patterns...');
    
    const mobilePatterns = [
      'hidden sm:block',
      'block sm:hidden',
      'flex-col sm:flex-row',
      'text-center sm:text-left',
      'p-4 sm:p-6',
      'gap-2 sm:gap-4',
      'w-full sm:w-auto',
      'h-screen sm:h-auto'
    ];

    let mobileScore = 0;
    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        let fileScore = 0;
        
        for (const pattern of mobilePatterns) {
          if (content.includes(pattern)) {
            fileScore++;
          }
        }
        
        if (fileScore > 0) {
          console.log(`✅ ${file}: ${fileScore} mobile patterns found`);
          mobileScore += fileScore;
        }
      }
    }
    console.log(`📊 Mobile Patterns Score: ${mobileScore}`);

    // Test 3: Check Touch-Friendly Elements
    console.log('\n👆 Testing Touch-Friendly Elements...');
    
    const touchElements = [
      'min-h-[44px]', 'min-w-[44px]', // Minimum touch target size
      'touch-manipulation', 'cursor-pointer',
      'active:', 'hover:', 'focus:',
      'rounded-lg', 'rounded-xl', // Rounded corners for touch
      'shadow-sm', 'shadow-md', // Visual feedback
      'transition-colors', 'transition-all'
    ];

    let touchScore = 0;
    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        let fileScore = 0;
        
        for (const element of touchElements) {
          if (content.includes(element)) {
            fileScore++;
          }
        }
        
        if (fileScore > 0) {
          console.log(`✅ ${file}: ${fileScore} touch elements found`);
          touchScore += fileScore;
        }
      }
    }
    console.log(`📊 Touch Elements Score: ${touchScore}`);

    // Test 4: Check Viewport Meta Tag
    console.log('\n🔍 Testing Viewport Configuration...');
    
    const viewportFiles = [
      'index.html',
      'public/index.html'
    ];

    let viewportScore = 0;
    for (const file of viewportFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('viewport') && content.includes('width=device-width')) {
          console.log(`✅ ${file}: Viewport meta tag found`);
          viewportScore++;
        } else {
          console.log(`❌ ${file}: Viewport meta tag missing`);
        }
      }
    }
    console.log(`📊 Viewport Score: ${viewportScore}/${viewportFiles.length}`);

    // Test 5: Check CSS Files for Responsive Styles
    console.log('\n🎨 Testing CSS Responsive Styles...');
    
    const cssFiles = [
      'src/index.css',
      'src/App.css',
      'src/styles/cv-responsive.css'
    ];

    let cssScore = 0;
    for (const file of cssFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const responsiveChecks = [
          content.includes('@media'),
          content.includes('max-width'),
          content.includes('min-width'),
          content.includes('flex-direction'),
          content.includes('grid-template')
        ];
        
        const fileScore = responsiveChecks.filter(Boolean).length;
        if (fileScore > 0) {
          console.log(`✅ ${file}: ${fileScore} responsive CSS rules found`);
          cssScore += fileScore;
        } else {
          console.log(`❌ ${file}: No responsive CSS rules found`);
        }
      }
    }
    console.log(`📊 CSS Responsive Score: ${cssScore}`);

    // Test 6: Check Component Responsive Props
    console.log('\n⚙️ Testing Component Responsive Props...');
    
    const responsiveProps = [
      'className',
      'size',
      'variant',
      'orientation',
      'breakpoint',
      'mobile',
      'desktop'
    ];

    let propsScore = 0;
    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        let fileScore = 0;
        
        for (const prop of responsiveProps) {
          if (content.includes(prop)) {
            fileScore++;
          }
        }
        
        if (fileScore > 0) {
          console.log(`✅ ${file}: ${fileScore} responsive props found`);
          propsScore += fileScore;
        }
      }
    }
    console.log(`📊 Responsive Props Score: ${propsScore}`);

    // Test 7: Check Accessibility for Mobile
    console.log('\n♿ Testing Mobile Accessibility...');
    
    const accessibilityFeatures = [
      'aria-label',
      'aria-describedby',
      'role=',
      'tabIndex',
      'aria-expanded',
      'aria-hidden',
      'aria-live',
      'aria-modal'
    ];

    let a11yScore = 0;
    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        let fileScore = 0;
        
        for (const feature of accessibilityFeatures) {
          if (content.includes(feature)) {
            fileScore++;
          }
        }
        
        if (fileScore > 0) {
          console.log(`✅ ${file}: ${fileScore} accessibility features found`);
          a11yScore += fileScore;
        }
      }
    }
    console.log(`📊 Accessibility Score: ${a11yScore}`);

    // Test 8: Check Mobile-Specific Components
    console.log('\n📱 Testing Mobile-Specific Components...');
    
    const mobileComponents = [
      'BottomNav',
      'MobileMenu',
      'Drawer',
      'Sheet',
      'Dialog',
      'Modal'
    ];

    let mobileComponentScore = 0;
    for (const component of mobileComponents) {
      const componentFiles = [
        `src/components/navigation/BottomNav.tsx`,
        `src/components/ui/sheet.tsx`,
        `src/components/ui/dialog.tsx`,
        `src/components/ui/drawer.tsx`
      ];
      
      for (const file of componentFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes(component)) {
            console.log(`✅ ${component}: Found in ${file}`);
            mobileComponentScore++;
            break;
          }
        }
      }
    }
    console.log(`📊 Mobile Components Score: ${mobileComponentScore}/${mobileComponents.length}`);

    // Overall Score
    const totalScore = responsiveScore + mobileScore + touchScore + viewportScore + cssScore + propsScore + a11yScore + mobileComponentScore;
    const maxScore = 1000; // Estimated maximum possible score
    
    console.log('\n🎯 Overall Responsive Design Test Results:');
    console.log(`📊 Total Score: ${totalScore} (${Math.round((totalScore/maxScore)*100)}%)`);
    
    if (totalScore >= maxScore * 0.8) {
      console.log('🎉 Excellent! Responsive design is well implemented.');
    } else if (totalScore >= maxScore * 0.6) {
      console.log('✅ Good! Responsive design is mostly implemented, some improvements needed.');
    } else {
      console.log('⚠️ Needs improvement. Responsive design needs more work.');
    }

    console.log('\n🎉 Responsive Design Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testResponsiveDesign();
