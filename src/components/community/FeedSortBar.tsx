import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FeedSortOption = "relevant" | "newest";

export const FeedSortBar: React.FC = () => {
  const [sort, setSort] = useState<FeedSortOption>("relevant");

  useEffect(() => {
    const saved = (localStorage.getItem("feed_sort") as FeedSortOption) || "relevant";
    setSort(saved);
  }, []);

  const onChange = (value: FeedSortOption) => {
    setSort(value);
    localStorage.setItem("feed_sort", value);
    // Hinweis: Sortierung ist aktuell nur UI – Serverabfrage bleibt unverändert
  };

  return (
    <div className="-mx-1 sm:mx-0">
      <Card className="px-3 sm:px-4 py-2 flex items-center justify-between text-xs sm:text-sm">
        <div className="text-muted-foreground">Feed-Ansicht auswählen:</div>
        <div className="min-w-[180px]">
          <Select value={sort} onValueChange={(v) => onChange(v as FeedSortOption)}>
            <SelectTrigger className="h-8 text-xs sm:text-sm">
              <SelectValue placeholder="Relevanteste zuerst" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevant">Relevanteste zuerst</SelectItem>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
};

export default FeedSortBar;
