import { useState } from "react";
import VoiceIntro from "./VoiceIntro";
import VoiceRecorder from "./VoiceRecorder";
import VoiceProcessing from "./VoiceProcessing";

type VoiceFlowStep = "intro" | "recording" | "processing" | "preview";

export default function VoiceFlowContainer() {
  const [currentStep, setCurrentStep] = useState<VoiceFlowStep>("intro");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleStartRecording = () => {
    setCurrentStep("recording");
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setCurrentStep("processing");
  };

  const handleBack = () => {
    setCurrentStep("intro");
    setAudioBlob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {currentStep === "intro" && (
        <VoiceIntro onStart={handleStartRecording} />
      )}
      
      {currentStep === "recording" && (
        <VoiceRecorder 
          onComplete={handleRecordingComplete}
          onBack={handleBack}
        />
      )}
      
      {currentStep === "processing" && audioBlob && (
        <VoiceProcessing 
          audioBlob={audioBlob}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
