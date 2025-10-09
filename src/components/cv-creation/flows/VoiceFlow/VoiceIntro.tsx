import { Mic, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VoiceIntroProps {
  onStart: () => void;
}

export default function VoiceIntro({ onStart }: VoiceIntroProps) {
  const tips = [
    "Dein Name und Alter",
    "Was du gerade machst (Schüler, Azubi, Ausgelernt)",
    "Welche Branche dich interessiert",
    "Deine bisherige Erfahrung (Schule, Jobs, Praktika)",
    "Besondere Fähigkeiten oder Qualifikationen"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-purple-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Mic className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎤 Voice CV in 60 Sekunden
              </h1>
              
              <p className="text-gray-600">
                Erzähl uns einfach über dich - wir erstellen automatisch deinen professionellen Lebenslauf
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Was du uns erzählen solltest:
              </h2>
              
              <div className="space-y-3">
                {tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-900">
                💡 <strong>Tipp:</strong> Je detaillierter du erzählst, desto besser wird dein CV! 
                Sprich ganz normal - Dialekt ist okay, wir verstehen dich 😉
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                Zurück
              </Button>
              
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={onStart}
              >
                Jetzt starten →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
