import React from 'react';
import { PostFeed } from '@/components/feed/PostFeed';

export default function SocialFeedPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Social Feed</h1>
          <p className="text-muted-foreground">LinkedIn-ähnliche Beiträge mit Kommentaren, Likes und Media-Upload</p>
        </div>
        
        <PostFeed />
      </div>
    </div>
  );
}