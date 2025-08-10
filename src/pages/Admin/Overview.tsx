import React from "react";
import { KpiCard } from "@/components/admin/KpiCard";
import { useKpis } from "@/hooks/useKpis";
import { Skeleton } from "@/components/ui/skeleton";

export default function Overview() {
  const { data, isLoading } = useKpis("last_30_days");

  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Overview</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <KpiCard title="Total Revenue" value={data!.revenue} format="currency" delta={4.2} />
            <KpiCard title="DAU Users" value={data!.dauUsers} delta={-1.1} />
            <KpiCard title="DAU Companies" value={data!.dauCompanies} delta={2.3} />
            <KpiCard title="Unlocked Profiles" value={data!.unlockedProfiles} delta={6.0} />
          </>
        )}
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="rounded-2xl border bg-card shadow-sm p-4">
          <header className="mb-2"><h2 className="text-sm font-medium text-muted-foreground">DAU over time</h2></header>
          <Skeleton className="h-48 rounded-xl" />
        </article>
        <article className="rounded-2xl border bg-card shadow-sm p-4">
          <header className="mb-2"><h2 className="text-sm font-medium text-muted-foreground">Registrations per week</h2></header>
          <Skeleton className="h-48 rounded-xl" />
        </article>
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="rounded-2xl border bg-card shadow-sm p-4">
          <header className="mb-2"><h2 className="text-sm font-medium text-muted-foreground">Plan distribution</h2></header>
          <Skeleton className="h-48 rounded-xl" />
        </article>
        <article className="rounded-2xl border bg-card shadow-sm p-4">
          <header className="mb-2"><h2 className="text-sm font-medium text-muted-foreground">Activity by Bundesland</h2></header>
          <Skeleton className="h-48 rounded-xl" />
        </article>
      </section>
    </div>
  );
}
