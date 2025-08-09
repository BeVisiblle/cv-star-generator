import React from "react";
import { Badge } from "@/components/ui/badge";

interface FilterChipsBarProps {
  className?: string;
}

const chips = [
  { id: "personen", label: "Personen" },
  { id: "unternehmen", label: "Unternehmen" },
  { id: "beitraege", label: "Beiträge" },
  { id: "gruppen", label: "Gruppen" },
];

export default function FilterChipsBar({ className }: FilterChipsBarProps) {
  const onClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={"w-full flex flex-wrap gap-2 " + (className ?? "")}>
      {chips.map((c) => (
        <Badge key={c.id} variant="secondary" className="cursor-pointer" onClick={() => onClick(c.id)}>
          {c.label}
        </Badge>
      ))}
    </div>
  );
}
