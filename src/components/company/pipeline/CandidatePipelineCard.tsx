import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, FileText, Linkedin } from "lucide-react";

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
    <Card className="p-3 space-y-3 cursor-grab select-none rounded-xl border border-border/70 shadow-sm bg-card">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={p.avatar_url || ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-medium truncate text-primary hover:underline cursor-pointer" onClick={() => onOpen(p.id)}>
            {p.vorname} {p.nachname}
          </div>
          <div className="text-sm text-muted-foreground truncate">{p.headline || p.branche || "Ausbildungsbereich"}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="E-Mail">
          <Mail className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Telefon">
          <Phone className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Dokumente">
          <FileText className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="LinkedIn">
          <Linkedin className="h-4 w-4" />
        </Button>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        {item.unlocked_at ? (
          <Badge variant="secondary">Freigeschaltet</Badge>
        ) : (
          <Badge variant="outline">Gesperrt</Badge>
        )}
        {p.ort && <Badge variant="outline">{p.ort}</Badge>}
        {p.branche && <Badge variant="outline">{p.branche}</Badge>}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => onOpen(p.id)}>Profil öffnen</Button>
        {onRemove && (
          <Button size="sm" variant="ghost" onClick={() => onRemove(item.id)}>Aus Pipeline entfernen</Button>
        )}
      </div>
    </Card>
  );
};
