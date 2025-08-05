import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Send, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

const Community = () => {
  const [newPost, setNewPost] = useState("");

  // Placeholder posts data
  const placeholderPosts = [
    {
      id: 1,
      author: {
        name: "Anna",
        status: "Schülerin",
        avatar: "A",
        location: "Frankfurt am Main"
      },
      content: "Hey Leute! Ich starte bald meine Ausbildung zur IT-Systemelektronikerin. Hat jemand Tipps für den ersten Tag? 😊",
      timestamp: "vor 2 Stunden",
      likes: 12,
      comments: 5,
      isLiked: false
    },
    {
      id: 2,
      author: {
        name: "Max",
        status: "Azubi (2. Jahr)",
        avatar: "M",
        location: "München"
      },
      content: "Heute war ein super Tag in der Werkstatt! Endlich den ersten Motor komplett zerlegt und wieder zusammengebaut. Das Gefühl ist unbeschreiblich! 🔧⚙️",
      timestamp: "vor 4 Stunden",
      likes: 25,
      comments: 8,
      isLiked: true
    },
    {
      id: 3,
      author: {
        name: "Lisa",
        status: "Schülerin",
        avatar: "L",
        location: "Hamburg"
      },
      content: "Frage an alle MFA-Azubis: Wie habt ihr euch auf das Vorstellungsgespräch vorbereitet? Ich bin total nervös! 😰",
      timestamp: "vor 6 Stunden",
      likes: 8,
      comments: 12,
      isLiked: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community</h1>
            <p className="text-muted-foreground">
              Tausche dich mit anderen Azubis aus, stelle Fragen und teile deine Erfahrungen
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              1,234 Mitglieder
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              42 aktiv heute
            </Badge>
          </div>
        </div>
      </div>

      {/* Create Post */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>Du</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Was beschäftigt dich heute? Teile deine Gedanken, Fragen oder Erfahrungen..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {newPost.length}/500 Zeichen
                  </div>
                  <Button 
                    disabled={!newPost.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Beitrag veröffentlichen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {placeholderPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Post Header */}
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{post.author.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{post.author.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {post.author.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {post.author.location} • {post.timestamp}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="text-sm leading-relaxed">
                  {post.content}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Teilen
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline">
          Weitere Beiträge laden
        </Button>
      </div>
    </div>
  );
};

export default Community;