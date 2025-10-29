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
  size?: "sm" | "md";
  className?: string;
}

export const RightRailAd: React.FC<RightRailAdProps> = ({
  variant = "card",
  imageUrl = "/placeholder.svg",
  title = "Entdecke jetzt die Zukunft deiner Karriere",
  description = "Teste unsere Tools für Azubis und Fachkräfte – kostenlos starten!",
  ctaText = "Jetzt testen",
  ctaHref = "#",
  size = "md",
  className,
}) => {
  const isBanner = variant === "banner";
  const imgClass = isBanner
    ? size === "sm" ? "h-16" : "aspect-[3/1]"
    : size === "sm" ? "h-24" : "aspect-video";
  const titleClass = size === "sm" ? "text-xs" : "text-sm";
  const descClass = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className="text-[11px]">Anzeige</Badge>
      </div>

      <div className={cn("w-full", imgClass)}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <h3 className={cn("font-semibold leading-tight mb-1", titleClass)}>{title}</h3>
        <p className={cn("text-muted-foreground mb-3", descClass)}>{description}</p>
        <Button size="sm" onClick={() => (ctaHref ? window.open(ctaHref, "_blank") : null)}>
          {ctaText}
        </Button>
      </div>
    </Card>
  );
};
