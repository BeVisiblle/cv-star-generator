import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Star, Eye, Users } from "lucide-react";

const ProduktAzubis: React.FC = () => {
  useEffect(() => {
    document.title = "Produkt Azubis – Handwerk Netzwerk";
    const desc = "Entdecke die Zukunft deiner Karriere. Teste unsere Tools für Azubis und Fachkräfte kostenlos.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = desc;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Entdecke jetzt die Zukunft deiner Karriere
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Teste unsere Tools für Azubis und Fachkräfte – kostenlos starten!
            </p>
            <Button size="lg" variant="secondary" className="mr-4">
              Jetzt testen
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <Card className="p-6 mb-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                  MM
                </div>
                <h3 className="font-semibold text-lg">Marie Mayer</h3>
                <p className="text-muted-foreground text-sm">
                  Wir sind e...
                </p>
                <p className="text-muted-foreground text-xs flex items-center justify-center gap-1 mt-1">
                  <span>Schmitten</span> • <span>handwerk</span> • <span>dd</span>
                </p>
              </div>
            </Card>

            <Card className="p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Profilbesuche</span>
                  <span className="font-semibold">295</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Impressions von Beiträgen</span>
                  <span className="font-semibold">102</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3">Schnellaktionen</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Jobvorschläge
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Trend-Jobs
                </Button>
              </div>
            </Card>
          </div>

          {/* Center Feed */}
          <div className="lg:col-span-6">
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>MM</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Was möchtest du posten?"
                    className="w-full p-3 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-primary">
                  Bild/Video
                </Button>
                <Button variant="ghost" size="sm" className="text-primary">
                  Event
                </Button>
                <Button variant="ghost" size="sm" className="text-primary">
                  Dokument
                </Button>
                <Button variant="ghost" size="sm" className="text-primary">
                  Umfrage
                </Button>
              </div>
            </Card>

            <Card className="p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Feed-Ansicht auswählen:</span>
                <select className="border border-border rounded px-3 py-1">
                  <option>Neueste zuerst</option>
                </select>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>TS</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">Timo Schäfer</h4>
                  <p className="text-sm text-muted-foreground">vor etwa 3 Stunden</p>
                  <p className="text-xs text-muted-foreground">Schüler:in in Handwerk</p>
                </div>
              </div>
              
              <p className="mb-4">
                Hallo Leute, ich bin neu hier! Ich freue mich über jede Kontaktanfrage :)
              </p>
              
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg"></div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4 mr-1" />
                    0
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    0 Kommentare
                  </Button>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <Card className="p-4 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <div className="text-center">
                <h4 className="font-bold text-lg mb-2">
                  Entdecke jetzt die Zukunft deiner Karriere
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Teste unsere Tools für Azubis und Fachkräfte – kostenlos starten!
                </p>
                <Button className="w-full mb-4">
                  Jetzt testen
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">NonAkademiker Plus</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Dein Premium-Vorteil
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>5x mehr Sichtbarkeit</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-primary" />
                  <span>Exklusive Premium-Jobs</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Direkter Unternehmenskontakt</span>
                </div>
              </div>

              <Button className="w-full mb-2">
                Jetzt upgraden
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Nur 9,99€/Monat
              </p>
            </Card>

            <Card className="p-4 mt-6">
              <h4 className="font-semibold mb-3">Interesting People for You</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>ZH</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Zara Hakan</p>
                    <p className="text-xs text-muted-foreground">azubi • hand...</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm">Connect</Button>
                  <Button size="sm" variant="ghost">×</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduktAzubis;