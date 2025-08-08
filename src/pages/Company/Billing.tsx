import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { BalanceCard } from "@/components/billing/BalanceCard";
import { ActionBar } from "@/components/billing/ActionBar";
import { DynamicPricing } from "@/components/billing/DynamicPricing";
import { HistoryTable } from "@/components/billing/HistoryTable";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionRow {
  company_id: string;
  plan_id: string;
  seats: number;
  token_balance: number;
  renews_at: string | null;
  status: string;
}

export default function BillingPage() {
  const { company } = useCompany();
  const qc = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Abrechnung & Tokens | Unternehmen";
    const meta = document.querySelector('meta[name="description"]') || document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', 'Verwalten Sie Plan, Token-Guthaben und Sitze. Kaufen Sie Tokens, fügen Sie Sitze hinzu und ändern Sie Ihren Plan.');
    document.head.appendChild(meta);
  }, []);

  const companyId = company?.id;

  const { data: subscription } = useQuery({
    queryKey: ["subscription", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();
      if (error) throw error;
      return data as SubscriptionRow | null;
    }
  });

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await supabase.from('plans').select('*').eq('active', true).order('monthly_price_cents');
      return (data || []) as Array<{ id: string; name: string; monthly_price_cents: number; included_seats: number; included_tokens: number }>;
    }
  });

  const { data: seatPricingTiers } = useQuery({
    queryKey: ["seatPricingTiers"],
    queryFn: async () => {
      const { data } = await supabase.from('seat_pricing_tiers').select('*').eq('active', true);
      return (data || []) as Array<{ plan_id: string; min_seats: number; seat_price_cents: number }>;
    }
  });

  const { data: tokenLedger } = useQuery({
    queryKey: ["tokenLedger", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase.from('token_ledger').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: seatLedger } = useQuery({
    queryKey: ["seatLedger", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase.from('seat_ledger').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: planChanges } = useQuery({
    queryKey: ["planChanges", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase.from('plan_changes').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const planName = useMemo(() => plans?.find(p => p.id === subscription?.plan_id)?.name, [plans, subscription?.plan_id]);

  async function handleBuyTokens(qty: number, unitCents: number) {
    if (!companyId) return;
    const id = crypto.randomUUID();
    const { data, error } = await supabase.rpc('purchase_tokens', { _company_id: companyId, _qty: qty, _client_request_id: id });
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Erfolgreich', description: `Tokens gekauft: ${qty} (\u20AC${((unitCents*qty)/100).toFixed(2)})` });
      qc.invalidateQueries({ queryKey: ["subscription", companyId] });
      qc.invalidateQueries({ queryKey: ["tokenLedger", companyId] });
    }
  }

  async function handleBuySeats(qty: number, seatCents: number) {
    if (!companyId) return;
    const id = crypto.randomUUID();
    const { data, error } = await supabase.rpc('add_seats', { _company_id: companyId, _add: qty, _client_request_id: id });
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Erfolgreich', description: `Sitze hinzugefügt: ${qty} (\u20AC${((seatCents*qty)/100).toFixed(2)}/Monat)` });
      qc.invalidateQueries({ queryKey: ["subscription", companyId] });
      qc.invalidateQueries({ queryKey: ["seatLedger", companyId] });
    }
  }

  async function handleChangePlan(toPlan: string) {
    if (!companyId) return;
    const id = crypto.randomUUID();
    const { data, error } = await supabase.rpc('change_plan', { _company_id: companyId, _to_plan: toPlan, _client_request_id: id });
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Plan aktualisiert', description: `Neuer Plan: ${plans?.find(p => p.id === toPlan)?.name || toPlan}` });
      qc.invalidateQueries({ queryKey: ["subscription", companyId] });
      qc.invalidateQueries({ queryKey: ["planChanges", companyId] });
    }
  }

  return (
    <main className="p-3 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold">Abrechnung & Tokens</h1>

      <BalanceCard
        planName={planName}
        tokenBalance={subscription?.token_balance ?? 0}
        seats={subscription?.seats ?? (company?.seats ?? 1)}
        renewsAt={subscription?.renews_at ?? null}
        status={subscription?.status ?? 'active'}
      />

      <DynamicPricing
        companyId={companyId || ''}
        currentPlanId={subscription?.plan_id}
        plans={plans || []}
        seatPricingTiers={seatPricingTiers || []}
        onBuyTokens={handleBuyTokens}
        onBuySeats={handleBuySeats}
        onChangePlan={handleChangePlan}
      />

      <HistoryTable tokenLedger={tokenLedger || []} seatLedger={seatLedger || []} planChanges={planChanges || []} />

      <div className="fixed inset-x-0 bottom-3 px-3 md:px-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <ActionBar
            onAddTokens={() => handleBuyTokens(50, 100)}
            onAddSeats={() => handleBuySeats(1, 1000)}
            onUpgradePlan={() => handleChangePlan(plans?.[1]?.id || 'growth')}
          />
        </div>
      </div>
    </main>
  );
}
