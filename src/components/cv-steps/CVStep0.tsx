import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, Sparkles } from 'lucide-react';
import { useAuthForCV } from '@/hooks/useAuthForCV';

const CVStep0 = () => {
  const navigate = useNavigate();
  const { profile } = useAuthForCV();

  const handleCreateWithProfile = () => {
    // User hat bereits ein Profil, verwende diese Daten
    navigate('/onboarding?source=cv-generator');
  };

  const handleCreateFromScratch = () => {
    // Direkt zum CV Generator ohne Profil
    navigate('/cv-generator?skip-profile=true');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Wie möchtest du deinen CV erstellen?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Wähle die beste Option für dich. Mit einem Profil kannst du deine Daten später auch für Job-Bewerbungen nutzen.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Mit Profil erstellen */}
        <Card className="p-8 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Mit Profil erstellen</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Erstelle erst ein Profil und generiere dann automatisch deinen CV. 
                Deine Daten sind später für Bewerbungen verfügbar.
              </p>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-start gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Profil für Job-Matching nutzen</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>CV automatisch aus Profil generieren</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Daten mehrfach verwenden</span>
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={handleCreateWithProfile}
            >
              Profil erstellen & CV generieren
            </Button>
          </div>
        </Card>

        {/* Nur CV erstellen */}
        <Card className="p-8 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Nur CV erstellen</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Erstelle schnell einen CV ohne Profil. 
                Ideal wenn du nur einen Lebenslauf brauchst.
              </p>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-start gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Schneller Start</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Weniger Schritte</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Nur CV-Daten eingeben</span>
              </div>
            </div>

            <Button 
              variant="outline"
              className="w-full mt-4" 
              size="lg"
              onClick={handleCreateFromScratch}
            >
              Direkt zum CV Generator
            </Button>
          </div>
        </Card>
      </div>

      {profile && (
        <div className="max-w-4xl mx-auto p-4 bg-primary/5 rounded-lg border text-center">
          <p className="text-sm">
            <strong>Hinweis:</strong> Du hast bereits ein Profil! 
            Wir können deinen CV automatisch mit deinen Profil-Daten füllen.
          </p>
        </div>
      )}
    </div>
  );
};

export default CVStep0;
