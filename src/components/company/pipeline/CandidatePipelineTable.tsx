import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyCandidateItem } from "./CandidatePipelineCard";
import { CandidateNotesDialog } from "./CandidateNotesDialog";

interface StageDef { key: string; title: string }

interface Props {
  items: CompanyCandidateItem[];
  stages: StageDef[];
  onStageChange: (rowId: string, newStage: string) => void;
  onOpen: (profileId: string) => void;
  onRemove: (rowId: string) => void;
}

export const CandidatePipelineTable: React.FC<Props> = ({ items, stages, onStageChange, onOpen, onRemove }) => {
  const [notesFor, setNotesFor] = useState<string | null>(null);
  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-background" style={{ width: 56 }}></TableHead>
              <TableHead className="sticky left-[56px] z-20 bg-background">Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Job Stage</TableHead>
              <TableHead>Location</TableHead>
              <TableHead style={{ width: 220 }}>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => {
              const p = it.profiles;
              if (!p) return null;
              const initials = `${p.vorname?.[0] ?? "?"}${p.nachname?.[0] ?? ""}`;
              return (
                <TableRow key={it.id}>
                  <TableCell className="sticky left-0 z-10 bg-background">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={p.avatar_url || ""} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="sticky left-[56px] z-10 bg-background">
                    <button className="text-primary hover:underline font-medium truncate" onClick={() => onOpen(p.id)}>
                      {p.vorname} {p.nachname}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate">{p.headline || p.branche || "-"}</TableCell>
                  <TableCell>
                    <Select value={it.stage} onValueChange={(v) => onStageChange(it.id, v)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[60] bg-popover">
                        {stages.map(s => (
                          <SelectItem key={s.key} value={s.key}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="truncate">{p.ort || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onOpen(p.id)}>Profil</Button>
                      <Button size="sm" variant="secondary" onClick={() => setNotesFor(it.candidate_id)}>Notizen</Button>
                      <Button size="sm" variant="ghost" onClick={() => onRemove(it.id)}>Entfernen</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {notesFor && (
        <CandidateNotesDialog open={!!notesFor} onOpenChange={(o) => !o && setNotesFor(null)} candidateId={notesFor} />
      )}
    </div>
  );
};
