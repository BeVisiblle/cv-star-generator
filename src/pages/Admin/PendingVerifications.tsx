import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Building2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

type PendingCompany = {
  id: string;
  name: string;
  primary_email: string;
  created_at: string;
  industry: string | null;
  location: string | null;
  website_url: string | null;
  contact_person: string | null;
  employee_count: number | null;
};

export default function PendingVerifications() {
  const queryClient = useQueryClient();

  const { data: pendingCompanies = [], isLoading } = useQuery({
    queryKey: ["pending-verifications"],
    queryFn: async (): Promise<PendingCompany[]> => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, primary_email, created_at, industry, location, website_url, contact_person, employee_count")
        .eq("account_status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from("companies")
        .update({ account_status: "active" })
        .eq("id", companyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-verifications"] });
      toast.success("Unternehmen erfolgreich verifiziert");
    },
    onError: (error) => {
      toast.error("Fehler beim Verifizieren: " + error.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from("companies")
        .update({ 
          account_status: "frozen",
          frozen_at: new Date().toISOString(),
          frozen_reason: "Manuell abgelehnt durch Admin"
        })
        .eq("id", companyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-verifications"] });
      toast.success("Unternehmen wurde abgelehnt");
    },
    onError: (error) => {
      toast.error("Fehler beim Ablehnen: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ausstehende Verifizierungen</h2>
        <p className="text-muted-foreground">
          Neue Unternehmensanmeldungen, die auf Freischaltung warten
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Wartende Unternehmen
          </CardTitle>
          <CardDescription>
            {pendingCompanies.length} {pendingCompanies.length === 1 ? "Unternehmen wartet" : "Unternehmen warten"} auf Verifizierung
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine ausstehenden Verifizierungen</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unternehmen</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Branche</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Angemeldet</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        {company.contact_person && (
                          <div className="text-sm text-muted-foreground">
                            Kontakt: {company.contact_person}
                          </div>
                        )}
                        {company.website_url && (
                          <a 
                            href={company.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {company.website_url}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {company.primary_email}
                    </TableCell>
                    <TableCell>
                      {company.industry ? (
                        <Badge variant="outline">{company.industry}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.location || (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(company.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => verifyMutation.mutate(company.id)}
                          disabled={verifyMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verifizieren
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(company.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Ablehnen
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
