#!/usr/bin/env node

// Script to create test posts for community feed
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testPosts = [
  {
    body_md: "Heute habe ich mich für drei neue Ausbildungsstellen beworben – drückt mir die Daumen! 🎯",
    media: [{
      type: "image",
      url: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?q=80&w=1200&auto=format&fit=crop",
      alt: "Bewerbungsunterlagen"
    }]
  },
  {
    body_md: "Tipps für ein gelungenes Anschreiben: kurz, prägnant und persönlich. Wer hat noch weitere Tipps?",
    media: []
  },
  {
    body_md: "Mein Wochenziel: Lebenslauf überarbeiten und ein neues Projekt starten. Motivation ist da! 💪",
    media: [{
      type: "image", 
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
      alt: "Arbeitsplatz"
    }]
  },
  {
    body_md: "Wer hat Erfahrungen mit Praktika in Frankfurt? Empfehlungen willkommen! 🤝",
    media: []
  },
  {
    body_md: "Kleiner Erfolg: Mein erstes Vorstellungsgespräch steht – ich bin gespannt! 😊",
    media: [{
      type: "image",
      url: "https://images.unsplash.com/photo-1520975867597-0f0a113a2d97?q=80&w=1200&auto=format&fit=crop", 
      alt: "Vorstellungsgespräch"
    }]
  },
  {
    body_md: "Ich übe gerade technische Basics täglich 30 Minuten – Kontinuität hilft. Wie macht ihr das?",
    media: []
  },
  {
    body_md: "Kennt ihr gute Online-Kurse für Handwerk/IT? Würde mich über Links freuen 📚",
    media: [{
      type: "image",
      url: "https://images.unsplash.com/photo-1520974722171-5f69e34f56b0?q=80&w=1200&auto=format&fit=crop",
      alt: "Online-Lernen"
    }]
  },
  {
    body_md: "Feedback gesucht: Wie wirkt mein Profiltext? Kurze Hinweise sehr willkommen!",
    media: []
  },
  {
    body_md: "Community-Frage: Welche Soft Skills sind euch im Team am wichtigsten? 🤔",
    media: []
  },
  {
    body_md: "Motivation des Tages: Jeden Tag eine kleine Sache besser machen. Was war euer Erfolg heute? ✨",
    media: [{
      type: "image",
      url: "https://images.unsplash.com/photo-1520975967075-3f1f3c2d7b68?q=80&w=1200&auto=format&fit=crop",
      alt: "Motivation"
    }]
  }
];

async function createTestPosts() {
  console.log('📝 Creating test posts for community feed...\n');

  try {
    // First, get a user ID to use as the author
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('⚠️  No authenticated user found. Using anonymous mode...');
      console.log('Note: You may need to authenticate to create posts');
      return;
    }

    console.log(`👤 Creating posts as user: ${user.email}`);

    // Create test posts
    const createdPosts = [];
    
    for (let i = 0; i < testPosts.length; i++) {
      const post = testPosts[i];
      
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          actor_user_id: user.id,
          body_md: post.body_md,
          media: post.media,
          status: 'published',
          visibility: 'CommunityOnly'
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating post ${i + 1}:`, error.message);
        continue;
      }

      createdPosts.push(data);
      console.log(`✅ Created post ${i + 1}: "${post.body_md.substring(0, 50)}..."`);
    }

    console.log(`\n🎉 Successfully created ${createdPosts.length} test posts!`);
    
    // Create some test likes and comments
    if (createdPosts.length > 0) {
      console.log('\n💬 Creating test interactions...');
      
      // Create some likes
      for (let i = 0; i < Math.min(3, createdPosts.length); i++) {
        const post = createdPosts[i];
        
        const { error: likeError } = await supabase
          .from('community_likes')
          .insert({
            post_id: post.id,
            liker_user_id: user.id
          });

        if (likeError) {
          console.error(`❌ Error creating like for post ${post.id}:`, likeError.message);
        } else {
          console.log(`❤️  Liked post ${i + 1}`);
        }
      }

      // Create some comments
      const testComments = [
        "Das ist super! Viel Erfolg! 🍀",
        "Gute Tipps, danke fürs Teilen!",
        "Ich kann dir gerne helfen!",
        "Sehr inspirierend! 👍",
        "Gute Frage, würde mich auch interessieren!"
      ];

      for (let i = 0; i < Math.min(3, createdPosts.length); i++) {
        const post = createdPosts[i];
        const comment = testComments[i % testComments.length];
        
        const { error: commentError } = await supabase
          .from('community_comments')
          .insert({
            post_id: post.id,
            author_user_id: user.id,
            body_md: comment
          });

        if (commentError) {
          console.error(`❌ Error creating comment for post ${post.id}:`, commentError.message);
        } else {
          console.log(`💬 Commented on post ${i + 1}: "${comment}"`);
        }
      }
    }

    console.log('\n✅ Test data creation completed!');
    console.log('You can now check your community feed to see the test posts.');

  } catch (error) {
    console.error('❌ Error creating test posts:', error.message);
  }
}

// Run the script
createTestPosts();
