import React from "react";
import PagesList from "./PagesList";
import SeoInsights from "./SeoInsights";

export default function ContentPage() {
  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Content</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Pages</h2>
          <PagesList />
        </section>
        <section className="rounded-2xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">SEO Insights</h2>
          <SeoInsights />
        </section>
      </div>
    </div>
  );
}
