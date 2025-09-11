import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testMediaUploads() {
  console.log('📁 Testing Media & File Uploads, Attachments, Previews...\n');

  try {
    // Test 1: Check Upload Components
    console.log('🧩 Testing Upload Components...');
    
    const uploadComponents = [
      'src/components/upload/AttachmentUploader.tsx',
      'src/components/upload/FilePreview.tsx',
      'src/components/ui/file-upload.tsx'
    ];

    for (const component of uploadComponents) {
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

    // Test 2: Check Viewer Components
    console.log('\n👁️ Testing Viewer Components...');
    
    const viewerComponents = [
      'src/components/viewer/LightboxModal.tsx',
      'src/components/viewer/PdfInlineViewer.tsx'
    ];

    for (const component of viewerComponents) {
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

    // Test 3: Check Upload Utilities
    console.log('\n🔧 Testing Upload Utilities...');
    
    try {
      const uploadsContent = fs.readFileSync('src/lib/uploads.ts', 'utf8');
      
      if (uploadsContent.includes('MAX_FILE_BYTES')) {
        console.log('✅ Upload utilities: File size limits defined');
      } else {
        console.log('❌ Upload utilities: Missing file size limits');
      }
      
      if (uploadsContent.includes('ALLOWED_MIME')) {
        console.log('✅ Upload utilities: MIME type validation defined');
      } else {
        console.log('❌ Upload utilities: Missing MIME type validation');
      }
      
      if (uploadsContent.includes('uploadToSupabase')) {
        console.log('✅ Upload utilities: Supabase upload function defined');
      } else {
        console.log('❌ Upload utilities: Missing Supabase upload function');
      }
      
      if (uploadsContent.includes('humanFileSize')) {
        console.log('✅ Upload utilities: File size formatting function defined');
      } else {
        console.log('❌ Upload utilities: Missing file size formatting');
      }
    } catch (err) {
      console.log('❌ Error reading upload utilities:', err.message);
    }

    // Test 4: Check Supabase Storage Buckets
    console.log('\n🗄️ Testing Supabase Storage Buckets...');
    
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

    // Test 5: Check File Type Support
    console.log('\n📄 Testing File Type Support...');
    
    try {
      const uploadsContent = fs.readFileSync('src/lib/uploads.ts', 'utf8');
      
      const supportedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf'
      ];
      
      for (const type of supportedTypes) {
        if (uploadsContent.includes(type)) {
          console.log(`✅ File type supported: ${type}`);
        } else {
          console.log(`❌ File type missing: ${type}`);
        }
      }
      
      // Check file size limit
      if (uploadsContent.includes('10 * 1024 * 1024')) {
        console.log('✅ File size limit: 10MB');
      } else {
        console.log('❌ File size limit: Not set to 10MB');
      }
    } catch (err) {
      console.log('❌ Error checking file type support:', err.message);
    }

    // Test 6: Check Component Integration
    console.log('\n🔗 Testing Component Integration...');
    
    try {
      // Check if AttachmentUploader is used in composers
      const composerFiles = [
        'src/components/community/CommunityComposer.tsx',
        'src/components/community/NewPostComposer.tsx',
        'src/components/marketplace/MarketplaceComposer.tsx'
      ];
      
      for (const file of composerFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('AttachmentUploader')) {
            console.log(`✅ ${file}: Uses AttachmentUploader`);
          } else {
            console.log(`❌ ${file}: Does not use AttachmentUploader`);
          }
        }
      }
      
      // Check if FilePreview is used
      const feedFiles = [
        'src/components/community/CommunityPostCard.tsx',
        'src/components/community/PostCard.tsx'
      ];
      
      for (const file of feedFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('FilePreview')) {
            console.log(`✅ ${file}: Uses FilePreview`);
          } else {
            console.log(`❌ ${file}: Does not use FilePreview`);
          }
        }
      }
    } catch (err) {
      console.log('❌ Error checking component integration:', err.message);
    }

    // Test 7: Check Lightbox Functionality
    console.log('\n🖼️ Testing Lightbox Functionality...');
    
    try {
      const lightboxContent = fs.readFileSync('src/components/viewer/LightboxModal.tsx', 'utf8');
      
      if (lightboxContent.includes('ZoomIn') && lightboxContent.includes('ZoomOut')) {
        console.log('✅ Lightbox: Zoom functionality implemented');
      } else {
        console.log('❌ Lightbox: Missing zoom functionality');
      }
      
      if (lightboxContent.includes('ChevronLeft') && lightboxContent.includes('ChevronRight')) {
        console.log('✅ Lightbox: Navigation functionality implemented');
      } else {
        console.log('❌ Lightbox: Missing navigation functionality');
      }
      
      if (lightboxContent.includes('Dialog')) {
        console.log('✅ Lightbox: Modal dialog implemented');
      } else {
        console.log('❌ Lightbox: Missing modal dialog');
      }
    } catch (err) {
      console.log('❌ Error checking lightbox functionality:', err.message);
    }

    // Test 8: Check PDF Viewer Functionality
    console.log('\n📄 Testing PDF Viewer Functionality...');
    
    try {
      const pdfViewerContent = fs.readFileSync('src/components/viewer/PdfInlineViewer.tsx', 'utf8');
      
      if (pdfViewerContent.includes('<object') && pdfViewerContent.includes('<iframe')) {
        console.log('✅ PDF Viewer: Object and iframe fallback implemented');
      } else {
        console.log('❌ PDF Viewer: Missing object/iframe implementation');
      }
      
      if (pdfViewerContent.includes('ExternalLink')) {
        console.log('✅ PDF Viewer: External link functionality implemented');
      } else {
        console.log('❌ PDF Viewer: Missing external link functionality');
      }
      
      if (pdfViewerContent.includes('md:hidden')) {
        console.log('✅ PDF Viewer: Mobile responsive design implemented');
      } else {
        console.log('❌ PDF Viewer: Missing mobile responsive design');
      }
    } catch (err) {
      console.log('❌ Error checking PDF viewer functionality:', err.message);
    }

    // Test 9: Test Upload Function with Mock Data
    console.log('\n🧪 Testing Upload Function with Mock Data...');
    
    try {
      // Create a small test file
      const testContent = 'This is a test file for upload functionality';
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      
      console.log(`✅ Test file created: ${testFile.name} (${testFile.size} bytes, ${testFile.type})`);
      
      // Test file validation
      const { isAllowedFile, MAX_FILE_BYTES, ALLOWED_MIME } = await import('./src/lib/uploads.ts');
      
      if (testFile.size <= MAX_FILE_BYTES) {
        console.log(`✅ File size validation: ${testFile.size} bytes <= ${MAX_FILE_BYTES} bytes`);
      } else {
        console.log(`❌ File size validation: ${testFile.size} bytes > ${MAX_FILE_BYTES} bytes`);
      }
      
      if (ALLOWED_MIME.has(testFile.type)) {
        console.log(`✅ MIME type validation: ${testFile.type} is allowed`);
      } else {
        console.log(`❌ MIME type validation: ${testFile.type} is not allowed`);
      }
      
      const isValid = isAllowedFile(testFile);
      console.log(`📊 File validation result: ${isValid ? 'Valid' : 'Invalid'}`);
      
    } catch (err) {
      console.log('❌ Error testing upload function:', err.message);
    }

    console.log('\n🎉 Media Upload Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testMediaUploads();
