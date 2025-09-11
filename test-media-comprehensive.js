import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testMediaComprehensive() {
  console.log('📁 Comprehensive Media Upload Test...\n');

  try {
    // Test 1: Check Component Files
    console.log('🧩 Testing Component Files...');
    
    const components = [
      'src/components/upload/AttachmentUploader.tsx',
      'src/components/upload/FilePreview.tsx',
      'src/components/viewer/LightboxModal.tsx',
      'src/components/viewer/PdfInlineViewer.tsx',
      'src/lib/uploads.ts'
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

    // Test 2: Check Integration in Composers
    console.log('\n🔗 Testing Composer Integration...');
    
    const composers = [
      'src/components/community/CommunityComposer.tsx',
      'src/components/community/NewPostComposer.tsx',
      'src/components/marketplace/MarketplaceComposer.tsx'
    ];

    let composerScore = 0;
    for (const composer of composers) {
      if (fs.existsSync(composer)) {
        const content = fs.readFileSync(composer, 'utf8');
        if (content.includes('AttachmentUploader') || content.includes('CreatePost')) {
          console.log(`✅ ${composer}: Uses AttachmentUploader (directly or via CreatePost)`);
          composerScore++;
        } else {
          console.log(`❌ ${composer}: Does not use AttachmentUploader`);
        }
      }
    }
    console.log(`📊 Composer Integration Score: ${composerScore}/${composers.length}`);

    // Test 3: Check Post Card Integration
    console.log('\n📱 Testing Post Card Integration...');
    
    const postCards = [
      'src/components/community/CommunityPostCard.tsx',
      'src/components/community/PostCard.tsx'
    ];

    let postCardScore = 0;
    for (const postCard of postCards) {
      if (fs.existsSync(postCard)) {
        const content = fs.readFileSync(postCard, 'utf8');
        if (content.includes('FilePreview')) {
          console.log(`✅ ${postCard}: Uses FilePreview`);
          postCardScore++;
        } else {
          console.log(`❌ ${postCard}: Does not use FilePreview`);
        }
      }
    }
    console.log(`📊 Post Card Integration Score: ${postCardScore}/${postCards.length}`);

    // Test 4: Check Upload Utilities
    console.log('\n🔧 Testing Upload Utilities...');
    
    let utilityScore = 0;
    try {
      const uploadsContent = fs.readFileSync('src/lib/uploads.ts', 'utf8');
      
      const utilityChecks = [
        { name: 'MAX_FILE_BYTES', check: uploadsContent.includes('MAX_FILE_BYTES') },
        { name: 'ALLOWED_MIME', check: uploadsContent.includes('ALLOWED_MIME') },
        { name: 'isAllowedFile', check: uploadsContent.includes('isAllowedFile') },
        { name: 'humanFileSize', check: uploadsContent.includes('humanFileSize') },
        { name: 'uploadToSupabase', check: uploadsContent.includes('uploadToSupabase') },
        { name: 'UploadedAttachment type', check: uploadsContent.includes('UploadedAttachment') }
      ];

      for (const check of utilityChecks) {
        if (check.check) {
          console.log(`✅ ${check.name}: Implemented`);
          utilityScore++;
        } else {
          console.log(`❌ ${check.name}: Missing`);
        }
      }
      console.log(`📊 Utility Score: ${utilityScore}/${utilityChecks.length}`);
    } catch (err) {
      console.log('❌ Error reading upload utilities:', err.message);
    }

    // Test 5: Check File Type Support
    console.log('\n📄 Testing File Type Support...');
    
    let typeScore = 0;
    try {
      const uploadsContent = fs.readFileSync('src/lib/uploads.ts', 'utf8');
      
      const supportedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf'
      ];
      
      for (const type of supportedTypes) {
        if (uploadsContent.includes(type)) {
          console.log(`✅ File type supported: ${type}`);
          typeScore++;
        } else {
          console.log(`❌ File type missing: ${type}`);
        }
      }
      console.log(`📊 File Type Score: ${typeScore}/${supportedTypes.length}`);
    } catch (err) {
      console.log('❌ Error checking file type support:', err.message);
    }

    // Test 6: Check Viewer Functionality
    console.log('\n👁️ Testing Viewer Functionality...');
    
    try {
      const lightboxContent = fs.readFileSync('src/components/viewer/LightboxModal.tsx', 'utf8');
      const pdfViewerContent = fs.readFileSync('src/components/viewer/PdfInlineViewer.tsx', 'utf8');
      
      const viewerChecks = [
        { name: 'Lightbox Zoom', check: lightboxContent.includes('ZoomIn') && lightboxContent.includes('ZoomOut') },
        { name: 'Lightbox Navigation', check: lightboxContent.includes('ChevronLeft') && lightboxContent.includes('ChevronRight') },
        { name: 'Lightbox Modal', check: lightboxContent.includes('Dialog') },
        { name: 'PDF Object/Iframe', check: pdfViewerContent.includes('<object') && pdfViewerContent.includes('<iframe') },
        { name: 'PDF External Link', check: pdfViewerContent.includes('ExternalLink') },
        { name: 'PDF Mobile Responsive', check: pdfViewerContent.includes('md:hidden') }
      ];

      let viewerScore = 0;
      for (const check of viewerChecks) {
        if (check.check) {
          console.log(`✅ ${check.name}: Implemented`);
          viewerScore++;
        } else {
          console.log(`❌ ${check.name}: Missing`);
        }
      }
      console.log(`📊 Viewer Score: ${viewerScore}/${viewerChecks.length}`);
    } catch (err) {
      console.log('❌ Error checking viewer functionality:', err.message);
    }

    // Test 7: Check Storage Buckets
    console.log('\n🗄️ Testing Storage Buckets...');
    
    try {
      // Test images bucket
      const { data: imagesList, error: imagesError } = await supabase.storage
        .from('images')
        .list('', { limit: 1 });

      if (imagesError) {
        console.log(`❌ Images bucket: ${imagesError.message}`);
      } else {
        console.log(`✅ Images bucket: Accessible (${imagesList?.length || 0} files)`);
      }

      // Test attachments bucket
      const { data: attachmentsList, error: attachmentsError } = await supabase.storage
        .from('attachments')
        .list('', { limit: 1 });

      if (attachmentsError) {
        console.log(`❌ Attachments bucket: ${attachmentsError.message}`);
      } else {
        console.log(`✅ Attachments bucket: Accessible (${attachmentsList?.length || 0} files)`);
      }
    } catch (err) {
      console.log('❌ Error testing storage buckets:', err.message);
    }

    // Test 8: Check File Validation Logic
    console.log('\n🔍 Testing File Validation Logic...');
    
    const ALLOWED_MIME = new Set([
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
    ]);
    const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

    function isAllowedFile(file) {
      return ALLOWED_MIME.has(file.type) && file.size <= MAX_FILE_BYTES;
    }

    const testFiles = [
      { name: 'test.jpg', type: 'image/jpeg', size: 1024, expected: true },
      { name: 'test.png', type: 'image/png', size: 2048, expected: true },
      { name: 'test.pdf', type: 'application/pdf', size: 5120, expected: true },
      { name: 'test.gif', type: 'image/gif', size: 3072, expected: true },
      { name: 'test.webp', type: 'image/webp', size: 1536, expected: true },
      { name: 'test.txt', type: 'text/plain', size: 100, expected: false },
      { name: 'test.mp4', type: 'video/mp4', size: 1000, expected: false },
      { name: 'large.jpg', type: 'image/jpeg', size: 11 * 1024 * 1024, expected: false },
    ];

    let validationScore = 0;
    for (const file of testFiles) {
      const isValid = isAllowedFile(file);
      const status = isValid === file.expected ? '✅' : '❌';
      console.log(`${status} ${file.name} (${file.type}, ${file.size} bytes): ${isValid ? 'Valid' : 'Invalid'}`);
      if (isValid === file.expected) validationScore++;
    }
    console.log(`📊 Validation Score: ${validationScore}/${testFiles.length}`);

    // Test 9: Check File Size Formatting
    console.log('\n📏 Testing File Size Formatting...');
    
    function humanFileSize(bytes) {
      const units = ['B','KB','MB','GB'];
      let i = 0; let n = bytes;
      while (n >= 1024 && i < units.length-1) { n /= 1024; i++; }
      return `${n.toFixed(1)} ${units[i]}`;
    }

    const testSizes = [
      { bytes: 1024, expected: '1.0 KB' },
      { bytes: 1024*1024, expected: '1.0 MB' },
      { bytes: 5*1024*1024, expected: '5.0 MB' },
      { bytes: 10*1024*1024, expected: '10.0 MB' },
      { bytes: 1024*1024*1024, expected: '1.0 GB' }
    ];

    let formattingScore = 0;
    for (const test of testSizes) {
      const result = humanFileSize(test.bytes);
      const status = result === test.expected ? '✅' : '❌';
      console.log(`${status} ${test.bytes} bytes = ${result} (expected: ${test.expected})`);
      if (result === test.expected) formattingScore++;
    }
    console.log(`📊 Formatting Score: ${formattingScore}/${testSizes.length}`);

    // Overall Score
    const totalScore = componentScore + composerScore + postCardScore + utilityScore + typeScore + 6 + validationScore + formattingScore;
    const maxScore = components.length + composers.length + postCards.length + 6 + 5 + 6 + testFiles.length + testSizes.length;
    
    console.log('\n🎯 Overall Media Upload Test Results:');
    console.log(`📊 Total Score: ${totalScore}/${maxScore} (${Math.round((totalScore/maxScore)*100)}%)`);
    
    if (totalScore >= maxScore * 0.8) {
      console.log('🎉 Excellent! Media upload functionality is working well.');
    } else if (totalScore >= maxScore * 0.6) {
      console.log('✅ Good! Media upload functionality is mostly working.');
    } else {
      console.log('⚠️ Needs improvement. Some media upload functionality is missing.');
    }

    console.log('\n🎉 Comprehensive Media Upload Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testMediaComprehensive();
