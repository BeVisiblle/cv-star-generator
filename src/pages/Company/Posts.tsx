import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Image as ImageIcon, 
  Send, 
  Globe, 
  Users, 
  Lock,
  Heart,
  MessageCircle,
  Share2,
  Calendar
} from "lucide-react";

interface Post {
  id: string;
  content: string;
  media_url?: string;
  visibility: string;
  created_at: string;
  company_id: string;
}

export default function CompanyPosts() {
  const { company } = useCompany();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({
    content: "",
    visibility: "public" as "public" | "followers" | "internal",
    mediaUrl: "",
  });
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (company) {
      loadPosts();
    }
  }, [company]);

  const loadPosts = async () => {
    if (!company) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_posts')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({ title: "Fehler beim Laden der Beiträge", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!company || !newPost.content.trim()) return;

    setPosting(true);
    try {
      const { data, error } = await supabase
        .from('company_posts')
        .insert({
          company_id: company.id,
          content: newPost.content.trim(),
          visibility: newPost.visibility,
          media_url: newPost.mediaUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      setPosts(prev => [data, ...prev]);
      setNewPost({ content: "", visibility: "public", mediaUrl: "" });
      toast({ title: "Beitrag erfolgreich veröffentlicht!" });
    } catch (error: any) {
      toast({ 
        title: "Fehler beim Veröffentlichen", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setPosting(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public": return <Globe className="h-4 w-4" />;
      case "followers": return <Users className="h-4 w-4" />;
      case "internal": return <Lock className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case "public": return "Öffentlich";
      case "followers": return "Follower";
      case "internal": return "Intern";
      default: return "Öffentlich";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 min-h-screen bg-background max-w-full overflow-x-hidden space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Beiträge</h1>
        <Badge variant="secondary">
          {posts.length} Beiträge veröffentlicht
        </Badge>
      </div>

      {/* Post Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Neuen Beitrag erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={company?.logo_url || ""} alt={company?.name} />
              <AvatarFallback>
                {company?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Was möchten Sie teilen?"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Bild hinzufügen
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="visibility" className="text-sm">Sichtbarkeit:</Label>
                    <Select 
                      value={newPost.visibility} 
                      onValueChange={(value: "public" | "followers" | "internal") => 
                        setNewPost(prev => ({ ...prev, visibility: value }))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Öffentlich
                          </div>
                        </SelectItem>
                        <SelectItem value="followers">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Follower
                          </div>
                        </SelectItem>
                        <SelectItem value="internal">
                          <div className="flex items-center">
                            <Lock className="h-4 w-4 mr-2" />
                            Intern
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPost.content.trim() || posting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {posting ? "Wird veröffentlicht..." : "Veröffentlichen"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Noch keine Beiträge</h3>
              <p className="text-muted-foreground">
                Erstellen Sie Ihren ersten Beitrag, um mit Kandidaten in Kontakt zu treten.
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                {/* Post Header */}
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={company?.logo_url || ""} alt={company?.name} />
                    <AvatarFallback>
                      {company?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{company?.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getVisibilityIcon(post.visibility)}
                        <span className="ml-1">{getVisibilityText(post.visibility)}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                  {post.media_url && (
                    <img 
                      src={post.media_url} 
                      alt="Post media" 
                      className="mt-3 rounded-lg max-w-full h-auto"
                    />
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center space-x-6 pt-3 border-t">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Heart className="h-4 w-4 mr-2" />
                    Gefällt mir
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Kommentieren
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share2 className="h-4 w-4 mr-2" />
                    Teilen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}