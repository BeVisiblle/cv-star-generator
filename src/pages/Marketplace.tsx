import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Users } from "lucide-react";

const Marketplace = () => {
  // Placeholder data - will be replaced with real data later
  const placeholderProfiles = [
    {
      id: 1,
      firstName: "Anna",
      status: "Schülerin",
      berufswunsch: "IT-Systemelektronikerin",
      location: "Frankfurt am Main, 60311",
      skills: ["HTML/CSS", "Teamarbeit", "Zuverlässigkeit"],
      aboutMe: "Ich interessiere mich sehr für Technik und möchte gerne eine Ausbildung im IT-Bereich beginnen..."
    },
    {
      id: 2,
      firstName: "Max",
      status: "Azubi",
      berufswunsch: "Kfz-Mechatroniker",
      location: "München, 80331",
      skills: ["Handwerk", "Problemlösung", "Mechanik"],
      aboutMe: "Als angehender Kfz-Mechatroniker bringe ich Leidenschaft für Autos und technisches Verständnis mit..."
    },
    {
      id: 3,
      firstName: "Lisa",
      status: "Schülerin",
      berufswunsch: "Medizinische Fachangestellte",
      location: "Hamburg, 20095",
      skills: ["Empathie", "Organisation", "Kommunikation"],
      aboutMe: "Ich möchte Menschen helfen und interessiere mich für den medizinischen Bereich. Mein Ziel ist es..."
    },
    {
      id: 4,
      firstName: "Tom",
      status: "Geselle",
      berufswunsch: "Elektrotechniker",
      location: "Berlin, 10115",
      skills: ["Elektrotechnik", "Präzision", "Sicherheit"],
      aboutMe: "Nach meiner Ausbildung zum Elektroniker möchte ich mich weiterbilden und neue Herausforderungen..."
    },
    // Add more placeholder profiles to test pagination
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">
              Entdecke Azubi-Profile und finde Inspiration für deine eigene Bewerbung
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {placeholderProfiles.length} Profile
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Name, Beruf oder Ort..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            Filter
          </Button>
        </div>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {placeholderProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 bg-muted">
                    <AvatarFallback>
                      {profile.firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{profile.firstName}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {profile.status}
                    </Badge>
                  </div>
                </div>

                {/* Career Goal */}
                <div className="space-y-1">
                  <p className="font-medium text-sm">{profile.berufswunsch}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profile.location}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* About Me Preview */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {profile.aboutMe.substring(0, 100)}...
                </p>

                {/* Action Button */}
                <Button variant="outline" size="sm" className="w-full">
                  Profil ansehen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Zurück
          </Button>
          <span className="text-sm text-muted-foreground">
            Seite 1 von 1
          </span>
          <Button variant="outline" size="sm" disabled>
            Weiter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;