import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface CompanyRow {
  id: string;
  name: string;
  plan_type: string | null;
  seats: number | null;
  industry: string | null;
  main_location: string | null;
  created_at: string | null;
  subscription_status: string | null;
}

export default function CompaniesPage() {
  const [rows, setRows] = useState<CompanyRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select("id,name,plan_type,seats,industry,main_location,created_at,subscription_status")
        .limit(10);
      if (!mounted) return;
      if (error) {
        console.warn("Companies fetch error", error);
        setRows([]);
      } else {
        setRows(data as CompanyRow[]);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Companies</h1>
      <div className="rounded-2xl border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <input placeholder="Search companies" className="h-9 w-full sm:w-64 rounded-md border px-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]" />
          <div className="flex gap-2">
            <select className="h-9 rounded-md border px-2"><option>All plans</option></select>
            <select className="h-9 rounded-md border px-2"><option>All status</option></select>
          </div>
        </div>
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Bundesland</TableHead>
                <TableHead>Signup</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7} className="py-6 text-muted-foreground">Loading…</TableCell></TableRow>
              ))}
              {!loading && rows && rows.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-6 text-muted-foreground">No companies found.</TableCell></TableRow>
              )}
              {!loading && rows && rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.plan_type ?? "—"}</TableCell>
                  <TableCell>{c.seats ?? 0}</TableCell>
                  <TableCell>{c.industry ?? "—"}</TableCell>
                  <TableCell>{c.main_location ?? "—"}</TableCell>
                  <TableCell>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>{c.subscription_status ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
