import React from "react";
import { Card } from "@/components/ui/card";
import { Link as LinkIcon, Users2, Building2, FileText, Hash } from "lucide-react";

interface AnchorLinkProps {
  id: string;
  icon: React.ReactNode;
  label: string;
}

function AnchorLink({ id, icon, label }: AnchorLinkProps) {
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <a href={`#${id}`} onClick={onClick} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted/60">
      {icon}
      <span>{label}</span>
    </a>
  );
}

export default function LeftOnThisPage() {
  return (
    <Card className="p-3 rounded-2xl">
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        <LinkIcon className="h-4 w-4" /> Auf dieser Seite
      </div>
      <div className="flex flex-col gap-1">
        <AnchorLink id="personen" icon={<Users2 className="h-4 w-4" />} label="Personen" />
        <AnchorLink id="unternehmen" icon={<Building2 className="h-4 w-4" />} label="Unternehmen" />
        <AnchorLink id="beitraege" icon={<FileText className="h-4 w-4" />} label="Beiträge" />
        <AnchorLink id="gruppen" icon={<Hash className="h-4 w-4" />} label="Gruppen" />
      </div>
    </Card>
  );
}
