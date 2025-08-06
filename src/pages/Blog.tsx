import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Blog() {
  const navigate = useNavigate();

  const blogPosts = [
    {
      title: "10 Tipps für eine erfolgreiche Azubi-Bewerbung",
      description: "Wie du dich von der Masse abhebst und deine Traumausbildung bekommst.",
      readTime: "5 min Lesezeit"
    },
    {
      title: "Ausbildungswechsel: Wann und wie?",
      description: "Alles was du über einen Wechsel deiner Ausbildung wissen musst.",
      readTime: "8 min Lesezeit"
    },
    {
      title: "Von der Schule in die Ausbildung: Der ultimative Guide",
      description: "Schritt-für-Schritt Anleitung für deinen erfolgreichen Start.",
      readTime: "12 min Lesezeit"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Zurück zur Startseite
          </Button>
          
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Blog & Ratgeber
          </h1>
          <p className="text-lg text-muted-foreground">
            Tipps und Tricks für deinen erfolgreichen Weg in die Ausbildung
          </p>
        </div>

        <div className="grid gap-6">
          {blogPosts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {post.readTime}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">{post.description}</p>
                <Button variant="outline">Artikel lesen →</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Bereit für deinen Traumjob?
          </h2>
          <Button 
            size="lg" 
            onClick={() => navigate('/cv-generator')}
            className="text-lg px-8 py-6"
          >
            Jetzt CV erstellen
          </Button>
        </div>
      </div>
    </div>
  );
}