import { useState, useRef, useEffect } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hallo! 👋 Ich helfe dir dabei, deinen perfekten Lebenslauf zu erstellen. Lass uns einfach ein kurzes Gespräch führen. Bist du gerade Schüler, Azubi oder schon ausgelernt?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cvData, setCvData] = useState<Record<string, any>>({});
  const [completion, setCompletion] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("ai-chat-cv-assistant", {
        body: {
          message: userMessage,
          conversationHistory: messages,
          currentData: cvData
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { nextQuestion, extractedData, confidence, isComplete } = response.data;

      setCvData(extractedData);
      setCompletion(confidence.overall);

      if (isComplete) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Perfekt! 🎉 Ich habe alle Informationen. Lass mich deinen CV zusammenstellen..."
        }]);

        // Navigate to preview after a short delay
        setTimeout(() => {
          toast({
            title: "CV erstellt!",
            description: "Dein Lebenslauf ist bereit.",
          });
          window.location.href = "/cv-generator"; // Temporary redirect
        }, 2000);
      } else if (nextQuestion) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: nextQuestion
        }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      toast({
        title: "Fehler",
        description: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
        variant: "destructive"
      });
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Entschuldigung, da ist etwas schiefgelaufen. Kannst du deine letzte Antwort wiederholen?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-lg p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">CV Assistent</h2>
              <p className="text-sm text-gray-600">Powered by KI</p>
            </div>
            
            {completion > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">{completion}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card className={`max-w-[80%] p-4 ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-gray-100 p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-gray-600">Denke nach...</span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white rounded-b-xl shadow-lg p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Deine Antwort..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
