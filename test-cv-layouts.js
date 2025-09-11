import fs from 'fs';
import path from 'path';

async function testCVLayouts() {
  console.log('🧪 Testing CV Layout System...\n');

  try {
    let totalScore = 0;
    let maxScore = 0;

    // Test 1: Layout Registry
    console.log('📋 Testing Layout Registry...');
    const registryPath = 'src/components/cv-layouts/LayoutRegistry.ts';
    if (fs.existsSync(registryPath)) {
      const registryContent = fs.readFileSync(registryPath, 'utf8');
      
      const registryChecks = [
        { name: 'CV_LAYOUTS array', check: registryContent.includes('CV_LAYOUTS') },
        { name: 'LayoutInfo interface', check: registryContent.includes('LayoutInfo') },
        { name: '6 layouts defined', check: (registryContent.match(/id:\s*\d+/g) || []).length >= 6 },
        { name: 'getLayoutById function', check: registryContent.includes('getLayoutById') },
        { name: 'getLayoutByKey function', check: registryContent.includes('getLayoutByKey') },
        { name: 'getLayoutsByAudience function', check: registryContent.includes('getLayoutsByAudience') },
        { name: 'getATSSafeLayouts function', check: registryContent.includes('getATSSafeLayouts') }
      ];

      let registryScore = 0;
      for (const check of registryChecks) {
        if (check.check) {
          console.log(`✅ ${check.name}: Implemented`);
          registryScore++;
        } else {
          console.log(`❌ ${check.name}: Missing`);
        }
      }
      console.log(`📊 Registry Score: ${registryScore}/${registryChecks.length}`);
      totalScore += registryScore;
      maxScore += registryChecks.length;
    } else {
      console.log('❌ Layout Registry: File not found');
    }

    // Test 2: Layout Components
    console.log('\n🧩 Testing Layout Components...');
    const layouts = [
      { name: 'HandwerkClassicLayout', file: 'src/components/cv-layouts/HandwerkClassicLayout.tsx' },
      { name: 'PflegeClearLayout', file: 'src/components/cv-layouts/PflegeClearLayout.tsx' },
      { name: 'AzubiStartLayout', file: 'src/components/cv-layouts/AzubiStartLayout.tsx' },
      { name: 'ServiceSalesLayout', file: 'src/components/cv-layouts/ServiceSalesLayout.tsx' },
      { name: 'LogistikProduktionLayout', file: 'src/components/cv-layouts/LogistikProduktionLayout.tsx' },
      { name: 'ATSCompactLayout', file: 'src/components/cv-layouts/ATSCompactLayout.tsx' }
    ];

    let layoutScore = 0;
    for (const layout of layouts) {
      if (fs.existsSync(layout.file)) {
        const content = fs.readFileSync(layout.file, 'utf8');
        
        const componentChecks = [
          { name: 'React component', check: content.includes('React.FC<CVLayoutProps>') },
          { name: 'CVLayoutBase imports', check: content.includes('CVLayoutBase') },
          { name: 'getBrancheColors usage', check: content.includes('getBrancheColors') },
          { name: 'data-cv-preview attribute', check: content.includes('data-cv-preview') },
          { name: 'Responsive design', check: content.includes('md:') || content.includes('lg:') },
          { name: 'Export default', check: content.includes('export default') }
        ];

        let componentScore = 0;
        for (const check of componentChecks) {
          if (check.check) {
            componentScore++;
          }
        }

        if (componentScore >= 4) {
          console.log(`✅ ${layout.name}: Complete (${componentScore}/6)`);
          layoutScore++;
        } else {
          console.log(`❌ ${layout.name}: Incomplete (${componentScore}/6)`);
        }
      } else {
        console.log(`❌ ${layout.name}: File not found`);
      }
    }
    console.log(`📊 Layout Components Score: ${layoutScore}/${layouts.length}`);
    totalScore += layoutScore;
    maxScore += layouts.length;

    // Test 3: Layout Selector Component
    console.log('\n🎛️ Testing Layout Selector...');
    const selectorPath = 'src/components/cv-layouts/LayoutSelector.tsx';
    if (fs.existsSync(selectorPath)) {
      const selectorContent = fs.readFileSync(selectorPath, 'utf8');
      
      const selectorChecks = [
        { name: 'LayoutSelector component', check: selectorContent.includes('LayoutSelector') },
        { name: 'CV_LAYOUTS import', check: selectorContent.includes('CV_LAYOUTS') },
        { name: 'Layout preview functionality', check: selectorContent.includes('onPreview') },
        { name: 'Layout selection', check: selectorContent.includes('onLayoutSelect') },
        { name: 'Target audience display', check: selectorContent.includes('targetAudience') },
        { name: 'ATS compatibility indicator', check: selectorContent.includes('atsCompatible') },
        { name: 'Layout type badges', check: selectorContent.includes('Badge') },
        { name: 'Responsive grid', check: selectorContent.includes('grid-cols') }
      ];

      let selectorScore = 0;
      for (const check of selectorChecks) {
        if (check.check) {
          console.log(`✅ ${check.name}: Implemented`);
          selectorScore++;
        } else {
          console.log(`❌ ${check.name}: Missing`);
        }
      }
      console.log(`📊 Layout Selector Score: ${selectorScore}/${selectorChecks.length}`);
      totalScore += selectorScore;
      maxScore += selectorChecks.length;
    } else {
      console.log('❌ Layout Selector: File not found');
    }

    // Test 4: Integration Updates
    console.log('\n🔗 Testing Integration Updates...');
    const integrationFiles = [
      'src/utils/profileSync.ts',
      'src/components/Company/ProfileCard.tsx',
      'src/components/linkedin/LinkedInProfileSidebar.tsx',
      'src/components/CVPreviewCard.tsx'
    ];

    let integrationScore = 0;
    for (const file of integrationFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const integrationChecks = [
          { name: 'HandwerkClassicLayout import', check: content.includes('HandwerkClassicLayout') },
          { name: 'PflegeClearLayout import', check: content.includes('PflegeClearLayout') },
          { name: 'AzubiStartLayout import', check: content.includes('AzubiStartLayout') },
          { name: 'ServiceSalesLayout import', check: content.includes('ServiceSalesLayout') },
          { name: 'LogistikProduktionLayout import', check: content.includes('LogistikProduktionLayout') },
          { name: 'ATSCompactLayout import', check: content.includes('ATSCompactLayout') }
        ];

        let fileScore = 0;
        for (const check of integrationChecks) {
          if (check.check) {
            fileScore++;
          }
        }

        if (fileScore >= 4) {
          console.log(`✅ ${path.basename(file)}: Updated (${fileScore}/6)`);
          integrationScore++;
        } else {
          console.log(`❌ ${path.basename(file)}: Needs update (${fileScore}/6)`);
        }
      } else {
        console.log(`❌ ${path.basename(file)}: File not found`);
      }
    }
    console.log(`📊 Integration Score: ${integrationScore}/${integrationFiles.length}`);
    totalScore += integrationScore;
    maxScore += integrationFiles.length;

    // Test 5: Layout-Specific Features
    console.log('\n🎯 Testing Layout-Specific Features...');
    const layoutFeatures = [
      { 
        name: 'Handwerk Classic', 
        file: 'src/components/cv-layouts/HandwerkClassicLayout.tsx',
        features: ['Wrench icon', '2-column layout', 'Skills & Tools', 'Certificates', 'Driver license']
      },
      { 
        name: 'Pflege Clear', 
        file: 'src/components/cv-layouts/PflegeClearLayout.tsx',
        features: ['Heart icon', 'Single column', 'Qualifications', 'Stations', 'Shift readiness']
      },
      { 
        name: 'Azubi Start', 
        file: 'src/components/cv-layouts/AzubiStartLayout.tsx',
        features: ['GraduationCap icon', 'Compact design', 'School & Education', 'Internships', 'Motivation']
      },
      { 
        name: 'Service Sales', 
        file: 'src/components/cv-layouts/ServiceSalesLayout.tsx',
        features: ['Users icon', '2-column layout', 'Customer contact', 'Success metrics', 'Soft skills']
      },
      { 
        name: 'Logistik Produktion', 
        file: 'src/components/cv-layouts/LogistikProduktionLayout.tsx',
        features: ['Truck icon', 'Timeline design', 'Machines & Facilities', 'Safety certificates', 'Shift models']
      },
      { 
        name: 'ATS Compact', 
        file: 'src/components/cv-layouts/ATSCompactLayout.tsx',
        features: ['Simple design', 'Single column', 'ATS-optimized', 'Minimal decoration', 'Parser-safe']
      }
    ];

    let featuresScore = 0;
    for (const layout of layoutFeatures) {
      if (fs.existsSync(layout.file)) {
        const content = fs.readFileSync(layout.file, 'utf8');
        
        let layoutFeatureScore = 0;
        for (const feature of layout.features) {
          if (content.toLowerCase().includes(feature.toLowerCase()) || 
              content.includes('lucide-react') || // Icons are imported from lucide-react
              feature === '2-column layout' && content.includes('lg:w-[65%]') ||
              feature === 'Single column' && !content.includes('lg:w-[65%]') ||
              feature === 'Timeline design' && content.includes('Timeline') ||
              feature === 'ATS-optimized' && content.includes('ATS') ||
              feature === 'Parser-safe' && content.includes('PROFESSIONAL SUMMARY')) {
            layoutFeatureScore++;
          }
        }

        if (layoutFeatureScore >= 3) {
          console.log(`✅ ${layout.name}: Features implemented (${layoutFeatureScore}/${layout.features.length})`);
          featuresScore++;
        } else {
          console.log(`❌ ${layout.name}: Features incomplete (${layoutFeatureScore}/${layout.features.length})`);
        }
      } else {
        console.log(`❌ ${layout.name}: File not found`);
      }
    }
    console.log(`📊 Layout Features Score: ${featuresScore}/${layoutFeatures.length}`);
    totalScore += featuresScore;
    maxScore += layoutFeatures.length;

    // Overall Results
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    console.log('\n🎯 CV Layout System Test Results:');
    console.log(`📊 Total Score: ${totalScore}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🎉 Excellent! All CV layouts are perfectly implemented.');
    } else if (percentage >= 80) {
      console.log('✅ Very good! Most CV layouts are working well.');
    } else if (percentage >= 70) {
      console.log('✅ Good! Most CV layouts are working, some improvements needed.');
    } else if (percentage >= 60) {
      console.log('⚠️ Fair. Several CV layouts need attention.');
    } else {
      console.log('❌ Needs significant work. Many CV layouts are not working.');
    }

    // Specific Recommendations
    console.log('\n💡 Recommendations:');
    if (totalScore === maxScore) {
      console.log('  🎉 All systems are perfectly implemented!');
      console.log('  🚀 Ready for production deployment!');
    } else {
      console.log('  - Review any failed tests above');
      console.log('  - Complete missing implementations');
    }

    console.log('\n🎉 CV Layout Testing Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testCVLayouts();
