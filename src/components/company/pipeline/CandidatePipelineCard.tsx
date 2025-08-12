import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface PipelineProfile {
  id: string;
  vorname: string;
  nachname: string;
  ort?: string;
  branche?: string;
  avatar_url?: string;
  headline?: string;
}

export interface CompanyCandidateItem {
  id: string; // company_candidates.id
  candidate_id: string;
  stage: string;
  unlocked_at: string | null;
  profiles: PipelineProfile | null;
}

interface Props {
  item: CompanyCandidateItem;
  onOpen: (profileId: string) => void;
  onRemove?: (rowId: string) => void;
}

export const CandidatePipelineCard: React.FC<Props> = ({ item, onOpen, onRemove }) => {
  const p = item.profiles;
  if (!p) return null;
  const initials = `${p.vorname?.[0] ?? "?"}${p.nachname?.[0] ?? ""}`;

  return (
    <Card className="p-3 space-y-3 cursor-grab select-none">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={p.avatar_url || ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-medium truncate">{p.vorname} {p.nachname}</div>
          <div className="text-sm text-muted-foreground truncate">{p.headline || p.branche || "Ausbildungsbereich"}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {item.unlocked_at ? (
          <Badge variant="secondary">Unlocked</Badge>
        ) : (
          <Badge variant="outline">Locked</Badge>
        )}
        {p.ort && <Badge variant="outline">{p.ort}</Badge>}
        {p.branche && <Badge variant="outline">{p.branche}</Badge>}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => onOpen(p.id)}>Profil öffnen</Button>
        {onRemove && (
          <Button size="sm" variant="ghost" onClick={() => onRemove(item.id)}>Aus Pipeline entfernen</Button>
        )}
      </div>
    </Card>
  );
};
