import React, { useEffect, useState } from "react";
import { CompanyRecommendations } from "@/components/linkedin/right-rail/CompanyRecommendations";
import { PLZOrtSelector } from "@/components/shared/PLZOrtSelector";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface CompanyDistance {
  company_id: string;
  name: string | null;
  city: string | null;
  postal_code: string | null;
  distance_km: number;
}

const DiscoverCompanies: React.FC = () => {
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [radius, setRadius] = useState<string>("25");
  const [results, setResults] = useState<CompanyDistance[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Unternehmen entdecken – Handwerk Netzwerk";
    const desc = "Finde interessante Unternehmen im Handwerk und entdecke neue Chancen.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = desc;
  }, []);

  const handleSearch = async () => {
    if (!plz || plz.length !== 5) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const { data: coords } = await supabase.rpc('coords_for_plz', { plz_input: plz });
      const loc = Array.isArray(coords) ? coords[0] : coords;
      if (!loc) {
        setResults([]);
        return;
      }
      const { data, error } = await supabase.rpc('search_companies_within_radius', {
        lat_input: loc.lat,
        lon_input: loc.lon,
        radius_km: Number(radius)
      });
      if (error) throw error;
      setResults(data as CompanyDistance[]);
    } catch (e) {
      console.error('Radius-Suche Fehler (Unternehmen):', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Interessante Unternehmen</h1>
        <p className="text-muted-foreground">Erkunde Arbeitgeber und informiere dich über Branchen.</p>
      </header>

      <section className="mb-6 p-4 rounded-lg border bg-card">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <Label>PLZ und Ort</Label>
            <PLZOrtSelector
              plz={plz}
              ort={ort}
              onPLZChange={(newPlz, newOrt) => { setPlz(newPlz); setOrt(newOrt); }}
              onOrtChange={(newOrt) => setOrt(newOrt)}
            />
          </div>
          <div>
            <Label>Radius</Label>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Radius" /></SelectTrigger>
              <SelectContent>
                {["5","10","25","50"].map(r => (
                  <SelectItem key={r} value={r}>{r} km</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={handleSearch} disabled={loading} className="md:ml-2">{loading ? 'Suche…' : 'Suchen'}</Button>
          </div>
        </div>
      </section>

      <main>
        {results ? (
          results.length ? (
            <div className="space-y-3">
              {results.map((r) => (
                <div key={r.company_id} className="p-3 rounded-md border bg-muted/30 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.name || 'Unbekannt'}</div>
                    <div className="text-sm text-muted-foreground">{r.city || 'Ort unbekannt'} · PLZ {r.postal_code || plz}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{r.distance_km.toFixed(1)} km</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Keine Ergebnisse für diese Suche.</p>
          )
        ) : (
          <CompanyRecommendations limit={12} showMore={false} />
        )}
      </main>
    </div>
  );
};

export default DiscoverCompanies;
