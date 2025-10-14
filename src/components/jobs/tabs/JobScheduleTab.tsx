import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export function JobScheduleTab() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Die Terminplanung für Interviews und andere Events wird in Kürze verfügbar sein.
        </p>
      </CardContent>
    </Card>
  );
}
