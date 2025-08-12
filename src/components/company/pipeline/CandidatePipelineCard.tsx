import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CandidateNotesDialog } from "./CandidateNotesDialog";
export interface PipelineProfile {
  id: string;
  vorname: string;
  nachname: string;
  ort?: string;
  branche?: string;
  avatar_url?: string;
  headline?: string;
  email?: string;
  telefon?: string;
  cv_url?: string;
}

export interface CompanyCandidateItem {
  id: string; // company_candidates.id
  candidate_id: string;
  stage: string;
  unlocked_at: string | null;
  profiles: PipelineProfile | null;
}

interface StageDef { key: string; title: string }

interface Props {
  item: CompanyCandidateItem;
  onOpen: (profileId: string) => void;
  onRemove?: (rowId: string) => void;
  onStageChange?: (rowId: string, newStage: string) => void;
  stages?: StageDef[];
}

export const CandidatePipelineCard: React.FC<Props> = ({ item, onOpen, onRemove, onStageChange, stages }) => {
  const p = item.profiles;
  const [selectedStage, setSelectedStage] = useState<string>(item.stage);
  const [notesOpen, setNotesOpen] = useState(false);
  if (!p) return null;
  const initials = `${p.vorname?.[0] ?? "?"}${p.nachname?.[0] ?? ""}`;

  const hasEmail = !!p.email;
  const hasPhone = !!p.telefon;

  const handleEmail = () => {
    if (p.email) window.location.href = `mailto:${p.email}`;
  };
  const handlePhone = () => {
    if (p.telefon) window.location.href = `tel:${p.telefon}`;
  };
  const handleCV = () => {
    if (p.cv_url) {
      window.open(p.cv_url, "_blank", "noopener");
    } else {
      window.location.href = `/company/profile/${p.id}#cv`;
    }
  };

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
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="E-Mail" onClick={handleEmail} disabled={!hasEmail}>
                <Mail className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            {!hasEmail && <TooltipContent>Keine E-Mail hinterlegt</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Telefon" onClick={handlePhone} disabled={!hasPhone}>
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            {!hasPhone && <TooltipContent>Keine Telefonnummer hinterlegt</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="CV" onClick={handleCV}>
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>CV ansehen/downloaden</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

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
      <div className="flex items-center gap-2 flex-wrap">
        {stages && onStageChange && (
          <Select
            value={selectedStage}
            onValueChange={(v) => {
              setSelectedStage(v);
              onStageChange(item.id, v);
            }}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Stage wählen" />
            </SelectTrigger>
            <SelectContent className="z-[60] bg-popover border border-border shadow-md">
              {stages.map((s) => (
                <SelectItem key={s.key} value={s.key}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button size="sm" variant="secondary" onClick={() => setNotesOpen(true)}>Notizen</Button>
        <Button size="sm" onClick={() => onOpen(p.id)}>Profil öffnen</Button>

        {onRemove && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost">Aus Pipeline entfernen</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Aus Pipeline entfernen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dieser Kandidat wird aus Ihrer Pipeline gelöscht. Sie können zuvor noch die Stage anpassen.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {stages && (
                <div className="py-2">
                  <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v)}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Stage wählen" />
                    </SelectTrigger>
                    <SelectContent className="z-[60] bg-popover border border-border shadow-md">
                      {stages.map((s) => (
                        <SelectItem key={s.key} value={s.key}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                {onStageChange && (
                  <AlertDialogAction asChild>
                    <Button variant="secondary" onClick={() => onStageChange(item.id, selectedStage)}>Stage speichern</Button>
                  </AlertDialogAction>
                )}
                <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={() => onRemove(item.id)}>Entfernen</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <CandidateNotesDialog open={notesOpen} onOpenChange={setNotesOpen} candidateId={item.candidate_id} />
    </Card>
  );
};
