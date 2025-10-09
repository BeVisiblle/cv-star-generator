import { useState, useRef, useEffect } from "react";
import { Mic, Square, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onComplete: (blob: Blob) => void;
  onBack: () => void;
}

export default function VoiceRecorder({ onComplete, onBack }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      toast({
        title: "Fehler",
        description: "Zugriff auf Mikrofon fehlgeschlagen. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const handleComplete = () => {
    if (audioBlob) {
      onComplete(audioBlob);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-purple-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {audioBlob ? "Aufnahme abgeschlossen" : isRecording ? "Aufnahme läuft..." : "Bereit zum Aufnehmen"}
              </h2>
              <p className="text-gray-600">
                {audioBlob 
                  ? "Klingt das gut? Oder möchtest du es nochmal versuchen?"
                  : isRecording 
                    ? "Erzähl uns über dich - sei einfach du selbst!"
                    : "Drücke auf Start, wenn du bereit bist"
                }
              </p>
            </div>

            <div className="flex flex-col items-center mb-8">
              {/* Mic Icon with Animation */}
              <div className={`w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-6 ${
                isRecording ? 'animate-pulse' : ''
              }`}>
                <Mic className="w-16 h-16 text-white" />
              </div>

              {/* Timer */}
              <div className="text-4xl font-bold text-gray-900 mb-4">
                {formatTime(recordingTime)}
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="flex items-center gap-2 text-red-500 animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium">Aufnahme läuft</span>
                </div>
              )}

              {/* Audio Preview */}
              {audioBlob && !isRecording && (
                <div className="mt-4 w-full">
                  <audio 
                    controls 
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              {!audioBlob && !isRecording && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                  >
                    Zurück
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    onClick={startRecording}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Aufnahme starten
                  </Button>
                </>
              )}

              {isRecording && (
                <Button
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={stopRecording}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Aufnahme stoppen
                </Button>
              )}

              {audioBlob && !isRecording && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={resetRecording}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Neu aufnehmen
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    onClick={handleComplete}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Weiter
                  </Button>
                </>
              )}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              {isRecording && recordingTime < 30 && (
                <p>Tipp: Nimm dir ruhig Zeit. Mindestens 30-60 Sekunden sind ideal!</p>
              )}
              {isRecording && recordingTime >= 60 && (
                <p className="text-green-600">Super! Du kannst jetzt stoppen oder weitersprechen.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
