import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureItem { title: string; description: string }
interface FeatureTabsProps { title: string; subtitle?: string; items: FeatureItem[] }

export default function FeatureTabs({ title, subtitle, items }: FeatureTabsProps) {
  return (
    <section className="py-10">
      <header className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </header>
      <Tabs defaultValue={items[0]?.title} className="w-full">
        <TabsList className="mx-auto mb-4 flex flex-wrap gap-2">
          {items.map((i) => (
            <TabsTrigger key={i.title} value={i.title}>{i.title}</TabsTrigger>
          ))}
        </TabsList>
        {items.map((i) => (
          <TabsContent key={i.title} value={i.title}>
            <Card>
              <CardHeader>
                <CardTitle>{i.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{i.description}</CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
