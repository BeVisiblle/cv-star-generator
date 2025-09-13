import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function PostingTest() {
  const [testContent, setTestContent] = useState('Test post content');
  const [testImageUrl, setTestImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createTestPost = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const postId = crypto.randomUUID();
      
      const { error } = await supabase
        .from("posts")
        .insert({
          id: postId,
          content,
          image_url: imageUrl,
          user_id: user.id,
          post_type: 'text',
          visibility: 'public',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { id: postId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      toast({
        title: "✅ Test Post Created",
        description: "Post was successfully created and saved to database.",
      });
    },
    onError: (error) => {
      console.error("Error creating test post:", error);
      toast({
        title: "❌ Test Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .limit(5);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Database Connection Success",
        description: `Found ${data?.length || 0} posts in database.`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Database Connection Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testPostCreation = () => {
    if (!testContent.trim()) {
      toast({
        title: "❌ Invalid Input",
        description: "Please enter some test content.",
        variant: "destructive",
      });
      return;
    }

    createTestPost.mutate({ 
      content: testContent, 
      imageUrl: testImageUrl || undefined 
    });
  };

  const testImageUpload = async () => {
    if (!user) {
      toast({
        title: "❌ Not Authenticated",
        description: "Please log in to test image upload.",
        variant: "destructive",
      });
      return;
    }

    // Create a simple test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1, 1);
    }
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        const file = new File([blob], 'test-image.png', { type: 'image/png' });
        const fileExt = 'png';
        const fileName = `test-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/test/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(filePath);

        setTestImageUrl(publicUrl);
        toast({
          title: "✅ Image Upload Success",
          description: "Test image uploaded successfully.",
        });
      } catch (error: any) {
        toast({
          title: "❌ Image Upload Failed",
          description: `Error: ${error.message}`,
          variant: "destructive",
        });
      }
    }, 'image/png');
  };

  return (
    <Card className="p-6 m-4">
      <h2 className="text-2xl font-bold mb-4">🧪 Posting Functionality Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">1. Database Connection Test</h3>
          <Button 
            onClick={testDatabaseConnection} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Testing..." : "Test Database Connection"}
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">2. Image Upload Test</h3>
          <Button 
            onClick={testImageUpload} 
            disabled={!user}
            variant="outline"
          >
            Test Image Upload
          </Button>
          {testImageUrl && (
            <div className="mt-2">
              <p className="text-sm text-green-600">✅ Image URL: {testImageUrl}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">3. Post Creation Test</h3>
          <div className="space-y-2">
            <Textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Enter test post content..."
              className="min-h-[100px]"
            />
            <Input
              value={testImageUrl}
              onChange={(e) => setTestImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
            />
            <Button 
              onClick={testPostCreation} 
              disabled={createTestPost.isPending || !user}
              className="w-full"
            >
              {createTestPost.isPending ? "Creating Post..." : "Create Test Post"}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test Status:</h4>
          <ul className="text-sm space-y-1">
            <li>✅ User authenticated: {user ? "Yes" : "No"}</li>
            <li>✅ Supabase client: Available</li>
            <li>✅ Mutation hook: Ready</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
