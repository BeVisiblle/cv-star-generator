import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TokenLedgerRow { id: number; company_id: string; delta: number; reason: string; ref: string | null; client_request_id: string | null; created_at: string }
interface SeatLedgerRow { id: number; company_id: string; delta: number; reason: string; client_request_id: string | null; created_at: string }
interface PlanChangeRow { id: number; company_id: string; from_plan: string | null; to_plan: string; client_request_id: string | null; created_at: string }

interface HistoryTableProps {
  tokenLedger: TokenLedgerRow[];
  seatLedger: SeatLedgerRow[];
  planChanges: PlanChangeRow[];
}

export function HistoryTable({ tokenLedger, seatLedger, planChanges }: HistoryTableProps) {
  const rows = useMemo(() => {
    type Row = { ts: string; type: string; delta?: number; detail: string };
    const a: Row[] = tokenLedger.map(t => ({ ts: t.created_at, type: 'Token', delta: t.delta, detail: `${t.reason}${t.ref ? ` (${t.ref})` : ''}` }));
    const b: Row[] = seatLedger.map(s => ({ ts: s.created_at, type: 'Sitze', delta: s.delta, detail: s.reason }));
    const c: Row[] = planChanges.map(p => ({ ts: p.created_at, type: 'Plan', detail: `${p.from_plan ?? '—'} → ${p.to_plan}` }));
    return [...a, ...b, ...c].sort((x,y) => new Date(y.ts).getTime() - new Date(x.ts).getTime());
  }, [tokenLedger, seatLedger, planChanges]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verlauf</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">Kein Verlauf vorhanden</TableCell>
                </TableRow>
              ) : rows.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(r.ts).toLocaleString()}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.delta ?? '—'}</TableCell>
                  <TableCell>{r.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
