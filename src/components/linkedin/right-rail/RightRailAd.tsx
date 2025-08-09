import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RightRailAdProps {
  variant?: "card" | "banner";
  imageUrl?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

export const RightRailAd: React.FC<RightRailAdProps> = ({
  variant = "card",
  imageUrl = "/placeholder.svg",
  title = "Entdecke jetzt die Zukunft deiner Karriere",
  description = "Teste unsere Tools für Azubis und Fachkräfte – kostenlos starten!",
  ctaText = "Jetzt testen",
  ctaHref = "#",
  className,
}) => {
  const isBanner = variant === "banner";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className="text-[10px]">Anzeige</Badge>
      </div>

      <div className={cn("w-full", isBanner ? "aspect-[3/1]" : "aspect-video")}> 
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold leading-tight mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <Button size="sm" onClick={() => (ctaHref ? window.open(ctaHref, "_blank") : null)}>
          {ctaText}
        </Button>
      </div>
    </Card>
  );
};
