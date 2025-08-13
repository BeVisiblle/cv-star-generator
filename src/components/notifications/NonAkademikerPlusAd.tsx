import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Zap, TrendingUp } from "lucide-react";

export default function NonAkademikerPlusAd() {
  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Star className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">NonAkademiker Plus</h3>
            <p className="text-xs text-muted-foreground">Dein Premium-Vorteil</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Zap className="h-3 w-3 text-primary" />
            <span>5x mehr Sichtbarkeit</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span>Exklusive Premium-Jobs</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Star className="h-3 w-3 text-primary" />
            <span>Direkter Unternehmenskontakt</span>
          </div>
        </div>

        <Button size="sm" className="w-full">
          Jetzt upgraden
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Nur <span className="font-medium text-primary">9,99€/Monat</span>
        </p>
      </div>
    </Card>
  );
}