import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export type RenderItem = { id: string; avatar?: string | null; title: string; subtitle?: string; meta?: string };

interface SuggestionListProps<T> {
  title: string;
  fetchFn: () => Promise<{ data: T[] | null; error: any }>;
  onPrimary: (item: T) => Promise<void>;
  onView?: (item: T) => void;
  onSkip?: (item: T) => Promise<void> | void;
  primaryLabel: string;
  secondaryLabel?: string;
  itemKey: (item: T) => string;
  renderItem: (item: T) => RenderItem;
}

export function SuggestionList<T>({
  title,
  fetchFn,
  onPrimary,
  onView,
  onSkip,
  primaryLabel,
  secondaryLabel,
  itemKey,
  renderItem,
}: SuggestionListProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(initial = false) {
    if (initial) setLoading(true);
    const { data } = await fetchFn();
    setItems((data || []).slice(0, 3));
    if (initial) setLoading(false);
  }

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refillOne(prevSnapshot: T[]) {
    const { data } = await fetchFn();
    const existing = new Set(prevSnapshot.map(itemKey));
    const candidates = (data || []).filter((d) => !existing.has(itemKey(d)));
    if (candidates.length) {
      setItems((prev) => [...prev, candidates[0]].slice(0, 3));
    }
  }

  async function handlePrimary(idx: number) {
    const target = items[idx];
    const snapshot = items.filter((_, i) => i !== idx);
    setItems(snapshot);
    try {
      await onPrimary(target);
    } finally {
      if (snapshot.length < 3) await refillOne(snapshot);
    }
  }

  async function handleSkip(idx: number) {
    const target = items[idx];
    const snapshot = items.filter((_, i) => i !== idx);
    setItems(snapshot);
    try {
      await onSkip?.(target);
    } finally {
      if (snapshot.length < 3) await refillOne(snapshot);
    }
  }

  return (
    <Card className="p-3 sm:p-4" aria-live="polite">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>

      {loading && (
        <div className="space-y-3" aria-hidden>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <ul className="space-y-2">
          {items.map((item, idx) => {
            const it = renderItem(item);
            const alt = `${it.title} avatar`;
            return (
              <li key={it.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={it.avatar ?? undefined} alt={alt} />
                  <AvatarFallback>{it.title.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm font-medium truncate")}>{it.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[it.subtitle, it.meta].filter(Boolean).join(" • ")}
                  </div>
                </div>
                {onView && (
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={secondaryLabel || "View"}
                    onClick={() => onView(item)}
                  >
                    {secondaryLabel || "View"}
                  </Button>
                )}
                <Button size="sm" onClick={() => handlePrimary(idx)} aria-label={primaryLabel}>
                  {primaryLabel}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Skip"
                  onClick={() => handleSkip(idx)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && items.length === 0 && (
        <div className="text-xs text-muted-foreground">No suggestions right now – check back later.</div>
      )}
    </Card>
  );
}
