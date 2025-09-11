import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUploadFunctionality() {
  console.log('📤 Testing Upload Functionality...\n');

  try {
    // Test 1: Test file upload to Supabase Storage
    console.log('🗄️ Testing Supabase Storage Upload...');
    
    // Create a small test file
    const testContent = 'This is a test file for upload functionality';
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    
    console.log(`✅ Test file created: ${testFile.name} (${testFile.size} bytes, ${testFile.type})`);
    
    // Test upload to attachments bucket
    try {
      const fileName = `test-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`;
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(fileName, testFile, { upsert: false });
      
      if (error) {
        console.log(`❌ Upload failed: ${error.message}`);
      } else {
        console.log(`✅ Upload successful: ${data.path}`);
        
        // Test getting public URL
        const { data: publicUrl } = supabase.storage
          .from('attachments')
          .getPublicUrl(data.path);
        
        console.log(`✅ Public URL generated: ${publicUrl.publicUrl}`);
        
        // Clean up - delete the test file
        const { error: deleteError } = await supabase.storage
          .from('attachments')
          .remove([data.path]);
        
        if (deleteError) {
          console.log(`⚠️ Cleanup failed: ${deleteError.message}`);
        } else {
          console.log(`✅ Test file cleaned up successfully`);
        }
      }
    } catch (err) {
      console.log(`❌ Upload error: ${err.message}`);
    }

    // Test 2: Test image upload (simulated)
    console.log('\n🖼️ Testing Image Upload Simulation...');
    
    try {
      // Create a small test image (1x1 pixel PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 1, 1);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const testImage = new File([blob], 'test-image.png', { type: 'image/png' });
          console.log(`✅ Test image created: ${testImage.name} (${testImage.size} bytes, ${testImage.type})`);
          
          // Test upload to images bucket
          const fileName = `test-image-${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
          const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, testImage, { upsert: false });
          
          if (error) {
            console.log(`❌ Image upload failed: ${error.message}`);
          } else {
            console.log(`✅ Image upload successful: ${data.path}`);
            
            // Test getting public URL
            const { data: publicUrl } = supabase.storage
              .from('images')
              .getPublicUrl(data.path);
            
            console.log(`✅ Image public URL generated: ${publicUrl.publicUrl}`);
            
            // Clean up
            const { error: deleteError } = await supabase.storage
              .from('images')
              .remove([data.path]);
            
            if (deleteError) {
              console.log(`⚠️ Image cleanup failed: ${deleteError.message}`);
            } else {
              console.log(`✅ Test image cleaned up successfully`);
            }
          }
        }
      }, 'image/png');
    } catch (err) {
      console.log(`❌ Image upload error: ${err.message}`);
    }

    // Test 3: Test file validation
    console.log('\n🔍 Testing File Validation...');
    
    const testFiles = [
      { name: 'test.jpg', type: 'image/jpeg', size: 1024 },
      { name: 'test.png', type: 'image/png', size: 2048 },
      { name: 'test.pdf', type: 'application/pdf', size: 5120 },
      { name: 'test.gif', type: 'image/gif', size: 3072 },
      { name: 'test.webp', type: 'image/webp', size: 1536 },
      { name: 'test.txt', type: 'text/plain', size: 100 }, // Should fail
      { name: 'test.mp4', type: 'video/mp4', size: 1000 }, // Should fail
      { name: 'large.jpg', type: 'image/jpeg', size: 11 * 1024 * 1024 }, // Should fail (too large)
    ];

    const ALLOWED_MIME = new Set([
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
    ]);
    const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

    function isAllowedFile(file) {
      return ALLOWED_MIME.has(file.type) && file.size <= MAX_FILE_BYTES;
    }

    for (const file of testFiles) {
      const isValid = isAllowedFile(file);
      const status = isValid ? '✅' : '❌';
      console.log(`${status} ${file.name} (${file.type}, ${file.size} bytes): ${isValid ? 'Valid' : 'Invalid'}`);
    }

    // Test 4: Test file size formatting
    console.log('\n📏 Testing File Size Formatting...');
    
    function humanFileSize(bytes) {
      const units = ['B','KB','MB','GB'];
      let i = 0; let n = bytes;
      while (n >= 1024 && i < units.length-1) { n /= 1024; i++; }
      return `${n.toFixed(1)} ${units[i]}`;
    }

    const testSizes = [1024, 1024*1024, 5*1024*1024, 10*1024*1024, 1024*1024*1024];
    for (const size of testSizes) {
      console.log(`✅ ${size} bytes = ${humanFileSize(size)}`);
    }

    console.log('\n🎉 Upload Functionality Test Completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testUploadFunctionality();
