import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DynamicPricingProps {
  companyId: string;
  currentPlanId?: string;
  onBuyTokens: (qty: number, unitPriceCents: number) => void;
  onBuySeats: (qty: number, seatPriceCents: number) => void;
  onChangePlan: (toPlan: string) => void;
  plans: Array<{ id: string; name: string; monthly_price_cents: number; included_seats: number; included_tokens: number }>; 
  seatPricingTiers: Array<{ plan_id: string; min_seats: number; seat_price_cents: number }>;
}

export function DynamicPricing({ companyId, currentPlanId, onBuyTokens, onBuySeats, onChangePlan, plans, seatPricingTiers }: DynamicPricingProps) {
  const [tokenQty, setTokenQty] = useState<number>(50);
  const [tokenUnitCents, setTokenUnitCents] = useState<number | null>(null);
  const [seatQty, setSeatQty] = useState<number>(1);

  useEffect(() => {
    let cancelled = false;
    async function loadUnitPrice() {
      const { data, error } = await supabase.rpc('get_token_unit_price_cents', { qty: tokenQty });
      if (!cancelled) {
        if (error) {
          console.error('Unit price error', error);
          setTokenUnitCents(null);
        } else {
          setTokenUnitCents(data as number);
        }
      }
    }
    loadUnitPrice();
    return () => { cancelled = true; };
  }, [tokenQty]);

  const currentPlan = useMemo(() => plans.find(p => p.id === currentPlanId), [plans, currentPlanId]);

  const seatPriceCents = useMemo(() => {
    if (!currentPlan) return null;
    const tiers = seatPricingTiers.filter(t => t.plan_id === currentPlan.id).sort((a,b) => b.min_seats - a.min_seats);
    const tier = tiers.find(t => t.min_seats <= seatQty) || tiers[tiers.length - 1];
    return tier?.seat_price_cents ?? null;
  }, [seatPricingTiers, currentPlan, seatQty]);

  return (
    <Tabs defaultValue="tokens" className="w-full">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="tokens">Tokens</TabsTrigger>
        <TabsTrigger value="seats">Sitze</TabsTrigger>
        <TabsTrigger value="plans">Pläne</TabsTrigger>
      </TabsList>

      <TabsContent value="tokens">
        <Card>
          <CardHeader>
            <CardTitle>Tokens kaufen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Slider value={[tokenQty]} onValueChange={(v) => setTokenQty(v[0])} min={1} max={1000} step={1} className="flex-1" />
              <div className="w-16 text-right font-medium">{tokenQty}</div>
            </div>
            <div className="text-sm text-muted-foreground">Preis pro Token: {tokenUnitCents !== null ? (tokenUnitCents/100).toFixed(2) + ' €' : '—'}</div>
            <div className="text-lg font-semibold">Gesamt: {tokenUnitCents !== null ? ((tokenUnitCents * tokenQty)/100).toFixed(2) + ' €' : '—'}</div>
            <Button onClick={() => tokenUnitCents !== null && onBuyTokens(tokenQty, tokenUnitCents)} disabled={tokenUnitCents === null}>Bestätigen</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seats">
        <Card>
          <CardHeader>
            <CardTitle>Sitze kaufen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Slider value={[seatQty]} onValueChange={(v) => setSeatQty(v[0])} min={1} max={200} step={1} className="flex-1" />
              <div className="w-16 text-right font-medium">{seatQty}</div>
            </div>
            <div className="text-sm text-muted-foreground">Preis pro Sitz: {seatPriceCents !== null ? (seatPriceCents/100).toFixed(2) + ' € / Monat' : '—'}</div>
            <div className="text-lg font-semibold">Gesamt: {seatPriceCents !== null ? ((seatPriceCents * seatQty)/100).toFixed(2) + ' € / Monat' : '—'}</div>
            <Button onClick={() => seatPriceCents !== null && onBuySeats(seatQty, seatPriceCents)} disabled={seatPriceCents === null}>Bestätigen</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="plans">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <Card key={p.id} className={p.id === currentPlanId ? 'border-primary shadow' : ''}>
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span>{p.name}</span>
                  <span className="text-xl font-semibold">{(p.monthly_price_cents/100).toFixed(2)} €</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">Inklusive Sitze: {p.included_seats}</div>
                <div className="text-sm text-muted-foreground">Inklusive Tokens: {p.included_tokens}</div>
                <Button className="w-full mt-3" variant={p.id === currentPlanId ? 'secondary' : 'default'} onClick={() => onChangePlan(p.id)} disabled={p.id === currentPlanId}>
                  {p.id === currentPlanId ? 'Aktueller Plan' : 'Plan wählen'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
