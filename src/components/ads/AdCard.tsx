import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdCardProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  imageUrl?: string | null;
  onClick?: () => void;
}

export default function AdCard({ title, description, ctaLabel = "Jetzt testen", imageUrl, onClick }: AdCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-2xl p-4 bg-muted">
      <span className="absolute right-3 top-3 text-[11px] px-2 py-1 rounded-full bg-muted-foreground/10 text-muted-foreground">Anzeige</span>

      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground leading-snug">{description}</p>
          )}
        </div>

        {imageUrl ? (
          <img src={imageUrl} alt="Anzeige Bild" className="w-full h-28 object-cover rounded-lg" />
        ) : null}

        <Button onClick={onClick} size="sm" className="mt-1 self-start">
          {ctaLabel}
        </Button>
      </div>
    </Card>
  );
}
