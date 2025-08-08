import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BaseLayout from "@/components/layout/BaseLayout";

interface PageData {
  id: string;
  title: string;
  slug: string;
  content_html: string | null;
  featured_image_url: string | null;
  meta_title: string;
  meta_description: string;
  page_type: string;
}

function setMetaTag(selector: string, attr: string, value: string) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (selector.startsWith('meta[')) {
      const match = selector.match(/\[(.*?)=(.*?)\]/);
      if (match) el.setAttribute(match[1], match[2].replace(/['"]/g, ""));
    }
    document.head.appendChild(el);
  }
  el?.setAttribute(attr, value);
}

function setCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export default function PublicPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PageData | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data, error } = await supabase
        .from("pages")
        .select("id, title, slug, content_html, featured_image_url, meta_title, meta_description, page_type")
        .eq("slug", slug)
        .eq("status", "published")
        .lte("publish_at", new Date().toISOString())
        .maybeSingle();
      if (error) console.warn(error);
      if (mounted) {
        setPage((data as PageData) || null);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [slug]);

  useEffect(() => {
    if (!page) return;
    document.title = page.meta_title || page.title;
    setMetaTag('meta[name="description"]', 'content', page.meta_description || '');
    setMetaTag('meta[property="og:title"]', 'content', page.meta_title || page.title);
    setMetaTag('meta[property="og:description"]', 'content', page.meta_description || '');
    if (page.featured_image_url) setMetaTag('meta[property="og:image"]', 'content', page.featured_image_url);
    setCanonical(window.location.origin + (page.page_type === 'blog' ? `/blog/${page.slug}` : `/p/${page.slug}`));

    // JSON-LD Article/Page schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': page.page_type === 'blog' ? 'BlogPosting' : 'WebPage',
      headline: page.meta_title || page.title,
      description: page.meta_description,
      image: page.featured_image_url || undefined,
      mainEntityOfPage: window.location.href,
    };
    const existing = document.getElementById('jsonld-page') as HTMLScriptElement | null;
    const script = existing ?? (document.createElement('script') as HTMLScriptElement);
    script.type = 'application/ld+json';
    script.id = 'jsonld-page';
    if (!existing) document.head.appendChild(script);
    script.textContent = JSON.stringify(jsonLd);
  }, [page]);

  if (loading) return <div className="py-12 text-muted-foreground">Lade…</div>;
  if (!page) return <div className="py-12 text-muted-foreground">Nicht gefunden</div>;

  return (
    <BaseLayout>
      <article className="py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{page.title}</h1>
        </header>
        {page.featured_image_url && (
          <img src={page.featured_image_url} alt={page.title + ' – Featured image'} className="rounded-md mb-6" loading="lazy" />
        )}
        <section className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content_html || "" }} />
      </article>
    </BaseLayout>
  );
}
