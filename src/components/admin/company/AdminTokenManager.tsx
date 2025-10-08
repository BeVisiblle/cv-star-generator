import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Coins, Plus, Minus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AdminTokenManagerProps {
  companyId: string;
}

export function AdminTokenManager({ companyId }: AdminTokenManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  // Fetch token wallet with auto-initialization
  const { data: wallet, refetch } = useQuery({
    queryKey: ["company-wallet", companyId],
    queryFn: async () => {
      // First try to get existing wallet
      let { data, error } = await supabase
        .from("company_token_wallets")
        .select("*")
        .eq("company_id", companyId)
        .single();
      
      // If not found, create it
      if (error && error.code === "PGRST116") {
        const { error: createError } = await supabase
          .rpc("ensure_company_wallet", { p_company_id: companyId });
        
        if (createError) {
          console.error("Error creating wallet:", createError);
          throw createError;
        }
        
        // Fetch the newly created wallet
        const { data: freshWallet, error: fetchError } = await supabase
          .from("company_token_wallets")
          .select("*")
          .eq("company_id", companyId)
          .single();
        
        if (fetchError) throw fetchError;
        return freshWallet;
      }
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch token statistics
  const { data: tokenStats } = useQuery({
    queryKey: ["company-token-stats", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_token_stats")
        .select("*")
        .eq("company_id", companyId)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data || { available_tokens: 0, tokens_used: 0, total_received: 0 };
    },
  });

  // Realtime subscription for token balance
  useEffect(() => {
    const channel = supabase
      .channel('token-wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_token_wallets',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => {
          console.log("Token wallet updated:", payload);
          queryClient.invalidateQueries({ queryKey: ["company-wallet", companyId] });
          queryClient.invalidateQueries({ queryKey: ["company-token-stats", companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);

  // Fetch token history
  const { data: history } = useQuery({
    queryKey: ["token-history", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_activity")
        .select("*")
        .eq("company_id", companyId)
        .eq("type", "tokens_adjusted")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const addTokensMutation = useMutation({
    mutationFn: async (tokenAmount: number) => {
      console.log("Adding tokens:", { companyId, tokenAmount, reason });
      
      const { error } = await supabase.rpc("admin_add_tokens", {
        p_company_id: companyId,
        p_amount: tokenAmount,
        p_reason: reason || null,
      });

      if (error) {
        console.error("Error adding tokens:", error);
        throw error;
      }
      
      console.log("Tokens added successfully");
    },
    onSuccess: async () => {
      console.log("Token mutation successful, refetching...");
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["company-wallet", companyId] });
      queryClient.invalidateQueries({ queryKey: ["company-token-stats", companyId] });
      queryClient.invalidateQueries({ queryKey: ["token-history", companyId] });
      queryClient.invalidateQueries({ queryKey: ["admin-company", companyId] });
      toast({ title: "Erfolg", description: "Tokens erfolgreich aktualisiert" });
      setAmount("");
      setReason("");
    },
    onError: (error: Error) => {
      console.error("Token mutation error:", error);
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = () => {
    const num = parseInt(amount);
    if (!num || num <= 0) {
      toast({ title: "Fehler", description: "Bitte gib eine gültige Anzahl ein", variant: "destructive" });
      return;
    }
    addTokensMutation.mutate(num);
  };

  const handleRemove = () => {
    const num = parseInt(amount);
    if (!num || num <= 0) {
      toast({ title: "Fehler", description: "Bitte gib eine gültige Anzahl ein", variant: "destructive" });
      return;
    }
    addTokensMutation.mutate(-num);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verfügbar</p>
                <p className="text-4xl font-bold">{tokenStats?.available_tokens || wallet?.balance || 0}</p>
              </div>
              <Coins className="h-12 w-12 text-muted-foreground opacity-20" />
            </div>
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Verwendet</p>
                  <p className="font-semibold">{tokenStats?.tokens_used || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gesamt erhalten</p>
                  <p className="font-semibold">{tokenStats?.total_received || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tokens verwalten</CardTitle>
          <CardDescription>
            Tokens zum Unternehmenskonto hinzufügen oder entfernen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Anzahl</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="z.B. 100"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Grund</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Grund für die Änderung (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={!amount || addTokensMutation.isPending}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
            <Button
              onClick={handleRemove}
              disabled={!amount || addTokensMutation.isPending}
              variant="destructive"
              className="flex-1"
            >
              <Minus className="h-4 w-4 mr-2" />
              Entfernen
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verlauf</CardTitle>
          <CardDescription>Letzte Token-Transaktionen</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Änderung</TableHead>
                <TableHead>Grund</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.map((entry) => {
                const payload = entry.payload as any;
                const amount = payload?.amount || 0;
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {new Date(entry.created_at).toLocaleString("de-DE")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={amount > 0 ? "default" : "destructive"}>
                        {amount > 0 ? "+" : ""}{amount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payload?.reason || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!history || history.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Keine Transaktionen vorhanden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}