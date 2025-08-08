import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface InfoCardProps extends React.ComponentProps<typeof Card> {}

export function InfoCard({ className, ...props }: InfoCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl shadow-sm border bg-card text-card-foreground p-4 sm:p-6 max-w-full",
        // Guardrails
        "break-words hyphens-auto",
        className
      )}
      {...props}
    />
  );
}
