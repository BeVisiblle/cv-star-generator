import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyNotesPanelProps {
  companyId: string;
}

export function CompanyNotesPanel({ companyId }: CompanyNotesPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");

  const { data: notes } = useQuery({
    queryKey: ["company-notes", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_notes")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addNote = useMutation({
    mutationFn: async (note: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("company_notes").insert({
        company_id: companyId,
        admin_id: user.id,
        note,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-notes", companyId] });
      setNewNote("");
      toast({
        title: "Notiz hinzugefügt",
        description: "Die Notiz wurde erfolgreich gespeichert.",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Admin-Notizen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Neue Notiz hinzufügen..."
            rows={3}
          />
          <Button
            onClick={() => addNote.mutate(newNote)}
            disabled={!newNote.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Notiz hinzufügen
          </Button>
        </div>

        <div className="space-y-3 mt-6">
          {notes?.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-lg border bg-card"
            >
              <p className="text-sm">{note.note}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(note.created_at).toLocaleString("de-DE")}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
