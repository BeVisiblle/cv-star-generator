import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TokenManagerProps {
  companyId: string;
}

export function TokenManager({ companyId }: TokenManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { data: wallet } = useQuery({
    queryKey: ["company-wallet", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_token_wallets")
        .select("*")
        .eq("company_id", companyId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: history } = useQuery({
    queryKey: ["token-history", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_activity")
        .select("*")
        .eq("company_id", companyId)
        .eq("type", "token_change")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const updateTokens = useMutation({
    mutationFn: async (delta: number) => {
      const { error } = await supabase
        .from("company_token_wallets")
        .update({ balance: (wallet?.balance || 0) + delta })
        .eq("company_id", companyId);

      if (error) throw error;

      // Log activity
      await supabase.from("company_activity").insert({
        company_id: companyId,
        type: "token_change",
        actor_user_id: (await supabase.auth.getUser()).data.user?.id,
        payload: { delta, reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-wallet", companyId] });
      queryClient.invalidateQueries({ queryKey: ["token-history", companyId] });
      setAmount("");
      setReason("");
      toast({
        title: "Tokens aktualisiert",
        description: "Der Token-Stand wurde erfolgreich geändert.",
      });
    },
  });

  const handleAdd = () => {
    const delta = parseInt(amount);
    if (!delta || delta <= 0) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte geben Sie eine positive Zahl ein.",
        variant: "destructive",
      });
      return;
    }
    updateTokens.mutate(delta);
  };

  const handleRemove = () => {
    const delta = -parseInt(amount);
    if (!delta || delta >= 0) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte geben Sie eine positive Zahl ein.",
        variant: "destructive",
      });
      return;
    }
    updateTokens.mutate(delta);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Token-Verwaltung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Aktueller Stand</Label>
            <p className="text-3xl font-bold">{wallet?.balance || 0} Tokens</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Anzahl</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleAdd} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
              <Button onClick={handleRemove} variant="destructive" className="flex-1">
                <Minus className="h-4 w-4 mr-2" />
                Entfernen
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Grund</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="z.B. Bonus für Kampagne XY"
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Historie</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Änderung</TableHead>
                <TableHead>Grund</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.created_at).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        (entry.payload as any).delta > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {(entry.payload as any).delta > 0 ? "+" : ""}
                      {(entry.payload as any).delta}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(entry.payload as any).reason || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
