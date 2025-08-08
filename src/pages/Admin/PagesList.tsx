import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageRow {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  status: string;
  updated_at: string;
  meta_title: string;
  meta_description: string;
}

export default function PagesList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PageRow[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data, error } = await supabase
        .from("pages")
        .select("id, title, slug, page_type, status, updated_at, meta_title, meta_description")
        .order("updated_at", { ascending: false });
      if (error) console.error(error);
      if (mounted) {
        setRows((data as PageRow[]) || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const seoWarnings = useMemo(() => {
    const warn: Record<string, string[]> = {};
    rows.forEach((r) => {
      const issues: string[] = [];
      if (!r.meta_title || r.meta_title.length > 60) issues.push("Meta Title fehlt/zu lang");
      if (!r.meta_description || r.meta_description.length > 160) issues.push("Meta Description fehlt/zu lang");
      if (issues.length) warn[r.id] = issues;
    });
    return warn;
  }, [rows]);

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <Button onClick={() => navigate("/admin/pages/new")}>+ Neue Seite</Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Lade…</div>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <Card key={r.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{r.title}</CardTitle>
                  <div className="text-xs text-muted-foreground">/{r.page_type === 'blog' ? 'blog' : 'p'}/{r.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === 'published' ? 'default' : 'secondary'}>{r.status}</Badge>
                  <Badge variant="outline">{r.page_type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Aktualisiert: {new Date(r.updated_at).toLocaleString()}
                  {seoWarnings[r.id]?.length ? (
                    <div className="mt-1 text-destructive">
                      {seoWarnings[r.id].join(" • ")}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => navigate(`/admin/pages/${r.id}`)}>Bearbeiten</Button>
                  <Button variant="ghost" onClick={() => window.open(r.page_type === 'blog' ? `/blog/${r.slug}` : `/p/${r.slug}`, '_blank')}>Live ansehen</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
