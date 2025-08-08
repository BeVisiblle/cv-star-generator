import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import slugify from "slugify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface PageForm {
  id?: string;
  title: string;
  slug: string;
  content_html: string;
  content_markdown?: string;
  featured_image_url?: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  category?: string;
  tags?: string;
  page_type: string;
  status: string;
  publish_at?: string; // datetime-local
}

const toSlug = (s: string) => slugify(s, { lower: true, strict: true, trim: true });

export default function PageEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== "new");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [form, setForm] = useState<PageForm>({
    title: "",
    slug: "",
    content_html: "",
    meta_title: "",
    meta_description: "",
    keywords: "",
    page_type: "blog",
    status: "draft",
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!isEdit || !id) return;
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) console.error(error);
      if (mounted && data) {
        setForm({
          id: data.id,
          title: data.title ?? "",
          slug: data.slug ?? "",
          content_html: data.content_html ?? "",
          content_markdown: data.content_markdown ?? undefined,
          featured_image_url: data.featured_image_url ?? undefined,
          meta_title: data.meta_title ?? "",
          meta_description: data.meta_description ?? "",
          keywords: (data.keywords ?? []).join(", "),
          category: data.category ?? undefined,
          tags: (data.tags ?? []).join(", "),
          page_type: data.page_type ?? "blog",
          status: data.status ?? "draft",
          publish_at: data.publish_at ? new Date(data.publish_at).toISOString().slice(0,16) : undefined,
        });
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const seo = useMemo(() => {
    const titleOk = form.meta_title.length > 0 && form.meta_title.length <= 60;
    const descOk = form.meta_description.length > 0 && form.meta_description.length <= 160;
    const score = (titleOk ? 50 : 0) + (descOk ? 50 : 0);
    return { titleOk, descOk, score };
  }, [form.meta_title, form.meta_description]);

  const canPublish = seo.titleOk && seo.descOk;

  const onChange = (k: keyof PageForm, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function handleUpload(file: File) {
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    onChange("featured_image_url", data.publicUrl);
  }

  async function save(statusOverride?: string) {
    setSaving(true);
    try {
      if (!user) throw new Error("Nicht angemeldet");
      const payload: any = {
        title: form.title,
        slug: form.slug || toSlug(form.title),
        content_html: form.content_html,
        content_markdown: form.content_markdown ?? null,
        featured_image_url: form.featured_image_url ?? null,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        keywords: form.keywords ? form.keywords.split(",").map((s) => s.trim()).filter(Boolean) : [],
        category: form.category ?? null,
        tags: form.tags ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
        page_type: form.page_type,
        status: statusOverride ?? form.status,
        publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
        author_id: user.id,
      };

      // Publishing guard
      if ((statusOverride ?? form.status) === "published") {
        if (!canPublish) throw new Error("SEO-Felder unvollständig (Title/Description)");
      }

      if (isEdit && form.id) {
        const { error } = await supabase.from("pages").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("pages").insert(payload).select("id").maybeSingle();
        if (error) throw error;
        onChange("id", data?.id);
      }
      // Navigate back to list
      navigate("/admin/pages");
    } catch (e: any) {
      alert(e.message || "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-8 text-muted-foreground">Lade…</div>;
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? "Seite bearbeiten" : "Neue Seite"}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/pages")}>Abbrechen</Button>
          <Button variant="secondary" onClick={() => save("draft")} disabled={saving}>Als Entwurf speichern</Button>
          <Button onClick={() => save("published")} disabled={!canPublish || saving}>Veröffentlichen</Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titel (H1)</Label>
              <Input id="title" value={form.title} onChange={(e) => {
                onChange("title", e.target.value);
                if (!isEdit) onChange("slug", toSlug(e.target.value));
              }} placeholder="Seitentitel" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => onChange("slug", toSlug(e.target.value))} placeholder="auto-aus-titel" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Seitentyp</Label>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.page_type} onChange={(e) => onChange("page_type", e.target.value)}>
                <option value="blog">Blog</option>
                <option value="landing">Landing Page</option>
                <option value="resource">Resource</option>
                <option value="legal">Legal</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(e) => onChange("status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <Label>Publish Datum/Zeit</Label>
              <Input type="datetime-local" value={form.publish_at || ""} onChange={(e) => onChange("publish_at", e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Meta Title (≤ 60)</Label>
              <Input value={form.meta_title} onChange={(e) => onChange("meta_title", e.target.value)} />
              <div className={"text-xs mt-1 " + (seo.titleOk ? "text-muted-foreground" : "text-destructive")}>
                {form.meta_title.length} / 60
              </div>
            </div>
            <div>
              <Label>Meta Description (≤ 160)</Label>
              <Textarea value={form.meta_description} onChange={(e) => onChange("meta_description", e.target.value)} />
              <div className={"text-xs mt-1 " + (seo.descOk ? "text-muted-foreground" : "text-destructive")}>
                {form.meta_description.length} / 160
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Keywords (kommagetrennt)</Label>
              <Input value={form.keywords} onChange={(e) => onChange("keywords", e.target.value)} />
            </div>
            <div>
              <Label>Tags (kommagetrennt)</Label>
              <Input value={form.tags || ""} onChange={(e) => onChange("tags", e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div>
              <Label>Featured Image</Label>
              <Input type="url" placeholder="https://…" value={form.featured_image_url || ""} onChange={(e) => onChange("featured_image_url", e.target.value)} />
              {form.featured_image_url && (
                <img src={form.featured_image_url} alt="Featured" className="mt-2 max-h-40 rounded-md" loading="lazy" />
              )}
            </div>
            <div>
              <Label>Upload Bild</Label>
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </div>
          </div>

          <div>
            <Label>Inhalt</Label>
            <ReactQuill theme="snow" value={form.content_html} onChange={(v) => onChange("content_html", v)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
