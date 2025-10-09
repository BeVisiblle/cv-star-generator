import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceProcessingProps {
  audioBlob: Blob;
  onBack: () => void;
}

type ProcessingStep = "transcribing" | "extracting" | "enhancing" | "complete" | "error";

export default function VoiceProcessing({ audioBlob, onBack }: VoiceProcessingProps) {
  const [step, setStep] = useState<ProcessingStep>("transcribing");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    processAudio();
  }, []);

  const processAudio = async () => {
    try {
      // Step 1: Transcribe and Normalize
      setStep("transcribing");
      
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");
      formData.append("targetLang", "de");
      formData.append("glossaryDomain", "general");
      
      const transcribeResponse = await fetch(
        `https://koymmvuhcxlvcuoyjnvv.supabase.co/functions/v1/transcribe-and-normalize`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text();
        throw new Error(`Transcription failed: ${errorText}`);
      }

      const transcribeData = await transcribeResponse.json();
      console.log("Transcription result:", transcribeData);
      const normalizedText = transcribeData.normalized.text;

      // Step 2: Extract CV Data
      setStep("extracting");
      
      const parseResponse = await supabase.functions.invoke("ai-parse-cv-chat-smart", {
        body: {
          userInput: normalizedText,
          currentData: {},
          context: {
            flowType: "voice"
          }
        }
      });

      if (parseResponse.error) {
        throw new Error(parseResponse.error.message);
      }

      console.log("Parse result:", parseResponse.data);

      // Step 3: Auto-enhancements (already included in parse response)
      setStep("enhancing");
      
      // Simulate enhancement time
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStep("complete");

      // TODO: Save to session and redirect to preview
      toast({
        title: "Erfolg!",
        description: "Dein CV wurde erfolgreich erstellt.",
      });

      // Navigate to preview (to be implemented)
      setTimeout(() => {
        window.location.href = "/cv-generator"; // Temporary redirect
      }, 1500);

    } catch (err) {
      console.error("Processing error:", err);
      setStep("error");
      setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten");
      
      toast({
        title: "Fehler",
        description: "Die Verarbeitung ist fehlgeschlagen. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };

  const steps = [
    { id: "transcribing", label: "Transkription läuft", icon: "🎤" },
    { id: "extracting", label: "Informationen extrahieren", icon: "📝" },
    { id: "enhancing", label: "CV optimieren", icon: "✨" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-purple-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {step === "error" ? "Fehler aufgetreten" : step === "complete" ? "Fertig! 🎉" : "Ich erstelle deinen Lebenslauf..."}
              </h2>
              <p className="text-gray-600">
                {step === "error" 
                  ? "Bitte versuche es erneut" 
                  : step === "complete"
                    ? "Dein CV ist bereit!"
                    : "Einen Moment bitte, das geht ganz schnell"
                }
              </p>
            </div>

            {step !== "error" && step !== "complete" && (
              <div className="space-y-6 mb-8">
                {steps.map((s, idx) => {
                  const isActive = s.id === step;
                  const isPast = steps.findIndex(st => st.id === step) > idx;
                  
                  return (
                    <div key={s.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                        isPast 
                          ? "bg-green-100" 
                          : isActive 
                            ? "bg-purple-100 animate-pulse" 
                            : "bg-gray-100"
                      }`}>
                        {isPast ? "✓" : s.icon}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`font-medium ${
                          isPast 
                            ? "text-green-600" 
                            : isActive 
                              ? "text-purple-600" 
                              : "text-gray-400"
                        }`}>
                          {s.label}
                        </p>
                      </div>
                      
                      {isActive && (
                        <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {step === "error" && (
              <div className="mb-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {step === "complete" && (
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-4xl">🎉</span>
                </div>
                <p className="text-gray-600">
                  Weiterleitung zur Vorschau...
                </p>
              </div>
            )}

            {step === "error" && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onBack}
                >
                  Zurück
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  onClick={processAudio}
                >
                  Erneut versuchen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
