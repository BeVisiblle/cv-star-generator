import { useNavigate } from "react-router-dom";
import { Mic, MessageSquare, FileEdit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CVFlowSelector() {
  const navigate = useNavigate();

  const flows = [
    {
      id: "classic",
      title: "Selbst erstellen",
      description: "Schritt für Schritt durch alle Felder",
      time: "~10-15 Minuten",
      icon: FileEdit,
      color: "from-blue-500 to-blue-600",
      path: "/cv-generator"
    },
    {
      id: "voice",
      title: "Voice in 60 Sekunden",
      description: "Einfach losreden - wir machen den Rest",
      time: "< 90 Sekunden",
      icon: Mic,
      color: "from-purple-500 to-purple-600",
      path: "/cv-erstellen/voice",
      badge: "Neu"
    },
    {
      id: "chat",
      title: "Dialog mit unserer KI",
      description: "Wir fragen, du antwortest - ganz easy",
      time: "~5 Minuten",
      icon: MessageSquare,
      color: "from-green-500 to-green-600",
      path: "/cv-erstellen/chat",
      badge: "Neu"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wie möchtest du deinen CV erstellen?
          </h1>
          <p className="text-lg text-gray-600">
            Wähle die Methode, die am besten zu dir passt
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {flows.map((flow) => {
            const Icon = flow.icon;
            return (
              <Card
                key={flow.id}
                className="relative overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-primary"
                onClick={() => navigate(flow.path)}
              >
                {flow.badge && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {flow.badge}
                  </div>
                )}
                
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${flow.color} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {flow.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 min-h-[3rem]">
                    {flow.description}
                  </p>
                  
                  <div className="text-sm font-medium text-gray-500">
                    ⏱️ {flow.time}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Alle Methoden führen zum selben professionellen Ergebnis
          </p>
        </div>
      </div>
    </div>
  );
}
