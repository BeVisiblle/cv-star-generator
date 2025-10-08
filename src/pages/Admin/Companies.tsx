import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CompanyRow {
  id: string;
  name: string;
  plan_type: string | null;
  seats: number | null;
  industry: string | null;
  main_location: string | null;
  created_at: string | null;
  subscription_status: string | null;
  employee_count: number | null;
  logo_url: string | null;
  account_status: string | null;
  onboarding_completed: boolean | null;
  website_url: string | null;
}

export default function CompaniesPage() {
  const [rows, setRows] = useState<CompanyRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select(`
          id, name, plan_type, seats, industry, main_location, created_at, 
          subscription_status, employee_count, logo_url, account_status,
          onboarding_completed, website_url
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (!mounted) return;
      
      if (error) {
        console.warn("Companies fetch error", error);
        setRows([]);
      } else {
        setRows(data as CompanyRow[]);
        
        // Calculate stats
        const total = data.length;
        const active = data.filter(c => c.account_status === 'active').length;
        const pending = data.filter(c => c.account_status === 'pending').length;
        const inactive = data.filter(c => c.account_status === 'inactive' || !c.account_status).length;
        
        setStats({ total, active, pending, inactive });
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const getStatusBadge = (status: string | null, onboarding: boolean | null) => {
    if (status === 'active' && onboarding) {
      return <Badge className="bg-green-500 hover:bg-green-600">Aktiv</Badge>;
    }
    if (status === 'active' && !onboarding) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Setup läuft</Badge>;
    }
    if (status === 'pending') {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Wartend</Badge>;
    }
    return <Badge variant="secondary">Inaktiv</Badge>;
  };

  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Unternehmen</h1>
        <p className="text-muted-foreground mt-1">Übersicht aller registrierten Unternehmen</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Gesamt</CardDescription>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Alle Unternehmen</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Aktiv</CardDescription>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.active}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Vollständig eingerichtet</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Wartend</CardDescription>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.pending}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Benötigen Freigabe</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Inaktiv</CardDescription>
              <XCircle className="h-4 w-4 text-gray-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-600 dark:text-gray-400">
              {stats.inactive}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Nicht aktiv</p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Unternehmen</CardTitle>
          <CardDescription>Detaillierte Übersicht mit allen Informationen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Branche</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Sitze</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead>Website</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-muted-foreground">Lade Unternehmen...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {!loading && rows && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                      Keine Unternehmen gefunden.
                    </TableCell>
                  </TableRow>
                )}
                
                {!loading && rows && rows.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/50">
                    <TableCell>
                      {c.logo_url ? (
                        <img 
                          src={c.logo_url} 
                          alt={c.name} 
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.industry || "—"}</TableCell>
                    <TableCell>{c.main_location || "—"}</TableCell>
                    <TableCell>
                      {c.employee_count ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{c.employee_count}</span>
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.plan_type || "Basic"}</Badge>
                    </TableCell>
                    <TableCell>{c.seats ?? 1}</TableCell>
                    <TableCell>
                      {getStatusBadge(c.account_status, c.onboarding_completed)}
                    </TableCell>
                    <TableCell>
                      {c.created_at ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(c.created_at).toLocaleDateString('de-DE')}</span>
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {c.website_url ? (
                        <a 
                          href={c.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Link
                        </a>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
