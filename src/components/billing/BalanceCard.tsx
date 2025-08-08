import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface BalanceCardProps {
  planName?: string;
  tokenBalance: number;
  seats: number;
  renewsAt?: string | null;
  status: string;
}

export function BalanceCard({ planName = "Starter", tokenBalance, seats, renewsAt, status }: BalanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Abonnement</span>
          <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Plan</div>
          <div className="text-2xl font-semibold mt-1">{planName}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Tokens</div>
          <div className="text-2xl font-semibold mt-1">{tokenBalance}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Sitze</div>
          <div className="text-2xl font-semibold mt-1">{seats}</div>
        </div>
        <div className="md:col-span-3">
          <div className="text-sm text-muted-foreground">Nächste Verlängerung</div>
          <div className="mt-1">{renewsAt ? format(new Date(renewsAt), "dd.MM.yyyy HH:mm") : "—"}</div>
        </div>
      </CardContent>
    </Card>
  );
}
