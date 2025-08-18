import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Heart, MapPin, Briefcase, GraduationCap, User } from "lucide-react";

const ProduktUnternehmen: React.FC = () => {
  useEffect(() => {
    document.title = "Produkt Unternehmen – Handwerk Netzwerk";
    const desc = "Finden Sie die besten Kandidaten mit unserer intelligenten Kandidatensuche. Über 10.000 qualifizierte Fachkräfte warten auf Sie.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = desc;
  }, []);

  const candidates = [
    {
      name: "Timo",
      field: "handwerk",
      location: "Glashütten",
      education: "Führerschein",
      seeking: "Praktikum, Ausbildung",
      skills: [],
      match: 88,
      bgColor: "bg-blue-100",
    },
    {
      name: "Maximilian", 
      field: "handwerk",
      location: "Frankfurt",
      education: "Führerschein",
      seeking: "Keine Präferenz angegeben",
      skills: [],
      match: 62,
      bgColor: "bg-blue-100",
    },
    {
      name: "Todd",
      field: "handwerk", 
      location: "Schmitten",
      education: "Führerschein",
      seeking: "Keine Präferenz angegeben",
      skills: ["Kundenorientierung", "Körperliche Fitness", "Materialkunde", "Praktische Erfahrung"],
      match: 12,
      bgColor: "bg-blue-100",
    },
    {
      name: "Milo",
      field: "handwerk",
      location: "ffm", 
      education: "Führerschein",
      seeking: "Keine Präferenz angegeben",
      skills: [],
      match: 84,
      bgColor: "bg-blue-100",
    },
    {
      name: "Kalr",
      field: "it",
      location: "",
      education: "",
      seeking: "",
      skills: [],
      match: 3,
      bgColor: "bg-blue-100",
    },
    {
      name: "Gerda",
      field: "handwerk",
      location: "",
      education: "",
      seeking: "",
      skills: [],
      match: 84,
      bgColor: "bg-blue-100",
    },
    {
      name: "Fredericke", 
      field: "gesundheit",
      location: "",
      education: "",
      seeking: "",
      skills: [],
      match: 3,
      bgColor: "bg-blue-100",
    },
    {
      name: "Frederick",
      field: "handwerk",
      location: "",
      education: "",
      seeking: "",
      skills: [],
      match: 9,
      bgColor: "bg-blue-100",
    },
  ];

  const getMatchColor = (match: number) => {
    if (match >= 80) return "text-green-600";
    if (match >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Kandidatensuche</h1>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                85 Tokens
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                10 Kandidaten
              </Badge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Suche nach Kandidaten..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="px-6">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="px-6">
              <Search className="w-4 h-4 mr-2" />
              Suchen
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="bg-muted">
                <User className="w-4 h-4 mr-1" />
                All
              </Button>
              <Button variant="ghost" size="sm">
                Azubis
              </Button>
              <Button variant="ghost" size="sm">
                Schüler
              </Button>
              <Button variant="ghost" size="sm">
                Gesellen
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              10 Kandidaten gefunden
            </span>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {candidates.map((candidate, index) => (
            <Card key={index} className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className={candidate.bgColor}>
                    <AvatarFallback className="text-blue-700">
                      {candidate.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.field}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getMatchColor(candidate.match)}`}>
                    {candidate.match}%
                  </span>
                  <Heart className="w-4 h-4 text-muted-foreground hover:text-red-500 cursor-pointer" />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {candidate.field && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.field}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.education && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.education}</span>
                  </div>
                )}
              </div>

              {/* Seeking */}
              {candidate.seeking && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">Sucht:</p>
                  <p className="text-sm text-muted-foreground">{candidate.seeking}</p>
                </div>
              )}

              {/* Skills */}
              {candidate.skills.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Keine Skills hinterlegt</p>
              )}

              {/* Action Button */}
              <Button className="w-full" variant="default">
                Freischalten (1 Token)
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Finden Sie die perfekten Kandidaten
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Über 10.000 qualifizierte Fachkräfte, Azubis und Schüler warten auf Sie
          </p>
          <Button size="lg" variant="secondary">
            Jetzt kostenlos testen
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ProduktUnternehmen;