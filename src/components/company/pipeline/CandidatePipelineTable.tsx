import React from "react";
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

interface StageDef { key: string; title: string }

interface Props {
  items: CompanyCandidateItem[];
  stages: StageDef[];
  onStageChange: (rowId: string, newStage: string) => void;
  onOpen: (profileId: string) => void;
  onRemove: (rowId: string) => void;
}

export const CandidatePipelineTable: React.FC<Props> = ({ items, stages, onStageChange, onOpen, onRemove }) => {
  const stageByKey = Object.fromEntries(stages.map(s => [s.key, s.title]));

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: 56 }}>Profil</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Ort</TableHead>
            <TableHead>Bereich</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Freigeschaltet</TableHead>
            <TableHead style={{ width: 200 }}>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => {
            const p = it.profiles;
            if (!p) return null;
            const initials = `${p.vorname?.[0] ?? "?"}${p.nachname?.[0] ?? ""}`;
            return (
              <TableRow key={it.id}>
                <TableCell>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={p.avatar_url || ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="font-medium truncate">{p.vorname} {p.nachname}</div>
                  <div className="text-sm text-muted-foreground truncate">{p.headline || p.branche || "Ausbildungsbereich"}</div>
                </TableCell>
                <TableCell>{p.ort || "-"}</TableCell>
                <TableCell>{p.branche || "-"}</TableCell>
                <TableCell>
                  <Select value={it.stage} onValueChange={(v) => onStageChange(it.id, v)}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {stages.map(s => (
                        <SelectItem key={s.key} value={s.key}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {it.unlocked_at ? (
                    <Badge variant="secondary">Ja</Badge>
                  ) : (
                    <Badge variant="outline">Nein</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onOpen(p.id)}>Profil</Button>
                    <Button size="sm" variant="ghost" onClick={() => onRemove(it.id)}>Entfernen</Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
