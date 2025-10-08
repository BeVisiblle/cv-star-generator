import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TokenManager } from "./TokenManager";
import { Coins, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlanManagerProps {
  companyId: string;
}

export function PlanManager({ companyId }: PlanManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ["admin-company-plan", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("current_plan_id, plan_type, plan_status, token_balance")
        .eq("id", companyId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Aktueller Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-2xl font-bold">
                {company?.current_plan_id || "Free"}
              </p>
            </div>
            <Badge variant={company?.plan_status === 'active' ? 'default' : 'secondary'}>
              {company?.plan_status || 'inactive'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Token Balance: <strong>{company?.token_balance || 0}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      <TokenManager companyId={companyId} />
    </div>
  );
}
