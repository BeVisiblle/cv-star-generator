import React, { useState } from "react";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

export default function AdminTools() {
  const [csvUrl, setCsvUrl] = useState("");
  const [limit, setLimit] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSeeding(dryRun: boolean) {
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      const body: any = {
        dry_run: dryRun,
      };
      if (csvUrl.trim()) body.url = csvUrl.trim();
      const parsedLimit = parseInt(limit, 10);
      if (!Number.isNaN(parsedLimit) && parsedLimit > 0) body.limit = parsedLimit;

      const { data, error } = await supabase.functions.invoke("seed-locations-de", { body });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Fehler beim Ausführen");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <AdminAuthGate requiredRole="ContentEditor">
      <div className="py-8">
        <h1 className="text-2xl font-semibold mb-2">Admin Tools</h1>
        <p className="text-muted-foreground mb-6">Standortdaten (PLZ, Ort, Koordinaten) bequem importieren – ohne Terminal.</p>

        <Card>
          <CardHeader>
            <CardTitle>DE-Standorte seeden</CardTitle>
            <CardDescription>
              Lädt eine PLZ→Geo-Koordinaten CSV und schreibt Koordinaten zu vorhandenen postal_codes in public.locations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="csv">CSV-Quelle (optional)</Label>
                <Input id="csv" placeholder="Leer lassen für Standard-Quelle" value={csvUrl} onChange={(e) => setCsvUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Limit (optional)</Label>
                <Input id="limit" type="number" min={0} placeholder="0 = alle" value={limit} onChange={(e) => setLimit(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button variant="outline" disabled={isRunning} onClick={() => runSeeding(true)}>
                Dry-Run anzeigen
              </Button>
              <Button disabled={isRunning} onClick={() => runSeeding(false)}>
                Import starten
              </Button>
            </div>

            <Separator className="my-6" />

            {isRunning && (
              <div className="text-sm text-muted-foreground">Läuft… bitte warten. Große Imports können mehrere Minuten dauern.</div>
            )}

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            {result && (
              <div className="text-sm">
                <div className="font-medium">Ergebnis</div>
                <pre className="mt-2 rounded-md bg-muted p-3 overflow-auto text-xs">
{JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminAuthGate>
  );
}
