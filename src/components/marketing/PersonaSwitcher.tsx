import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface Persona { key: string; title: string; text: string }

interface PersonaSwitcherProps {
  title: string;
  cta: { label: string; href: string };
  personas: Persona[];
}

export default function PersonaSwitcher({ title, cta, personas }: PersonaSwitcherProps) {
  return (
    <section className="py-10">
      <header className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
      </header>
      <Tabs defaultValue={personas[0]?.key} className="w-full">
        <TabsList className="mx-auto mb-4 flex flex-wrap gap-2">
          {personas.map((p) => (
            <TabsTrigger key={p.key} value={p.key}>{p.title}</TabsTrigger>
          ))}
        </TabsList>
        {personas.map((p) => (
          <TabsContent key={p.key} value={p.key} className="text-center text-muted-foreground">
            <p className="max-w-2xl mx-auto mb-4">{p.text}</p>
            <Button asChild>
              <a href={cta.href} aria-label={cta.label}>{cta.label}</a>
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
