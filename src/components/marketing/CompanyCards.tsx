import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyCardsProps {
  title: string;
  subtitle?: string;
  items: { title: string; text: string }[];
}

export default function CompanyCards({ title, subtitle, items }: CompanyCardsProps) {
  return (
    <section className="py-10">
      <header className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <Card key={it.title}>
            <CardHeader>
              <CardTitle>{it.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">{it.text}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
