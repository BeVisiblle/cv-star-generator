import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, MessageSquare, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Freunde",
      description: "Verwalte deine Kontakte und Verbindungen",
      icon: Users,
      path: "/community/contacts",
      color: "text-blue-600"
    },
    {
      title: "Unternehmen",
      description: "Entdecke und folge Unternehmen",
      icon: Building2,
      path: "/community/companies",
      color: "text-green-600"
    },
    {
      title: "Nachrichten",
      description: "Chatte mit deinen Kontakten",
      icon: MessageSquare,
      path: "/messages",
      color: "text-purple-600"
    },
    {
      title: "Jobs",
      description: "Finde passende Stellenangebote",
      icon: Briefcase,
      path: "/marketplace",
      color: "text-orange-600"
    }
  ];

  return (
    <main className="mx-auto max-w-[1200px] p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Community</h1>
        <p className="text-muted-foreground">
          Vernetze dich mit Freunden, Unternehmen und entdecke neue Möglichkeiten
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {sections.map((section) => (
          <Card
            key={section.path}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(section.path)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-muted ${section.color}`}>
                <section.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{section.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
                <Button variant="outline" size="sm">
                  Öffnen
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
