import { Button } from "@/components/ui/button";
import { Coins, Users, ArrowUpRight } from "lucide-react";

interface ActionBarProps {
  onAddTokens: () => void;
  onAddSeats: () => void;
  onUpgradePlan: () => void;
}

export function ActionBar({ onAddTokens, onAddSeats, onUpgradePlan }: ActionBarProps) {
  return (
    <div className="sticky bottom-3 z-10 flex gap-2 md:gap-3 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-2 rounded-xl border w-full md:w-auto">
      <Button onClick={onAddTokens} className="flex-1 md:flex-none">
        <Coins className="mr-2 h-4 w-4" /> Tokens hinzufügen
      </Button>
      <Button variant="outline" onClick={onAddSeats} className="flex-1 md:flex-none">
        <Users className="mr-2 h-4 w-4" /> Sitze kaufen
      </Button>
      <Button variant="secondary" onClick={onUpgradePlan} className="flex-1 md:flex-none">
        <ArrowUpRight className="mr-2 h-4 w-4" /> Plan upgraden
      </Button>
    </div>
  );
}
