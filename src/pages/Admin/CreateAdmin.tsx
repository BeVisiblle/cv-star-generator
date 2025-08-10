import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function CreateAdmin() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Fehlende Angaben", description: "Bitte E-Mail und Passwort eingeben." });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-actions", {
        body: { action: "create_admin", email, password },
      });
      if (error) throw error;
      toast({ title: "SuperAdmin erstellt", description: `User ID: ${data?.userId || "unbekannt"}` });
      setEmail("");
      setPassword("");
    } catch (err: any) {
      console.error("Create admin error", err);
      const message = err?.message || err?.error || "Unbekannter Fehler";
      toast({ title: "Fehler beim Erstellen", description: String(message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>SuperAdmin anlegen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Wird erstellt..." : "SuperAdmin erstellen"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
