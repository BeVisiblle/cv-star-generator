import React from 'react';
import LinkedInPostCard from '@/components/post/LinkedInPostCard';
import type { LinkedInPost } from '@/hooks/useLinkedInPosts';

// Sample data for demonstration
const samplePosts: LinkedInPost[] = [
  {
    id: '1',
    author_id: 'user1',
    body: `Spannende Entwicklungen in der Tech-Branche! 🚀

AI und Machine Learning revolutionieren weiterhin die Art, wie wir arbeiten. Besonders beeindruckend finde ich die Fortschritte in der natürlichen Sprachverarbeitung.

Was sind eure Gedanken zu den neuesten Entwicklungen? Welche Tools nutzt ihr bereits in eurem Arbeitsalltag?

#TechTrends #AI #MachineLearning #Innovation`,
    attachments: [],
    visibility: 'public',
    like_count: 42,
    comment_count: 18,
    repost_count: 7,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 'user1',
      vorname: 'Max',
      nachname: 'Mustermann',
      headline: 'Senior Software Engineer bei TechCorp',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    liked_by_user: false
  },
  {
    id: '2',
    author_id: 'user2',
    body: `Heute hatte ich ein faszinierendes Gespräch über die Zukunft der Arbeit. Remote Work ist nicht mehr nur ein Trend, sondern die neue Realität.

Wichtige Erkenntnisse:
• Flexibilität steigert die Produktivität
• Work-Life-Balance wird neu definiert  
• Tools für virtuelle Zusammenarbeit sind entscheidend

Wie seht ihr die Entwicklung? Arbeitet ihr lieber remote oder im Büro?`,
    attachments: [],
    visibility: 'public',
    like_count: 89,
    comment_count: 34,
    repost_count: 12,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 'user2',
      vorname: 'Anna',
      nachname: 'Schmidt',
      headline: 'HR Director | People & Culture',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b812?w=150&h=150&fit=crop&crop=face'
    },
    liked_by_user: true
  },
  {
    id: '3',
    author_id: 'user3',
    body: `Kurzes Update zu unserem neuesten Projekt! 📊

Nach 6 Monaten intensiver Entwicklung können wir endlich die Ergebnisse teilen. Unser Team hat eine innovative Lösung entwickelt, die Unternehmen dabei hilft, ihre Datenanalyse zu verbessern.

Besonders stolz bin ich auf:
✅ 40% schnellere Verarbeitung
✅ Intuitive Benutzeroberfläche
✅ Nahtlose Integration

Ein großes Dankeschön an das gesamte Team! 🙏`,
    attachments: [],
    visibility: 'public',
    like_count: 156,
    comment_count: 23,
    repost_count: 8,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 'user3',
      vorname: 'Thomas',
      nachname: 'Weber',
      headline: 'Product Manager | Data Analytics',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    liked_by_user: false
  }
];

export default function LinkedInDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">LinkedIn-Style PostCard Demo</h1>
          <p className="text-muted-foreground">
            Demonstriert die vollständige LinkedIn-artige PostCard mit Kommentar-Funktionalität
          </p>
        </div>
        
        <div className="space-y-6">
          {samplePosts.map((post) => (
            <LinkedInPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}